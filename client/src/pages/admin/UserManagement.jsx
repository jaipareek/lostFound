import { useState, useEffect, useCallback } from 'react'
import api from '../../lib/axios'
import toast from 'react-hot-toast'
import StatusBadge from '../../components/StatusBadge'
import SearchBar from '../../components/SearchBar'
import ConfirmDialog from '../../components/ConfirmDialog'
import Modal from '../../components/Modal'
import EmptyState from '../../components/EmptyState'
import { TableRowSkeleton } from '../../components/LoadingSkeleton'
import {
    User,
    Mail,
    Shield,
    Trash2,
    Key,
    MoreVertical,
    UserCheck,
    ShieldAlert,
    Search,
    Filter
} from 'lucide-react'

export default function UserManagement() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [roleFilter, setRoleFilter] = useState('')

    // State for Role Update
    const [selectedUser, setSelectedUser] = useState(null)
    const [showRoleModal, setShowRoleModal] = useState(false)
    const [newRole, setNewRole] = useState('')

    // State for Delete
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [userToDelete, setUserToDelete] = useState(null)

    const [updating, setUpdating] = useState(false)
    const [creating, setCreating] = useState(false)

    // State for Create User
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [createForm, setCreateForm] = useState({
        fullName: '',
        email: '',
        password: '',
        role: 'student',
        studentId: ''
    })

    const fetchUsers = useCallback(async () => {
        setLoading(true)
        try {
            const { data } = await api.get('/admin/users', {
                params: {
                    role: roleFilter,
                    search: search
                }
            })
            setUsers(data.users || [])
        } catch (err) {
            toast.error('Failed to load users')
        } finally {
            setLoading(false)
        }
    }, [roleFilter, search])

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers()
        }, 400) // Debounce search
        return () => clearTimeout(timer)
    }, [fetchUsers])

    const handleRoleChange = async () => {
        if (!newRole) return
        setUpdating(true)
        try {
            await api.patch(`/admin/users/${selectedUser.id}/role`, { role: newRole })
            toast.success('User role updated successfully')
            setShowRoleModal(false)
            fetchUsers()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update role')
        } finally {
            setUpdating(false)
        }
    }

    const handleDeleteUser = async () => {
        setUpdating(true)
        try {
            await api.delete(`/admin/users/${userToDelete.id}`)
            toast.success('User deleted successfully')
            setShowDeleteConfirm(false)
            fetchUsers()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete user')
        } finally {
            setUpdating(false)
        }
    }

    const handleCreateUser = async (e) => {
        e.preventDefault()
        setCreating(true)
        try {
            await api.post('/admin/users', createForm)
            toast.success(`${createForm.role.charAt(0).toUpperCase() + createForm.role.slice(1)} account created successfully`)
            setShowCreateModal(false)
            setCreateForm({
                fullName: '',
                email: '',
                password: '',
                role: 'student',
                studentId: ''
            })
            fetchUsers()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create user')
        } finally {
            setCreating(false)
        }
    }

    const openRoleModal = (user) => {
        setSelectedUser(user)
        setNewRole(user.role)
        setShowRoleModal(true)
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">👥 User Management</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Manage all accounts and permissions</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-primary-900/20 hover:bg-primary-500 active:scale-95 transition-all"
                >
                    <User size={18} />
                    <span>Create New Account</span>
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 items-center">
                <div className="w-full lg:max-w-md">
                    <SearchBar
                        value={search}
                        onChange={setSearch}
                        placeholder="Search by name or email..."
                    />
                </div>
                <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
                    <Filter size={16} className="text-gray-400 shrink-0" />
                    {['', 'student', 'authority', 'admin'].map((role) => (
                        <button
                            key={role}
                            onClick={() => setRoleFilter(role)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border whitespace-nowrap ${roleFilter === role
                                ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            {role === '' ? 'All Roles' : role.charAt(0).toUpperCase() + role.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="card p-0 overflow-hidden border border-gray-100 bg-white shadow-sm">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">User</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Role</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Student ID</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Joined</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={5} />)
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="5">
                                        <div className="py-20 flex flex-col items-center">
                                            <EmptyState
                                                icon="👥"
                                                title="No users found"
                                                description="Try adjusting your search or filters."
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-50 to-indigo-50 text-primary-600 flex items-center justify-center font-bold border border-primary-100 shadow-sm transition-transform group-hover:scale-110">
                                                    {user.full_name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900 leading-tight">{user.full_name}</p>
                                                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><Mail size={12} /> {user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={user.role} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-bold text-gray-600 font-mono bg-gray-50 px-2 py-1 rounded">
                                                {user.student_id || '—'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-xs text-gray-500 font-medium">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openRoleModal(user)}
                                                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                                                    title="Change Role"
                                                >
                                                    <Shield size={18} />
                                                </button>
                                                <button
                                                    onClick={() => { setUserToDelete(user); setShowDeleteConfirm(true) }}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                    title="Delete User"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-gray-50">
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="p-4 space-y-4 animate-pulse">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full" />
                                    <div className="space-y-2 flex-1">
                                        <div className="h-4 bg-gray-100 rounded w-1/2" />
                                        <div className="h-3 bg-gray-50 rounded w-2/3" />
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : users.length === 0 ? (
                        <div className="py-20 px-6">
                            <EmptyState
                                icon="👥"
                                title="No users found"
                                description="Try adjusting your search or filters."
                            />
                        </div>
                    ) : (
                        users.map((user) => (
                            <div key={user.id} className="p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center font-bold text-lg border border-primary-100">
                                            {user.full_name?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{user.full_name}</p>
                                            <p className="text-xs text-gray-500 flex items-center gap-1"><Mail size={12} /> {user.email}</p>
                                        </div>
                                    </div>
                                    <StatusBadge status={user.role} />
                                </div>
                                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-2xl">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Student ID</p>
                                        <p className="text-xs font-bold text-gray-700 font-mono">{user.student_id || '—'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Joined</p>
                                        <p className="text-xs font-bold text-gray-700">{new Date(user.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => openRoleModal(user)}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 active:bg-gray-50 transition-colors"
                                    >
                                        <Shield size={14} /> Change Role
                                    </button>
                                    <button
                                        onClick={() => { setUserToDelete(user); setShowDeleteConfirm(true) }}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white border border-red-100 rounded-xl text-xs font-bold text-red-600 active:bg-red-50 transition-colors"
                                    >
                                        <Trash2 size={14} /> Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Role Change Modal */}
            {showRoleModal && (
                <Modal isOpen={showRoleModal} onClose={() => setShowRoleModal(false)} title="Change User Role">
                    <div className="space-y-6">
                        <div className="p-4 bg-gray-50 rounded-2xl flex items-center gap-4 border border-gray-100">
                            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-xl font-bold text-primary-600 shadow-sm">
                                {selectedUser.full_name?.charAt(0)}
                            </div>
                            <div>
                                <p className="font-bold text-gray-900">{selectedUser.full_name}</p>
                                <p className="text-xs text-gray-500">Current Role: <span className="uppercase">{selectedUser.role}</span></p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select New Role</label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {[
                                    { id: 'student', label: 'Student', icon: User, color: 'text-blue-600', bg: 'bg-blue-50' },
                                    { id: 'authority', label: 'Authority', icon: Shield, color: 'text-purple-600', bg: 'bg-purple-50' },
                                    { id: 'admin', label: 'Admin', icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-50' },
                                ].map((role) => (
                                    <button
                                        key={role.id}
                                        onClick={() => setNewRole(role.id)}
                                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${newRole === role.id
                                            ? 'border-primary-600 bg-primary-50/20'
                                            : 'border-gray-100 hover:border-gray-200 bg-white'
                                            }`}
                                    >
                                        <role.icon className={role.color} />
                                        <span className="text-xs font-bold text-gray-900">{role.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setShowRoleModal(false)} className="flex-1 btn bg-gray-100 hover:bg-gray-200 text-gray-700 py-3">
                                Cancel
                            </button>
                            <button
                                onClick={handleRoleChange}
                                className="flex-1 btn btn-primary py-3 flex items-center justify-center gap-2"
                                disabled={updating || newRole === selectedUser.role}
                            >
                                {updating ? 'Updating...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Delete Confirmation */}
            {showDeleteConfirm && (
                <ConfirmDialog
                    isOpen={showDeleteConfirm}
                    onClose={() => setShowDeleteConfirm(false)}
                    onConfirm={handleDeleteUser}
                    title="Delete User Account"
                    message={`Are you sure you want to delete ${userToDelete?.full_name}'s account? This action is permanent and will remove all their data from the platform.`}
                    confirmLabel="Delete Account"
                    danger
                    loading={updating}
                />
            )}

            {/* Create User Modal */}
            {showCreateModal && (
                <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Establish New Identity">
                    <form onSubmit={handleCreateUser} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                            <input
                                type="text"
                                required
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-medium"
                                placeholder="e.g. Rahul Sharma"
                                value={createForm.fullName}
                                onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-medium"
                                    placeholder="user@campus.edu"
                                    value={createForm.email}
                                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Initial Access Key</label>
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-medium"
                                    placeholder="Min 6 characters"
                                    value={createForm.password}
                                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Access Protocol (Role)</label>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { id: 'student', label: 'Student', icon: User, color: 'text-blue-600', bg: 'bg-blue-50' },
                                    { id: 'authority', label: 'Authority', icon: Shield, color: 'text-purple-600', bg: 'bg-purple-50' }
                                ].map((role) => (
                                    <button
                                        key={role.id}
                                        type="button"
                                        onClick={() => setCreateForm({ ...createForm, role: role.id })}
                                        className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${createForm.role === role.id
                                            ? 'border-primary-600 bg-primary-50/20'
                                            : 'border-gray-100 hover:border-gray-200 bg-white'
                                            }`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg ${role.bg} flex items-center justify-center`}>
                                            <role.icon size={16} className={role.color} />
                                        </div>
                                        <span className="text-xs font-bold text-gray-900">{role.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {createForm.role === 'student' && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Student Identification Number</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-medium"
                                    placeholder="e.g. 2024CS101"
                                    value={createForm.studentId}
                                    onChange={(e) => setCreateForm({ ...createForm, studentId: e.target.value })}
                                />
                            </div>
                        )}

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowCreateModal(false)}
                                className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all"
                            >
                                Abort
                            </button>
                            <button
                                type="submit"
                                disabled={creating}
                                className="flex-1 py-3.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-primary-900/20 transition-all disabled:opacity-50"
                            >
                                {creating ? 'Establishing...' : 'Execute Creation'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    )
}
