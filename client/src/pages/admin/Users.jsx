import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiSearch, HiDotsVertical, HiTrash, HiBan, HiCheckCircle, HiUsers } from 'react-icons/hi';
import api from '../../services/api';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [total, setTotal] = useState(0);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (search) params.append('search', search);
                if (roleFilter) params.append('role', roleFilter);
                params.append('limit', '50');
                const res = await api.get(`/admin/users?${params.toString()}`);
                if (res.data.success) {
                    setUsers(res.data.users);
                    setTotal(res.data.total || res.data.users.length);
                }
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        const debounce = setTimeout(fetch, 300);
        return () => clearTimeout(debounce);
    }, [search, roleFilter]);

    return (
        <div className="page-transition space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-text-primary">User Management</h1>
                <p className="text-text-secondary text-sm mt-1">{total} total users</p>
            </div>

            <div className="glass-card !p-4 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..." className="input-field !pl-10" />
                </div>
                <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="input-field sm:!w-40">
                    <option value="">All Roles</option>
                    <option value="student">Students</option>
                    <option value="faculty">Faculty</option>
                    <option value="admin">Admins</option>
                </select>
            </div>

            {loading ? (
                <LoadingSpinner text="Loading users..." />
            ) : users.length === 0 ? (
                <EmptyState icon={HiUsers} title="No users found" message={search ? 'Try different search terms.' : 'No users in the platform yet.'} />
            ) : (
                <div className="glass-card !p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border bg-surface-2/50">
                                    <th className="text-left p-4 text-sm font-semibold text-text-primary">User</th>
                                    <th className="text-left p-4 text-sm font-semibold text-text-primary">Role</th>
                                    <th className="text-left p-4 text-sm font-semibold text-text-primary">Status</th>
                                    <th className="text-left p-4 text-sm font-semibold text-text-primary">Joined</th>
                                    <th className="text-left p-4 text-sm font-semibold text-text-primary">Location</th>
                                    <th className="text-left p-4 text-sm font-semibold text-text-primary">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user, i) => (
                                    <motion.tr key={user._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="border-b border-border/50 hover:bg-surface-2/50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold">{user.name?.charAt(0)}</div>
                                                <div>
                                                    <p className="text-sm font-medium text-text-primary">{user.name}</p>
                                                    <p className="text-xs text-text-muted">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${user.role === 'admin' ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-600' : user.role === 'faculty' ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-600' : 'bg-blue-100 dark:bg-blue-900/20 text-blue-600'}`}>{user.role}</span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1 text-xs font-medium ${user.isActive !== false ? 'text-green-500' : 'text-red-500'}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${user.isActive !== false ? 'bg-green-500' : 'bg-red-500'}`} />
                                                {user.isActive !== false ? 'active' : 'suspended'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-text-muted">{new Date(user.createdAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
                                        <td className="p-4 text-sm text-text-muted">{user.country || 'India'}</td>
                                        <td className="p-4">
                                            <div className="flex gap-1">
                                                <button className="p-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors text-green-500" title="Activate"><HiCheckCircle /></button>
                                                <button className="p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors text-amber-500" title="Suspend"><HiBan /></button>
                                                <button className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-500" title="Delete"><HiTrash /></button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
