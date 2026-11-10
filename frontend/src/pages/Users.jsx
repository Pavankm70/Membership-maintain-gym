import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Shield, 
  Key, 
  Edit2, 
  Trash2, 
  UserCheck, 
  UserX, 
  RefreshCw 
} from 'lucide-react';
import { usersApi } from '../api/client';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import Pagination from '../components/Pagination';

export default function Users({ currentUser, showToast }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [createForm, setCreateForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'ROLE_STAFF'
  });

  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    role: 'ROLE_STAFF',
    enabled: true
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: ''
  });

  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await usersApi.getAll({
        query: searchQuery,
        role: roleFilter,
        page,
        size: 8
      });
      setUsers(res.content || []);
      setTotalPages(res.totalPages || 0);
      setTotalElements(res.totalElements || 0);
    } catch (err) {
      showToast({ type: 'error', message: err.message || 'Failed to fetch users' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    fetchUsers();
  };

  const openAddModal = () => {
    setCreateForm({
      fullName: '',
      email: '',
      password: '',
      role: 'ROLE_STAFF'
    });
    setFormError('');
    setIsAddOpen(true);
  };

  const openEditModal = (u) => {
    setSelectedUser(u);
    setEditForm({
      fullName: u.fullName,
      email: u.email,
      role: u.role,
      enabled: u.enabled
    });
    setFormError('');
    setIsEditOpen(true);
  };

  const openPasswordModal = (u) => {
    setSelectedUser(u);
    setPasswordForm({
      currentPassword: '',
      newPassword: ''
    });
    setFormError('');
    setIsPasswordOpen(true);
  };

  const openDeleteModal = (u) => {
    setSelectedUser(u);
    setIsDeleteOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      await usersApi.create(createForm);
      showToast({ type: 'success', message: 'Staff account successfully created!' });
      setIsAddOpen(false);
      fetchUsers();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      await usersApi.update(selectedUser.userId, editForm);
      showToast({ type: 'success', message: 'User account updated!' });
      setIsEditOpen(false);
      fetchUsers();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      await usersApi.changePassword(selectedUser.userId, passwordForm);
      showToast({ type: 'success', message: 'Password updated successfully!' });
      setIsPasswordOpen(false);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await usersApi.delete(selectedUser.userId);
      showToast({ type: 'success', message: 'Account deleted.' });
      fetchUsers();
    } catch (err) {
      showToast({ type: 'error', message: err.message });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Search & Actions Bar */}
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: '1 1 300px', maxWidth: '480px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              placeholder="Search by full name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', paddingLeft: '2.5rem' }}
            />
          </div>
          <button type="submit" className="btn btn-secondary">
            Search
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(0);
            }}
            style={{ width: '150px' }}
          >
            <option value="">All Roles</option>
            <option value="ROLE_ADMIN">ROLE_ADMIN</option>
            <option value="ROLE_STAFF">ROLE_STAFF</option>
          </select>

          <button onClick={openAddModal} className="btn btn-primary">
            <Plus size={16} />
            <span>Create Staff Account</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Full Name</th>
                <th>Email Address</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created At</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>
                    <RefreshCw className="animate-spin" size={24} color="#10b981" style={{ margin: '0 auto' }} />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    No staff accounts found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.userId}>
                    <td style={{ color: '#64748b', fontFamily: 'monospace' }}>#{u.userId}</td>
                    <td style={{ fontWeight: 600, color: '#f8fafc' }}>{u.fullName}</td>
                    <td style={{ color: '#cbd5e1' }}>{u.email}</td>
                    <td>
                      <span className={u.role === 'ROLE_ADMIN' ? 'badge badge-emerald' : 'badge badge-cyan'}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span className={u.enabled ? 'badge badge-emerald' : 'badge badge-rose'}>
                        {u.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </td>
                    <td style={{ color: '#94a3b8', fontSize: '0.8125rem' }}>
                      {u.createdAt || 'System Setup'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
                        <button
                          onClick={() => openPasswordModal(u)}
                          title="Change Password"
                          style={{ background: 'transparent', border: 'none', color: '#a78bfa', cursor: 'pointer', padding: '0.35rem' }}
                        >
                          <Key size={16} />
                        </button>
                        <button
                          onClick={() => openEditModal(u)}
                          title="Edit Account"
                          style={{ background: 'transparent', border: 'none', color: '#fbbf24', cursor: 'pointer', padding: '0.35rem' }}
                        >
                          <Edit2 size={16} />
                        </button>
                        {currentUser?.userId !== u.userId && (
                          <button
                            onClick={() => openDeleteModal(u)}
                            title="Delete Account"
                            style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: '0.35rem' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={8}
          onPageChange={setPage}
        />
      </div>

      {/* Create User Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Create Staff / Admin Account">
        <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {formError && (
            <div style={{ padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', fontSize: '0.875rem' }}>
              {formError}
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
              Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Rahul Frontdesk"
              value={createForm.fullName}
              onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
              Email Address * (UNIQUE)
            </label>
            <input
              type="email"
              required
              placeholder="staff@gymsphere.com"
              value={createForm.email}
              onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
              Initial Password * (Will be BCrypt hashed)
            </label>
            <input
              type="password"
              required
              minLength="6"
              placeholder="Minimum 6 characters"
              value={createForm.password}
              onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
              System Role *
            </label>
            <select
              value={createForm.role}
              onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
              style={{ width: '100%' }}
            >
              <option value="ROLE_STAFF">ROLE_STAFF (Front Desk / Attendance / Payments)</option>
              <option value="ROLE_ADMIN">ROLE_ADMIN (Full Administrative Control)</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(51, 65, 85, 0.4)' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddOpen(false)}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title={`Edit Account: ${selectedUser?.fullName}`}>
        <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {formError && (
            <div style={{ padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', fontSize: '0.875rem' }}>
              {formError}
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
              Full Name *
            </label>
            <input
              type="text"
              required
              value={editForm.fullName}
              onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
              Email Address *
            </label>
            <input
              type="email"
              required
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                Role
              </label>
              <select
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                style={{ width: '100%' }}
              >
                <option value="ROLE_STAFF">ROLE_STAFF</option>
                <option value="ROLE_ADMIN">ROLE_ADMIN</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                Account Status
              </label>
              <select
                value={editForm.enabled ? 'true' : 'false'}
                onChange={(e) => setEditForm({ ...editForm, enabled: e.target.value === 'true' })}
                style={{ width: '100%' }}
              >
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(51, 65, 85, 0.4)' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsEditOpen(false)}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Change Password Modal */}
      <Modal isOpen={isPasswordOpen} onClose={() => setIsPasswordOpen(false)} title={`Change Password for ${selectedUser?.email}`}>
        <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {formError && (
            <div style={{ padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', fontSize: '0.875rem' }}>
              {formError}
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
              Current Password *
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
              New Password * (Min 6 characters)
            </label>
            <input
              type="password"
              required
              minLength="6"
              placeholder="••••••••"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(51, 65, 85, 0.4)' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsPasswordOpen(false)}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete User Confirm */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete User Account"
        message={`Are you sure you want to permanently delete the staff login '${selectedUser?.email}'?`}
        confirmText="Confirm Delete"
      />
    </div>
  );
}
