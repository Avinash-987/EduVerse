/**
 * LiveClass.jsx — Fully functional real-time video meeting page
 *
 * WHY IT WAS BROKEN:
 * 1. The original component was 100% static / mock UI — no WebRTC, no Socket.IO,
 *    no getUserMedia, no peer connections, no signaling, no remote streams.
 * 2. The server had no Socket.IO setup at all (plain app.listen, no http.createServer).
 * 3. Mic/camera toggle buttons only flipped React state booleans — never touched real MediaStreamTracks.
 * 4. Screen share button did nothing.
 * 5. No cleanup of tracks, connections, or socket listeners on unmount.
 *
 * HOW IT WAS FIXED:
 * - Server: Replaced app.listen with http.createServer + Socket.IO for signaling
 * - Client: Full mesh-topology WebRTC with one RTCPeerConnection per remote participant
 * - getUserMedia acquires real local media; permission-denied and missing-device errors handled
 * - Offer/answer/ICE exchange scoped per room via Socket.IO
 * - Peer connections stored in a useRef Map to avoid stale closures and rerender loops
 * - ICE candidates are queued if remote description isn't set yet
 * - Mic/camera toggles actually enable/disable the real audio/video tracks
 * - Screen share replaces the video track on all peer connections, and restores camera on stop
 * - Cleanup on unmount: stop all tracks, close all peer connections, leave socket room
 * - Chat and hand-raise use socket events scoped to the room
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiVideoCamera,
    HiMicrophone,
    HiDesktopComputer,
    HiChat,
    HiHand,
    HiPhone,
    HiVolumeOff,
} from 'react-icons/hi';
import { io } from 'socket.io-client';
import { useAuth } from '../../contexts/AuthContext';
import { SOCKET_URL } from '../../utils/constants';

// ─── STUN/TURN Configuration ─────────────────────────────────────────────────
// For local/dev: Google's free STUN server. For production add your TURN server.
const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        // TODO: Add TURN server for production NAT traversal:
        // { urls: 'turn:your-turn-server.com:3478', username: 'user', credential: 'pass' },
    ],
};

export default function LiveClass() {
    const { user } = useAuth();
    const navigate = useNavigate();

    // ─── Meeting State ────────────────────────────────────────────────────
    const [joined, setJoined] = useState(false);
    const [roomId, setRoomId] = useState('');
    const [micOn, setMicOn] = useState(true);
    const [videoOn, setVideoOn] = useState(true);
    const [chatOpen, setChatOpen] = useState(false);
    const [handRaised, setHandRaised] = useState(false);
    const [screenSharing, setScreenSharing] = useState(false);
    const [participantCount, setParticipantCount] = useState(1);
    const [mediaError, setMediaError] = useState('');

    // Participants: Map<socketId, { userId, userName, stream, micOn, videoOn }>
    const [participants, setParticipants] = useState(new Map());

    // Chat messages
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const chatEndRef = useRef(null);

    // ─── Refs (avoid stale closures) ──────────────────────────────────────
    const socketRef = useRef(null);
    const localStreamRef = useRef(null);
    const screenStreamRef = useRef(null);
    const localVideoRef = useRef(null);
    // peerConnections: Map<socketId, RTCPeerConnection>
    const peerConnectionsRef = useRef(new Map());
    // ICE candidate queues for peers whose remote description isn't set yet
    const iceCandidateQueues = useRef(new Map());
    // Track if component is mounted
    const mountedRef = useRef(true);

    // ─── Acquire Local Media ──────────────────────────────────────────────
    const getLocalMedia = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });
            localStreamRef.current = stream;
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
            setMediaError('');
            return stream;
        } catch (err) {
            console.error('[Media] getUserMedia failed:', err.name, err.message);
            // Try audio-only fallback
            try {
                const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
                localStreamRef.current = audioStream;
                setVideoOn(false);
                setMediaError('Camera not available. Joined with audio only.');
                return audioStream;
            } catch (audioErr) {
                setMediaError('Could not access camera or microphone. Please check permissions.');
                console.error('[Media] Audio fallback also failed:', audioErr.name);
                return null;
            }
        }
    }, []);

    // ─── Create Peer Connection ───────────────────────────────────────────
    const createPeerConnection = useCallback((remoteSocketId, remoteInfo) => {
        // Prevent duplicates
        if (peerConnectionsRef.current.has(remoteSocketId)) {
            peerConnectionsRef.current.get(remoteSocketId).close();
            peerConnectionsRef.current.delete(remoteSocketId);
        }

        const pc = new RTCPeerConnection(ICE_SERVERS);

        // Add local tracks to the connection
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => {
                pc.addTrack(track, localStreamRef.current);
            });
        }

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
            if (event.candidate && socketRef.current) {
                socketRef.current.emit('ice-candidate', {
                    to: remoteSocketId,
                    candidate: event.candidate,
                });
            }
        };

        // Handle remote stream
        pc.ontrack = (event) => {
            const [remoteStream] = event.streams;
            if (!remoteStream) return;
            if (!mountedRef.current) return;
            setParticipants((prev) => {
                const updated = new Map(prev);
                const existing = updated.get(remoteSocketId) || {};
                updated.set(remoteSocketId, {
                    ...existing,
                    userId: remoteInfo?.userId || existing.userId || '',
                    userName: remoteInfo?.userName || existing.userName || 'Participant',
                    stream: remoteStream,
                    micOn: existing.micOn !== undefined ? existing.micOn : true,
                    videoOn: existing.videoOn !== undefined ? existing.videoOn : true,
                });
                return updated;
            });
        };

        // Connection state logging
        pc.onconnectionstatechange = () => {
            console.log(`[WebRTC] ${remoteSocketId} connection state: ${pc.connectionState}`);
            if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
                console.warn(`[WebRTC] Peer ${remoteSocketId} connection ${pc.connectionState}`);
            }
        };

        pc.oniceconnectionstatechange = () => {
            console.log(`[WebRTC] ${remoteSocketId} ICE state: ${pc.iceConnectionState}`);
        };

        peerConnectionsRef.current.set(remoteSocketId, pc);
        return pc;
    }, []);

    // ─── Process Queued ICE Candidates ────────────────────────────────────
    const processIceCandidateQueue = useCallback(async (socketId) => {
        const queue = iceCandidateQueues.current.get(socketId);
        const pc = peerConnectionsRef.current.get(socketId);
        if (!queue || !pc) return;
        for (const candidate of queue) {
            try {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (err) {
                console.error('[WebRTC] Failed to add queued ICE candidate:', err);
            }
        }
        iceCandidateQueues.current.delete(socketId);
    }, []);

    // ─── Join Meeting ─────────────────────────────────────────────────────
    const joinMeeting = useCallback(async () => {
        if (!roomId.trim()) return;

        const stream = await getLocalMedia();

        const token = localStorage.getItem('eduverse-token');
        const socket = io(SOCKET_URL || window.location.origin, {
            auth: { token },
            transports: ['websocket', 'polling'],
        });
        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('[Socket] Connected:', socket.id);
            socket.emit('join-room', {
                roomId: roomId.trim(),
                userName: user?.name || 'User',
            });
        });

        socket.on('connect_error', (err) => {
            console.error('[Socket] Connection error:', err.message);
            setMediaError('Could not connect to meeting server. Please try again.');
        });

        // ── Receive list of existing participants ─────────────────────────
        socket.on('room-participants', async (existingParticipants) => {
            console.log('[Socket] Existing participants:', existingParticipants.length);
            for (const p of existingParticipants) {
                // We are the newcomer → we create offers to each existing participant
                const pc = createPeerConnection(p.socketId, p);
                try {
                    const offer = await pc.createOffer();
                    await pc.setLocalDescription(offer);
                    socket.emit('offer', { to: p.socketId, offer });
                    console.log(`[WebRTC] Sent offer to ${p.socketId}`);
                } catch (err) {
                    console.error('[WebRTC] Error creating offer:', err);
                }
            }
        });

        // ── A new user joined after us ────────────────────────────────────
        socket.on('user-joined', ({ socketId: remoteSocketId, userId, userName }) => {
            console.log(`[Socket] User joined: ${userName} (${remoteSocketId})`);
            // Don't create offer here — the new user will send us an offer
            // Just prepare the participant entry
            if (!mountedRef.current) return;
            setParticipants((prev) => {
                const updated = new Map(prev);
                if (!updated.has(remoteSocketId)) {
                    updated.set(remoteSocketId, {
                        userId,
                        userName,
                        stream: null,
                        micOn: true,
                        videoOn: true,
                    });
                }
                return updated;
            });
        });

        // ── Receive an offer ──────────────────────────────────────────────
        socket.on('offer', async ({ from, offer }) => {
            console.log(`[WebRTC] Received offer from ${from}`);
            const pc = createPeerConnection(from, null);
            try {
                await pc.setRemoteDescription(new RTCSessionDescription(offer));
                await processIceCandidateQueue(from);
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                socket.emit('answer', { to: from, answer });
                console.log(`[WebRTC] Sent answer to ${from}`);
            } catch (err) {
                console.error('[WebRTC] Error handling offer:', err);
            }
        });

        // ── Receive an answer ─────────────────────────────────────────────
        socket.on('answer', async ({ from, answer }) => {
            console.log(`[WebRTC] Received answer from ${from}`);
            const pc = peerConnectionsRef.current.get(from);
            if (!pc) return;
            try {
                await pc.setRemoteDescription(new RTCSessionDescription(answer));
                await processIceCandidateQueue(from);
            } catch (err) {
                console.error('[WebRTC] Error setting remote description:', err);
            }
        });

        // ── Receive ICE candidate ─────────────────────────────────────────
        socket.on('ice-candidate', async ({ from, candidate }) => {
            const pc = peerConnectionsRef.current.get(from);
            if (!pc) return;
            // Queue if remote description not yet set
            if (!pc.remoteDescription || !pc.remoteDescription.type) {
                if (!iceCandidateQueues.current.has(from)) {
                    iceCandidateQueues.current.set(from, []);
                }
                iceCandidateQueues.current.get(from).push(candidate);
                return;
            }
            try {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (err) {
                console.error('[WebRTC] Error adding ICE candidate:', err);
            }
        });

        // ── User left ─────────────────────────────────────────────────────
        socket.on('user-left', ({ socketId: remoteSocketId }) => {
            console.log(`[Socket] User left: ${remoteSocketId}`);
            const pc = peerConnectionsRef.current.get(remoteSocketId);
            if (pc) {
                pc.close();
                peerConnectionsRef.current.delete(remoteSocketId);
            }
            iceCandidateQueues.current.delete(remoteSocketId);
            if (!mountedRef.current) return;
            setParticipants((prev) => {
                const updated = new Map(prev);
                updated.delete(remoteSocketId);
                return updated;
            });
        });

        // ── Participant count ─────────────────────────────────────────────
        socket.on('participant-count', (count) => {
            if (mountedRef.current) setParticipantCount(count);
        });

        // ── Track toggle from remote ──────────────────────────────────────
        socket.on('track-toggle', ({ socketId: remoteSocketId, kind, enabled }) => {
            if (!mountedRef.current) return;
            setParticipants((prev) => {
                const updated = new Map(prev);
                const p = updated.get(remoteSocketId);
                if (p) {
                    if (kind === 'audio') p.micOn = enabled;
                    if (kind === 'video') p.videoOn = enabled;
                    updated.set(remoteSocketId, { ...p });
                }
                return updated;
            });
        });

        // ── Screen share notification ─────────────────────────────────────
        socket.on('screen-share', ({ socketId: remoteSocketId, sharing }) => {
            console.log(`[Socket] ${remoteSocketId} screen share: ${sharing}`);
        });

        // ── Hand raise ────────────────────────────────────────────────────
        socket.on('hand-raise', ({ socketId: remoteSocketId, raised }) => {
            if (!mountedRef.current) return;
            setParticipants((prev) => {
                const updated = new Map(prev);
                const p = updated.get(remoteSocketId);
                if (p) {
                    updated.set(remoteSocketId, { ...p, handRaised: raised });
                }
                return updated;
            });
        });

        // ── Meeting chat ──────────────────────────────────────────────────
        socket.on('meeting-chat', (msg) => {
            if (!mountedRef.current) return;
            setChatMessages((prev) => [...prev, msg]);
        });

        setJoined(true);
    }, [roomId, user, getLocalMedia, createPeerConnection, processIceCandidateQueue]);

    // ─── Scroll chat to bottom ────────────────────────────────────────────
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    // ─── Sync local video ref ─────────────────────────────────────────────
    useEffect(() => {
        if (localVideoRef.current && localStreamRef.current) {
            localVideoRef.current.srcObject = localStreamRef.current;
        }
    }, [joined]);

    // ─── Toggle Mic ───────────────────────────────────────────────────────
    const toggleMic = useCallback(() => {
        const stream = localStreamRef.current;
        if (!stream) return;
        const audioTrack = stream.getAudioTracks()[0];
        if (audioTrack) {
            audioTrack.enabled = !audioTrack.enabled;
            setMicOn(audioTrack.enabled);
            socketRef.current?.emit('track-toggle', {
                roomId: roomId.trim(),
                kind: 'audio',
                enabled: audioTrack.enabled,
            });
        }
    }, [roomId]);

    // ─── Toggle Camera ────────────────────────────────────────────────────
    const toggleCamera = useCallback(() => {
        const stream = localStreamRef.current;
        if (!stream) return;
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
            videoTrack.enabled = !videoTrack.enabled;
            setVideoOn(videoTrack.enabled);
            socketRef.current?.emit('track-toggle', {
                roomId: roomId.trim(),
                kind: 'video',
                enabled: videoTrack.enabled,
            });
        }
    }, [roomId]);

    // ─── Screen Share ─────────────────────────────────────────────────────
    const stopScreenShare = useCallback(() => {
        // Stop screen share tracks
        if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach((t) => t.stop());
            screenStreamRef.current = null;
        }
        // Replace screen track with camera track on all peer connections
        const cameraTrack = localStreamRef.current?.getVideoTracks()[0];
        if (cameraTrack) {
            peerConnectionsRef.current.forEach((pc) => {
                const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
                if (sender) sender.replaceTrack(cameraTrack);
            });
        }
        // Restore local video to camera stream
        if (localVideoRef.current && localStreamRef.current) {
            localVideoRef.current.srcObject = localStreamRef.current;
        }
        setScreenSharing(false);
        socketRef.current?.emit('screen-share', { roomId: roomId.trim(), sharing: false });
    }, [roomId]);

    const toggleScreenShare = useCallback(async () => {
        if (screenSharing) {
            stopScreenShare();
        } else {
            try {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
                screenStreamRef.current = screenStream;
                const screenTrack = screenStream.getVideoTracks()[0];

                // Replace camera track with screen track on all peer connections
                peerConnectionsRef.current.forEach((pc) => {
                    const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
                    if (sender) sender.replaceTrack(screenTrack);
                });

                // Show screen share in local video preview
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = screenStream;
                }

                // Handle user stopping share via browser's native "Stop sharing" button
                // Use stopScreenShare directly to avoid stale closure issues
                screenTrack.onended = () => {
                    stopScreenShare();
                };

                setScreenSharing(true);
                socketRef.current?.emit('screen-share', { roomId: roomId.trim(), sharing: true });
            } catch (err) {
                // User cancelled the screen share dialog — not an error
                if (err.name !== 'NotAllowedError') {
                    console.error('[Screen Share] Error:', err);
                }
            }
        }
    }, [screenSharing, roomId, stopScreenShare]);

    // ─── Hand Raise ───────────────────────────────────────────────────────
    const toggleHandRaise = useCallback(() => {
        const newState = !handRaised;
        setHandRaised(newState);
        socketRef.current?.emit('hand-raise', { roomId: roomId.trim(), raised: newState });
    }, [handRaised, roomId]);

    // ─── Send Chat Message ────────────────────────────────────────────────
    const sendChatMessage = useCallback(
        (e) => {
            e.preventDefault();
            if (!chatInput.trim() || !socketRef.current) return;
            socketRef.current.emit('meeting-chat', { roomId: roomId.trim(), message: chatInput.trim() });
            setChatInput('');
        },
        [chatInput, roomId]
    );

    // ─── Leave Meeting ────────────────────────────────────────────────────
    const leaveMeeting = useCallback(() => {
        // Stop all local tracks
        localStreamRef.current?.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
        screenStreamRef.current?.getTracks().forEach((t) => t.stop());
        screenStreamRef.current = null;

        // Close all peer connections
        peerConnectionsRef.current.forEach((pc) => pc.close());
        peerConnectionsRef.current.clear();
        iceCandidateQueues.current.clear();

        // Leave socket room and disconnect
        if (socketRef.current) {
            socketRef.current.emit('leave-room', { roomId: roomId.trim() });
            socketRef.current.disconnect();
            socketRef.current = null;
        }

        setJoined(false);
        setParticipants(new Map());
        setChatMessages([]);
        setParticipantCount(1);
        setScreenSharing(false);
        setHandRaised(false);
        setMediaError('');
    }, [roomId]);

    // ─── Cleanup on Unmount ───────────────────────────────────────────────
    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
            // Full cleanup
            localStreamRef.current?.getTracks().forEach((t) => t.stop());
            screenStreamRef.current?.getTracks().forEach((t) => t.stop());
            peerConnectionsRef.current.forEach((pc) => pc.close());
            peerConnectionsRef.current.clear();
            if (socketRef.current) {
                socketRef.current.emit('leave-room', { roomId: roomId.trim() });
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [roomId]);

    // ─── Get initials from name ───────────────────────────────────────────
    const getInitials = (name) => {
        if (!name) return '?';
        return name
            .split(' ')
            .map((w) => w[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // ─────────────────────────────────────────────────────────────────────
    //  RENDER: Pre-join Screen
    // ─────────────────────────────────────────────────────────────────────
    if (!joined) {
        return (
            <div className="page-transition flex items-center justify-center" style={{ minHeight: 'calc(100vh - 7rem)' }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card max-w-md w-full text-center"
                >
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white mx-auto mb-6">
                        {getInitials(user?.name)}
                    </div>
                    <h1 className="text-2xl font-bold text-text-primary mb-2">Join Live Class</h1>
                    <p className="text-text-muted text-sm mb-6">
                        Enter a meeting code to join or start a live class session
                    </p>
                    <input
                        type="text"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                        placeholder="Enter meeting code..."
                        className="input-field mb-4 text-center text-lg"
                        onKeyDown={(e) => e.key === 'Enter' && joinMeeting()}
                    />
                    {mediaError && (
                        <p className="text-red-500 text-sm mb-4">{mediaError}</p>
                    )}
                    <button
                        onClick={joinMeeting}
                        disabled={!roomId.trim()}
                        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Join Meeting
                    </button>
                    <p className="text-text-muted text-xs mt-4">
                        Share the meeting code with other participants to join the same room
                    </p>
                </motion.div>
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────────────────
    //  RENDER: Active Meeting
    // ─────────────────────────────────────────────────────────────────────
    const participantsArray = Array.from(participants.entries());

    return (
        <div className="page-transition flex flex-col" style={{ height: 'calc(100vh - 10rem)' }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-xl font-bold text-text-primary">
                        Live Class: {roomId}
                    </h1>
                    <p className="text-sm text-text-muted">
                        {user?.name} • {participantCount} participant{participantCount !== 1 ? 's' : ''}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 text-sm font-medium">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> LIVE
                    </span>
                </div>
            </div>

            <div className="flex-1 flex gap-4 overflow-hidden">
                {/* Video Area */}
                <div className="flex-1 flex flex-col">
                    <div className="flex-1 overflow-hidden relative rounded-2xl" style={{ background: '#111827', padding: '0.5rem' }}>
                        {/* Video Grid */}
                        <div
                            className="w-full h-full grid gap-2"
                            style={{
                                gridTemplateColumns:
                                    participantsArray.length === 0
                                        ? '1fr'
                                        : participantsArray.length <= 1
                                            ? '1fr 1fr'
                                            : participantsArray.length <= 3
                                                ? 'repeat(2, 1fr)'
                                                : 'repeat(3, 1fr)',
                                gridAutoRows: '1fr',
                            }}
                        >
                            {/* Self Video Tile */}
                            <div className="relative rounded-xl overflow-hidden min-h-0" style={{ background: '#1f2937' }}>
                                <video
                                    ref={localVideoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    disablePictureInPicture
                                    className="absolute inset-0 w-full h-full object-cover"
                                    style={{
                                        transform: screenSharing ? 'none' : 'scaleX(-1)',
                                        display: (videoOn || screenSharing) ? 'block' : 'none',
                                    }}
                                />
                                {!videoOn && !screenSharing && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-2xl font-bold mb-2">
                                            {getInitials(user?.name)}
                                        </div>
                                        <p className="text-sm font-medium">{user?.name || 'You'}</p>
                                    </div>
                                )}
                                {handRaised && (
                                    <div className="absolute top-2 right-2 z-10 text-2xl" style={{ animation: 'bounce 1s infinite' }}>✋</div>
                                )}
                                <div className="absolute bottom-2 left-2 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-white text-xs flex items-center gap-1 z-10">
                                    {!micOn && <HiVolumeOff className="text-red-400" />}
                                    You {screenSharing && '(Sharing)'}
                                </div>
                            </div>

                            {/* Remote Video Tiles */}
                            {participantsArray.map(([socketId, p]) => (
                                <RemoteVideoTile
                                    key={socketId}
                                    participant={p}
                                    socketId={socketId}
                                />
                            ))}
                        </div>

                        {/* Participant Count Overlay */}
                        <div className="absolute top-4 left-4 px-3 py-1 rounded-lg bg-black/40 backdrop-blur-sm text-white text-sm z-10">
                            👥 {participantCount} participant{participantCount !== 1 ? 's' : ''}
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-center gap-3 mt-4">
                        <button
                            onClick={toggleMic}
                            title={micOn ? 'Mute Microphone' : 'Unmute Microphone'}
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${micOn ? 'glass text-text-primary hover:bg-surface-2' : 'bg-red-500 text-white'
                                }`}
                        >
                            {micOn ? <HiMicrophone className="text-lg" /> : <HiVolumeOff className="text-lg" />}
                        </button>
                        <button
                            onClick={toggleCamera}
                            title={videoOn ? 'Turn Off Camera' : 'Turn On Camera'}
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${videoOn ? 'glass text-text-primary hover:bg-surface-2' : 'bg-red-500 text-white'
                                }`}
                        >
                            {videoOn ? (
                                <HiVideoCamera className="text-lg" />
                            ) : (
                                <HiVideoCamera className="text-lg" />
                            )}
                        </button>
                        <button
                            onClick={toggleScreenShare}
                            title={screenSharing ? 'Stop Sharing' : 'Share Screen'}
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${screenSharing
                                ? 'bg-blue-500 text-white'
                                : 'glass text-text-primary hover:bg-surface-2'
                                }`}
                        >
                            <HiDesktopComputer className="text-lg" />
                        </button>
                        <button
                            onClick={toggleHandRaise}
                            title={handRaised ? 'Lower Hand' : 'Raise Hand'}
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${handRaised ? 'bg-amber-500 text-white' : 'glass text-text-primary hover:bg-surface-2'
                                }`}
                        >
                            <HiHand className="text-lg" />
                        </button>
                        <button
                            onClick={() => setChatOpen(!chatOpen)}
                            title={chatOpen ? 'Close Chat' : 'Open Chat'}
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${chatOpen ? 'bg-primary-500 text-white' : 'glass text-text-primary hover:bg-surface-2'
                                }`}
                        >
                            <HiChat className="text-lg" />
                        </button>
                        <button
                            onClick={leaveMeeting}
                            title="Leave Meeting"
                            className="w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-all"
                        >
                            <HiPhone className="text-lg rotate-[135deg]" />
                        </button>
                    </div>

                    {mediaError && (
                        <p className="text-center text-amber-500 text-xs mt-2">{mediaError}</p>
                    )}
                </div>

                {/* Chat Panel */}
                <AnimatePresence>
                    {chatOpen && (
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 320, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            className="glass-card !p-0 flex flex-col shrink-0 overflow-hidden"
                        >
                            <div className="p-3 border-b border-border">
                                <h3 className="font-semibold text-sm text-text-primary">Meeting Chat</h3>
                            </div>
                            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                                {chatMessages.length === 0 ? (
                                    <p className="text-center text-text-muted text-xs py-8">
                                        No messages yet. Say hello! 👋
                                    </p>
                                ) : (
                                    chatMessages.map((m, i) => {
                                        const isSelf = m.userId === user?._id;
                                        return (
                                            <div key={i} className="text-sm">
                                                <span
                                                    className={`font-medium ${isSelf ? 'text-violet-500' : 'text-primary-600'
                                                        }`}
                                                >
                                                    {isSelf ? 'You' : m.userName}
                                                </span>
                                                <span className="text-text-muted text-[10px] ml-2">
                                                    {new Date(m.timestamp).toLocaleTimeString('en-IN', {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </span>
                                                <p className="text-text-secondary mt-0.5">{m.message}</p>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={chatEndRef} />
                            </div>
                            <form onSubmit={sendChatMessage} className="p-3 border-t border-border flex gap-2">
                                <input
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    placeholder="Type a message..."
                                    className="input-field !py-2 text-sm flex-1"
                                />
                                <button
                                    type="submit"
                                    disabled={!chatInput.trim()}
                                    className="btn-primary !px-3 !py-2 text-sm disabled:opacity-50"
                                >
                                    Send
                                </button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

// ─── Remote Video Tile Component ──────────────────────────────────────────────
function RemoteVideoTile({ participant, socketId }) {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current && participant.stream) {
            videoRef.current.srcObject = participant.stream;
        }
    }, [participant.stream]);

    const getInitials = (name) => {
        if (!name) return '?';
        return name
            .split(' ')
            .map((w) => w[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="relative rounded-xl overflow-hidden min-h-0" style={{ background: '#1f2937' }}>
            <video
                ref={videoRef}
                autoPlay
                playsInline
                disablePictureInPicture
                className="absolute inset-0 w-full h-full object-cover"
                style={{ display: participant.videoOn ? 'block' : 'none' }}
            />
            {!participant.videoOn && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-2xl font-bold mb-2">
                        {getInitials(participant.userName)}
                    </div>
                    <p className="text-sm font-medium">{participant.userName}</p>
                </div>
            )}
            {participant.handRaised && (
                <div className="absolute top-2 right-2 z-10 text-2xl" style={{ animation: 'bounce 1s infinite' }}>✋</div>
            )}
            <div className="absolute bottom-2 left-2 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-white text-xs flex items-center gap-1 z-10">
                {!participant.micOn && <HiVolumeOff className="text-red-400" />}
                {participant.userName || 'Participant'}
            </div>
        </div>
    );
}
