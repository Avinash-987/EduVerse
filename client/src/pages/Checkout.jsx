import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiLockClosed, HiShieldCheck, HiCreditCard, HiQrcode,
    HiLibrary, HiChevronLeft, HiCheckCircle, HiCash,
    HiDesktopComputer, HiArrowRight, HiRefresh
} from 'react-icons/hi';
import api from '../services/api';
import { formatINR } from '../utils/constants';
import { useAuth } from '../contexts/AuthContext';

export default function Checkout() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [method, setMethod] = useState('upi'); // upi, card, netbanking

    // Form states
    const [upiId, setUpiId] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [nameOnCard, setNameOnCard] = useState('');

    // Processing state
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const res = await api.get(`/ courses / ${id} `);
                if (res.data.success) {
                    setCourse(res.data.course);
                }
            } catch (err) {
                setError('Failed to load course details.');
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [id]);

    const handlePayment = async (e) => {
        e?.preventDefault();
        setError(null);
        setProcessing(true);

        try {
            // Step 1: Tell backend to generate a real Razorpay Order
            const res = await api.post('/payments/create-checkout', { courseId: id });

            if (!res.data.success) {
                throw new Error(res.data.message);
            }

            const { orderId, amount: rzpAmount, currency, paymentId, key_id } = res.data;

            // Step 2: Dynamically load Razorpay SDK script
            const loadScript = () => new Promise((resolve) => {
                const script = document.createElement('script');
                script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                script.onload = () => resolve(true);
                script.onerror = () => resolve(false);
                document.body.appendChild(script);
            });

            const scriptLoaded = await loadScript();
            if (!scriptLoaded) {
                throw new Error('Razorpay SDK failed to load. Are you offline?');
            }

            // Step 3: Initialize actual Razorpay Popup
            const options = {
                key: key_id,
                amount: rzpAmount,
                currency: currency,
                name: "EduVerse Learnings",
                description: `Purchase: ${course.title} `,
                image: "https://uxwing.com/wp-content/themes/uxwing/download/education-school/graduation-cap-icon.png",
                order_id: orderId,
                handler: async function (response) {
                    try {
                        // Step 4: Verify cryptographic signature on the backend
                        setProcessing(true); // show loader again while verifying
                        const verifyRes = await api.post('/payments/verify', {
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpayOrderId: response.razorpay_order_id,
                            razorpaySignature: response.razorpay_signature,
                            paymentId: paymentId
                        });

                        if (verifyRes.data.success) {
                            setSuccess(true);
                            setTimeout(() => navigate('/student/dashboard?payment=success'), 2000);
                        }
                    } catch (verifyErr) {
                        setError(verifyErr.response?.data?.message || 'Payment verification failed. Security Alert.');
                    } finally {
                        setProcessing(false);
                    }
                },
                prefill: {
                    name: user?.name || "Student",
                    email: user?.email || "",
                    contact: user?.phone || ""
                },
                theme: {
                    color: "#6366f1" // Primary indigo
                }
            };

            const rzpClient = new window.Razorpay(options);

            rzpClient.on('payment.failed', function (response) {
                setError(`Payment Failed: ${response.error.description} `);
                setProcessing(false);
            });

            rzpClient.open();

            // Once popup is open, remove full-screen processing overlay
            setProcessing(false);

        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Payment initialization failed.');
            setProcessing(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-surface">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!course) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-surface">
            <h2 className="text-2xl font-bold mb-4">Course not found</h2>
            <Link to="/courses" className="btn-primary">Browse Courses</Link>
        </div>
    );

    const amount = course.discountPrice || course.price;
    const taxes = Math.round(amount * 0.18); // 18% GST simulation
    const total = amount + taxes;

    return (
        <div className="min-h-screen bg-surface-2 pt-24 pb-12 px-4">
            <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">

                {/* Left Side - Order Summary (35%) */}
                <div className="lg:w-[35%] w-full order-2 lg:order-1">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-text-muted hover:text-text-primary mb-6 transition-colors">
                        <HiChevronLeft /> Back to Course
                    </button>

                    <div className="glass-card shadow-xl sticky top-24">
                        <h2 className="text-xl font-bold border-b border-border pb-4 mb-4">Order Summary</h2>

                        <div className="flex gap-4 mb-6">
                            <div className="w-24 h-16 rounded-lg overflow-hidden shrink-0">
                                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-text-primary line-clamp-2 text-sm leading-snug">{course.title}</h3>
                                <p className="text-xs text-text-muted mt-1">{course.instructor?.name || 'Instructor'}</p>
                            </div>
                        </div>

                        <div className="space-y-3 text-sm border-b border-border pb-4 mb-4">
                            <div className="flex justify-between text-text-secondary">
                                <span>Course Price</span>
                                <span>{formatINR(amount)}</span>
                            </div>
                            <div className="flex justify-between text-text-secondary">
                                <span>GST (18%)</span>
                                <span>{formatINR(taxes)}</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-end mb-6">
                            <div>
                                <p className="text-text-muted text-xs">Total Amount</p>
                                <p className="text-2xl font-bold gradient-text">{formatINR(total)}</p>
                            </div>
                        </div>

                        <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-3 rounded-xl flex items-start gap-3 text-sm mt-4">
                            <HiShieldCheck className="text-xl shrink-0 mt-0.5" />
                            <p>You're saving <strong>{formatINR(taxes * 1.5)}</strong> on this order via special offers!</p>
                        </div>
                    </div>
                </div>

                {/* Right Side - Payment Gateway (65%) */}
                <div className="lg:w-[65%] w-full order-1 lg:order-2">
                    <div className="glass-card shadow-xl p-0 overflow-hidden relative">

                        {/* Gateway Header */}
                        <div className="bg-surface p-6 border-b border-border flex justify-between items-center relative z-10">
                            <div>
                                <h1 className="text-xl font-bold text-text-primary">Secure Checkout</h1>
                                <p className="text-xs text-text-muted mt-1 flex items-center gap-1">
                                    <HiLockClosed className="text-green-500" /> 256-bit SSL Encryption
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-text-muted">Payment to</p>
                                <p className="font-bold text-primary-600">EduVerse Learnings Pvt Ltd</p>
                            </div>
                        </div>

                        {/* Processing & Success Overlay */}
                        <AnimatePresence>
                            {(processing || success) && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="absolute inset-0 z-50 bg-surface/90 backdrop-blur-sm flex flex-col items-center justify-center"
                                >
                                    {success ? (
                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
                                            <div className="w-20 h-20 rounded-full bg-green-500 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/30">
                                                <HiCheckCircle className="text-5xl" />
                                            </div>
                                            <h2 className="text-2xl font-bold text-text-primary mb-2">Payment Successful!</h2>
                                            <p className="text-text-secondary">Redirecting you to the dashboard...</p>
                                        </motion.div>
                                    ) : (
                                        <div className="text-center">
                                            <div className="relative w-20 h-20 mx-auto mb-6">
                                                <div className="absolute inset-0 border-4 border-primary-200 dark:border-primary-900 rounded-full"></div>
                                                <div className="absolute inset-0 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                                                <HiLockClosed className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl text-primary-500" />
                                            </div>
                                            <h2 className="text-xl font-bold text-text-primary mb-2">Processing Payment...</h2>
                                            <p className="text-text-muted text-sm">Please do not close this window or hit back.</p>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {error && (
                            <div className="mx-6 mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 text-red-600 text-sm rounded-xl">
                                {error}
                            </div>
                        )}

                        <div className="flex flex-col md:flex-row min-h-[400px]">
                            {/* Payment Methods Sidebar */}
                            <div className="w-full md:w-48 border-b md:border-b-0 md:border-r border-border bg-surface-2/50">
                                <button
                                    onClick={() => setMethod('upi')}
                                    className={`w - full flex items - center gap - 3 px - 6 py - 4 text - sm transition - colors border - l - 4 ${method === 'upi' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10 text-primary-600 font-semibold' : 'border-transparent text-text-secondary hover:bg-surface'} `}
                                >
                                    <HiQrcode className="text-lg" /> UPI / QR
                                </button>
                                <button
                                    onClick={() => setMethod('card')}
                                    className={`w - full flex items - center gap - 3 px - 6 py - 4 text - sm transition - colors border - l - 4 ${method === 'card' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10 text-primary-600 font-semibold' : 'border-transparent text-text-secondary hover:bg-surface'} `}
                                >
                                    <HiCreditCard className="text-lg" /> Credit/Debit Card
                                </button>
                                <button
                                    onClick={() => setMethod('netbanking')}
                                    className={`w - full flex items - center gap - 3 px - 6 py - 4 text - sm transition - colors border - l - 4 ${method === 'netbanking' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10 text-primary-600 font-semibold' : 'border-transparent text-text-secondary hover:bg-surface'} `}
                                >
                                    <HiLibrary className="text-lg" /> Net Banking
                                </button>
                                <button
                                    onClick={() => setMethod('wallets')}
                                    className={`w - full flex items - center gap - 3 px - 6 py - 4 text - sm transition - colors border - l - 4 ${method === 'wallets' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10 text-primary-600 font-semibold' : 'border-transparent text-text-secondary hover:bg-surface'} `}
                                >
                                    <HiCash className="text-lg" /> Wallets
                                </button>
                            </div>

                            {/* Payment Method Content */}
                            <div className="flex-1 p-6 relative">

                                {/* UPI / QR */}
                                {method === 'upi' && (
                                    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                        <h3 className="font-semibold text-text-primary mb-4">Pay via UPI</h3>

                                        <div className="flex flex-col sm:flex-row gap-8 items-center justify-center p-6 border rounded-xl border-border bg-surface-2">
                                            <div className="flex flex-col items-center">
                                                <div className="w-32 h-32 bg-white p-2 rounded-xl mb-3 border border-border flex items-center justify-center shadow-sm">
                                                    {/* Fake QR Graphic using an icon layout */}
                                                    <div className="grid grid-cols-4 gap-1 w-full h-full opacity-80">
                                                        {[...Array(16)].map((_, i) => (
                                                            <div key={i} className={`bg - black / 80 rounded - sm ${i % 3 === 0 ? 'col-span-2' : ''} ${i % 5 === 0 ? 'row-span-2' : ''} `}></div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-xs text-text-muted font-medium uppercase tracking-wider">Scan to Pay</p>
                                            </div>

                                            <div className="hidden sm:block w-px h-32 bg-border"></div>

                                            <div className="text-center sm:text-left">
                                                <p className="text-sm text-text-secondary mb-3">Or enter your UPI ID</p>
                                                <form onSubmit={handlePayment}>
                                                    <input
                                                        type="text"
                                                        placeholder="username@bank"
                                                        value={upiId}
                                                        onChange={(e) => setUpiId(e.target.value)}
                                                        required
                                                        className="input-field mb-3 w-full"
                                                    />
                                                    <button type="submit" className="btn-primary w-full shadow-lg shadow-primary-500/20">
                                                        Pay {formatINR(total)}
                                                    </button>
                                                </form>
                                            </div>
                                        </div>

                                        <div className="flex justify-center gap-4 opacity-50 grayscale pt-4">
                                            <span className="font-bold text-sm tracking-tighter italic">GPay</span>
                                            <span className="font-bold text-sm tracking-tighter">PhonePe</span>
                                            <span className="font-bold text-sm tracking-tighter italic">Paytm</span>
                                            <span className="font-bold text-sm tracking-tighter">BHIM</span>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Credit / Debit Card */}
                                {method === 'card' && (
                                    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                                        <h3 className="font-semibold text-text-primary mb-6">Enter Card Details</h3>

                                        <form onSubmit={handlePayment} className="space-y-4 max-w-sm ml-0">
                                            <div>
                                                <label className="block text-xs font-medium text-text-muted mb-1">Card Number</label>
                                                <div className="relative">
                                                    <HiCreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                                                    <input
                                                        type="text"
                                                        required
                                                        maxLength={19}
                                                        placeholder="XXXX XXXX XXXX XXXX"
                                                        value={cardNumber}
                                                        onChange={(e) => {
                                                            let val = e.target.value.replace(/\D/g, '');
                                                            val = val.replace(/(\d{4})/g, '$1 ').trim();
                                                            setCardNumber(val);
                                                        }}
                                                        className="input-field !pl-10 font-mono tracking-widest text-sm"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-medium text-text-muted mb-1">Expiry (MM/YY)</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        maxLength={5}
                                                        placeholder="MM/YY"
                                                        value={expiry}
                                                        onChange={(e) => {
                                                            let val = e.target.value.replace(/\D/g, '');
                                                            if (val.length > 2) val = val.slice(0, 2) + '/' + val.slice(2, 4);
                                                            setExpiry(val);
                                                        }}
                                                        className="input-field font-mono text-center text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-text-muted mb-1">CVV</label>
                                                    <input
                                                        type="password"
                                                        required
                                                        maxLength={4}
                                                        placeholder="•••"
                                                        value={cvv}
                                                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                                                        className="input-field font-mono text-center tracking-[0.2em] text-sm"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-text-muted mb-1">Name on Card</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={nameOnCard}
                                                    onChange={(e) => setNameOnCard(e.target.value.toUpperCase())}
                                                    placeholder="NAME SURNAME"
                                                    className="input-field uppercase text-sm font-medium tracking-wider"
                                                />
                                            </div>

                                            <button type="submit" className="btn-primary w-full mt-4 shadow-lg shadow-primary-500/20">
                                                Pay {formatINR(total)} securely
                                            </button>
                                        </form>
                                    </motion.div>
                                )}

                                {/* Net Banking / Wallets (Stubbed) */}
                                {(method === 'netbanking' || method === 'wallets') && (
                                    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="text-center py-12">
                                        <div className="w-16 h-16 rounded-full bg-surface-2 flex items-center justify-center mx-auto mb-4">
                                            {method === 'netbanking' ? <HiLibrary className="text-2xl text-text-muted" /> : <HiCash className="text-2xl text-text-muted" />}
                                        </div>
                                        <h3 className="font-semibold text-text-primary mb-2">
                                            {method === 'netbanking' ? 'Select your Bank' : 'Select Wallet'}
                                        </h3>
                                        <p className="text-sm text-text-muted max-w-[250px] mx-auto mb-6">
                                            You will be redirected to the provider's secure page to complete the payment.
                                        </p>
                                        <button onClick={handlePayment} className="btn-primary w-full max-w-[250px]">
                                            Proceed to Pay
                                        </button>
                                    </motion.div>
                                )}
                            </div>
                        </div>

                        {/* Footer Badges */}
                        <div className="bg-surface-2 p-3 border-t border-border flex justify-between items-center px-6">
                            <span className="text-[10px] text-text-muted font-medium uppercase tracking-wider">Secured by EduVerse Pay</span>
                            <div className="flex gap-2 text-text-muted">
                                <HiShieldCheck className="text-lg opacity-60" />
                                <HiDesktopComputer className="text-lg opacity-60" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
