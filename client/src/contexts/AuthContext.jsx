import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('eduverse-user');
        return saved ? JSON.parse(saved) : null;
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user) {
            localStorage.setItem('eduverse-user', JSON.stringify(user));
        } else {
            localStorage.removeItem('eduverse-user');
            localStorage.removeItem('eduverse-token');
        }
    }, [user]);

    // Validate token on mount
    useEffect(() => {
        const token = localStorage.getItem('eduverse-token');
        if (token && user) {
            api.get('/auth/me')
                .then(res => { if (res.data.success) setUser(res.data.user); })
                .catch(() => { setUser(null); });
        }
    }, []);

    const login = async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.post('/auth/login', { email, password });
            if (res.data.success) {
                localStorage.setItem('eduverse-token', res.data.token);
                setUser(res.data.user);
                setLoading(false);
                return true;
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
            setError(msg);
            setLoading(false);
            return false;
        }
    };

    const register = async (userData) => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.post('/auth/register', userData);
            if (res.data.success) {
                localStorage.setItem('eduverse-token', res.data.token);
                setUser(res.data.user);
                setLoading(false);
                return true;
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Registration failed. Please try again.';
            setError(msg);
            setLoading(false);
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('eduverse-user');
        localStorage.removeItem('eduverse-token');
    };

    const updateUser = (updatedData) => {
        setUser(prev => ({ ...prev, ...updatedData }));
    };

    return (
        <AuthContext.Provider value={{ user, loading, error, setError, login, register, logout, updateUser, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
