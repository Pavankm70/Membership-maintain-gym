import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2,
  UserCheck, 
  UserX, 
  Phone, 
  Mail, 
  Award, 
  RefreshCw 
} from 'lucide-react';
import { trainersApi } from '../api/client';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';

export default function Trainers({ showToast }) {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    specialization: '',
    status: 'ACTIVE'
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchTrainers = async () => {
    setLoading(true);
    try {
      const res = await trainersApi.getAll({
        query: searchQuery,
        status: statusFilter,
        page,
        size: 8
      });
      setTrainers(res.content || []);
      setTotalPages(res.totalPages || 0);
      setTotalElements(res.totalElements || 0);
    } catch (err) {
      showToast({ type: 'error', message: err.message || 'Failed to load trainers' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainers();
  }, [page, statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    fetchTrainers();
  };

  const openAddModal = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      specialization: '',
      status: 'ACTIVE'
    });
    setFormError('');
    setIsAddOpen(true);
  };

  const openEditModal = (t) => {
    setSelectedTrainer(t);
    setFormData({
      fullName: t.fullName,
      email: t.email,
      phone: t.phone || '',
      specialization: t.specialization || '',
      status: t.status
    });
    setFormError('');
    setIsEditOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      setFormError('Trainer full name is required.');
      return;
    }
    if (!formData.email.trim()) {
      setFormError('Valid email address is required.');
      return;
    }
    if (formData.phone && formData.phone.trim().length > 20) {
      setFormError('Phone number cannot exceed 20 characters.');
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      await trainersApi.create({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        specialization: formData.specialization.trim() || null,
        status: formData.status || 'ACTIVE'
      });
      showToast({ type: 'success', message: 'Fitness trainer registered successfully!' });
      setIsAddOpen(false);
      setPage(0);
      fetchTrainers();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      setFormError('Trainer full name is required.');
      return;
    }
    if (!formData.email.trim()) {
      setFormError('Valid email address is required.');
      return;
    }
    if (formData.phone && formData.phone.trim().length > 20) {
      setFormError('Phone number cannot exceed 20 characters.');
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      await trainersApi.update(selectedTrainer.trainerId, {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        specialization: formData.specialization.trim() || null,
        status: formData.status || 'ACTIVE'
      });
      showToast({ type: 'success', message: 'Trainer details updated successfully!' });
      setIsEditOpen(false);
      fetchTrainers();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await trainersApi.toggleStatus(id);
      showToast({ type: 'success', message: 'Trainer active status toggled.' });
      fetchTrainers();
    } catch (err) {
      showToast({ type: 'error', message: err.message });
    }
  };

  const handleDeleteTrainer = async (t) => {
    if (!window.confirm(`Are you sure you want to delete trainer "${t.fullName}"?`)) {
      return;
    }
    try {
      await trainersApi.delete(t.trainerId);
      showToast({ type: 'success', message: `Trainer ${t.fullName} removed successfully.` });
      fetchTrainers();
    } catch (err) {
      showToast({ type: 'error', message: err.message || 'Failed to delete trainer' });
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
              placeholder="Search by trainer name, specialization, or email..."
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
          </select>

          <button onClick={openAddModal} className="btn btn-primary">
            <Plus size={16} />
            <span>Add Trainer</span>
          </button>
        </div>
      </div>

      {/* Trainers Cards / Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.25rem'
      }}>
        {loading ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
            <RefreshCw className="animate-spin" size={24} color="#10b981" style={{ margin: '0 auto' }} />
          </div>
        ) : trainers.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
            No instructors found matching your criteria.
          </div>
        ) : (
          trainers.map((t) => (
            <div key={t.trainerId} className="glass-panel glass-panel-hover" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#f8fafc' }}>{t.fullName}</h3>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>Trainer ID: #{t.trainerId}</span>
                  </div>
                  <span className={t.status === 'ACTIVE' ? 'badge badge-emerald' : 'badge badge-slate'}>
                    {t.status}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38bdf8', fontSize: '0.8125rem' }}>
                    <Award size={15} style={{ flexShrink: 0 }} />
                    <span style={{ fontWeight: 600 }}>{t.specialization || 'General Physical Fitness'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1', fontSize: '0.8125rem' }}>
                    <Mail size={15} color="#94a3b8" style={{ flexShrink: 0 }} />
                    <span>{t.email}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1', fontSize: '0.8125rem' }}>
                    <Phone size={15} color="#94a3b8" style={{ flexShrink: 0 }} />
                    <span>{t.phone || 'No phone provided'}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid rgba(51, 65, 85, 0.4)', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleToggleStatus(t.trainerId)}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                >
                  {t.status === 'ACTIVE' ? <UserX size={14} color="#f87171" /> : <UserCheck size={14} color="#34d399" />}
                  <span>{t.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}</span>
                </button>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => openEditModal(t)}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                    title="Edit Trainer Details"
                  >
                    <Edit2 size={14} color="#fbbf24" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => handleDeleteTrainer(t)}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', color: '#f87171' }}
                    title="Delete Trainer"
                  >
                    <Trash2 size={14} color="#f87171" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalElements={totalElements}
        pageSize={8}
        onPageChange={setPage}
      />

      {/* Add Trainer Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Certified Fitness Trainer">
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
              placeholder="e.g. Alex Hunter"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
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
              placeholder="alex.hunter@gymsphere.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
              Phone Number (Optional)
            </label>
            <input
              type="text"
              maxLength={20}
              placeholder="+91 9123456789"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
              Specialization (Optional)
            </label>
            <input
              type="text"
              maxLength={100}
              placeholder="e.g. Strength & Conditioning, HIIT, Bodybuilding"
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
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
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(51, 65, 85, 0.4)' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddOpen(false)}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Saving...' : 'Register Trainer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Trainer Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title={`Edit Trainer: ${selectedTrainer?.fullName}`}>
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

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
              Email Address *
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
              Phone Number
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
              Specialization
            </label>
            <input
              type="text"
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
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
            </select>
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
    </div>
  );
}
