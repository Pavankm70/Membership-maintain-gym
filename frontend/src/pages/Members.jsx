import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Eye, 
  RefreshCw, 
  UserCheck, 
  UserX, 
  Phone, 
  Mail, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { membersApi } from '../api/client';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import Pagination from '../components/Pagination';

export default function Members({ showToast }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    gender: 'Male',
    dateOfBirth: '',
    joinDate: new Date().toISOString().split('T')[0],
    status: 'ACTIVE'
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await membersApi.getAll({
        query: searchQuery,
        status: statusFilter,
        page,
        size: 8
      });
      setMembers(res.content || []);
      setTotalPages(res.totalPages || 0);
      setTotalElements(res.totalElements || 0);
    } catch (err) {
      showToast({ type: 'error', message: err.message || 'Failed to load members' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [page, statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    fetchMembers();
  };

  const openAddModal = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      gender: 'Male',
      dateOfBirth: '',
      joinDate: new Date().toISOString().split('T')[0],
      status: 'ACTIVE'
    });
    setFormError('');
    setIsAddOpen(true);
  };

  const openEditModal = (member) => {
    setSelectedMember(member);
    setFormData({
      fullName: member.fullName,
      email: member.email,
      phone: member.phone,
      gender: member.gender || 'Male',
      dateOfBirth: member.dateOfBirth || '',
      joinDate: member.joinDate,
      status: member.status
    });
    setFormError('');
    setIsEditOpen(true);
  };

  const openViewModal = (member) => {
    setSelectedMember(member);
    setIsViewOpen(true);
  };

  const openDeleteModal = (member) => {
    setSelectedMember(member);
    setIsDeleteOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      await membersApi.create(formData);
      showToast({ type: 'success', message: 'Member registered successfully!' });
      setIsAddOpen(false);
      fetchMembers();
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
      await membersApi.update(selectedMember.memberId, formData);
      showToast({ type: 'success', message: 'Member profile updated successfully!' });
      setIsEditOpen(false);
      fetchMembers();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await membersApi.delete(selectedMember.memberId);
      showToast({ type: 'success', message: 'Member deleted from database.' });
      fetchMembers();
    } catch (err) {
      showToast({ type: 'error', message: err.message });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Controls Bar */}
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: '1 1 300px', maxWidth: '480px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
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
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
            style={{ width: '150px' }}
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
            <option value="SUSPENDED">SUSPENDED</option>
          </select>

          <button onClick={openAddModal} className="btn btn-primary">
            <Plus size={16} />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* Members Grid/Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Member Name</th>
                <th>Contact Details</th>
                <th>Gender</th>
                <th>Join Date</th>
                <th>Status</th>
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
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    No members found matching your search criteria.
                  </td>
                </tr>
              ) : (
                members.map((m) => (
                  <tr key={m.memberId}>
                    <td style={{ color: '#64748b', fontFamily: 'monospace' }}>#{m.memberId}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#f8fafc' }}>{m.fullName}</div>
                      {m.dateOfBirth && (
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>DOB: {m.dateOfBirth}</div>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#cbd5e1' }}>
                        <Mail size={13} color="#94a3b8" />
                        <span>{m.email}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.15rem' }}>
                        <Phone size={13} color="#94a3b8" />
                        <span>{m.phone}</span>
                      </div>
                    </td>
                    <td style={{ color: '#cbd5e1' }}>{m.gender || '—'}</td>
                    <td style={{ color: '#94a3b8' }}>{m.joinDate}</td>
                    <td>
                      <span className={m.status === 'ACTIVE' ? 'badge badge-emerald' : m.status === 'SUSPENDED' ? 'badge badge-rose' : 'badge badge-slate'}>
                        {m.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
                        <button
                          onClick={() => openViewModal(m)}
                          title="View Details"
                          style={{ background: 'transparent', border: 'none', color: '#38bdf8', cursor: 'pointer', padding: '0.35rem' }}
                        >
                          <Eye size={17} />
                        </button>
                        <button
                          onClick={() => openEditModal(m)}
                          title="Edit Profile"
                          style={{ background: 'transparent', border: 'none', color: '#fbbf24', cursor: 'pointer', padding: '0.35rem' }}
                        >
                          <Edit2 size={17} />
                        </button>
                        <button
                          onClick={() => openDeleteModal(m)}
                          title="Delete Member"
                          style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: '0.35rem' }}
                        >
                          <Trash2 size={17} />
                        </button>
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

      {/* Add Member Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Register New Gym Member">
        <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
              placeholder="e.g. Rahul Sharma"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                Email Address * (UNIQUE)
              </label>
              <input
                type="email"
                required
                placeholder="rahul@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                Phone Number * (UNIQUE)
              </label>
              <input
                type="text"
                required
                placeholder="+91 9876543210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                style={{ width: '100%' }}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                Date of Birth
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                Join Date *
              </label>
              <input
                type="date"
                required
                value={formData.joinDate}
                onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                style={{ width: '100%' }}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="SUSPENDED">SUSPENDED</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(51, 65, 85, 0.4)' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddOpen(false)}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Saving...' : 'Register Member'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Member Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title={`Edit Member: #${selectedMember?.memberId}`}>
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
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                Phone *
              </label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                style={{ width: '100%' }}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                Date of Birth
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                Join Date
              </label>
              <input
                type="date"
                required
                value={formData.joinDate}
                onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                style={{ width: '100%' }}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="SUSPENDED">SUSPENDED</option>
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

      {/* View Member Profile Modal */}
      <Modal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title={`Member Profile: ${selectedMember?.fullName}`}>
        {selectedMember && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', backgroundColor: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Member ID</span>
                <p style={{ fontWeight: 700, color: '#f8fafc', fontFamily: 'monospace' }}>#{selectedMember.memberId}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Status</span>
                <p>
                  <span className={selectedMember.status === 'ACTIVE' ? 'badge badge-emerald' : 'badge badge-slate'}>
                    {selectedMember.status}
                  </span>
                </p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Email Address</span>
                <p style={{ color: '#e2e8f0', fontSize: '0.875rem' }}>{selectedMember.email}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Phone</span>
                <p style={{ color: '#e2e8f0', fontSize: '0.875rem' }}>{selectedMember.phone}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Gender</span>
                <p style={{ color: '#e2e8f0', fontSize: '0.875rem' }}>{selectedMember.gender || 'Not specified'}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Date of Birth</span>
                <p style={{ color: '#e2e8f0', fontSize: '0.875rem' }}>{selectedMember.dateOfBirth || 'Not provided'}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Membership Join Date</span>
                <p style={{ color: '#e2e8f0', fontSize: '0.875rem' }}>{selectedMember.joinDate}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Account Created</span>
                <p style={{ color: '#94a3b8', fontSize: '0.8125rem' }}>{selectedMember.createdAt || 'System Demo'}</p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
              <button className="btn btn-secondary" onClick={() => setIsViewOpen(false)}>
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Member Account"
        message={`Are you sure you want to delete member #${selectedMember?.memberId} (${selectedMember?.fullName})? If this member has historical subscriptions or payments, the MySQL database constraint (ON DELETE RESTRICT) will block deletion to protect financial auditing history.`}
        confirmText="Confirm Delete"
      />
    </div>
  );
}
