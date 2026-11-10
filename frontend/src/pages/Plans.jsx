import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Layers, Check, RefreshCw } from 'lucide-react';
import { plansApi } from '../api/client';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';

export default function Plans({ showToast }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const [formData, setFormData] = useState({
    planName: '',
    durationMonths: 1,
    price: '',
    description: ''
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const data = await plansApi.getAll();
      setPlans(data || []);
    } catch (err) {
      showToast({ type: 'error', message: err.message || 'Failed to fetch membership plans' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const openAddModal = () => {
    setFormData({
      planName: '',
      durationMonths: 1,
      price: '',
      description: ''
    });
    setFormError('');
    setIsAddOpen(true);
  };

  const openEditModal = (plan) => {
    setSelectedPlan(plan);
    setFormData({
      planName: plan.planName,
      durationMonths: plan.durationMonths,
      price: plan.price,
      description: plan.description || ''
    });
    setFormError('');
    setIsEditOpen(true);
  };

  const openDeleteModal = (plan) => {
    setSelectedPlan(plan);
    setIsDeleteOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (Number(formData.durationMonths) <= 0) {
      setFormError('Duration months must be greater than 0.');
      return;
    }
    if (Number(formData.price) < 0) {
      setFormError('Price cannot be negative.');
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      await plansApi.create({
        ...formData,
        durationMonths: parseInt(formData.durationMonths, 10),
        price: parseFloat(formData.price)
      });
      showToast({ type: 'success', message: 'Membership plan created successfully!' });
      setIsAddOpen(false);
      fetchPlans();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (Number(formData.durationMonths) <= 0) {
      setFormError('Duration months must be greater than 0.');
      return;
    }
    if (Number(formData.price) < 0) {
      setFormError('Price cannot be negative.');
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      await plansApi.update(selectedPlan.planId, {
        ...formData,
        durationMonths: parseInt(formData.durationMonths, 10),
        price: parseFloat(formData.price)
      });
      showToast({ type: 'success', message: 'Membership plan updated successfully!' });
      setIsEditOpen(false);
      fetchPlans();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await plansApi.delete(selectedPlan.planId);
      showToast({ type: 'success', message: 'Plan removed.' });
      fetchPlans();
    } catch (err) {
      showToast({ type: 'error', message: err.message });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#f8fafc' }}>
            Membership Packages Catalog
          </h3>
          <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
            Active tiers used for generating member subscriptions.
          </p>
        </div>

        <button onClick={openAddModal} className="btn btn-primary">
          <Plus size={16} />
          <span>New Plan</span>
        </button>
      </div>

      {/* Plan Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.25rem'
      }}>
        {loading ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
            <RefreshCw className="animate-spin" size={24} color="#10b981" style={{ margin: '0 auto' }} />
          </div>
        ) : plans.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
            No plans available.
          </div>
        ) : (
          plans.map((p) => (
            <div key={p.planId} className="glass-panel glass-panel-hover" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
                    {p.durationMonths} {p.durationMonths === 1 ? 'Month' : 'Months'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>#{p.planId}</span>
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.5rem' }}>
                  {p.planName}
                </h3>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981' }}>
                    ${Number(p.price).toFixed(2)}
                  </span>
                  <span style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>/ term</span>
                </div>

                <p style={{ fontSize: '0.8125rem', color: '#94a3b8', lineHeight: '1.5', marginBottom: '1.5rem' }}>
                  {p.description || 'Full access to gym workout facilities and locker room amenities.'}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(51, 65, 85, 0.4)' }}>
                <button
                  onClick={() => openEditModal(p)}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                >
                  <Edit2 size={13} color="#fbbf24" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => openDeleteModal(p)}
                  className="btn btn-danger"
                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                >
                  <Trash2 size={13} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Plan Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Create Membership Plan">
        <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {formError && (
            <div style={{ padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', fontSize: '0.875rem' }}>
              {formError}
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
              Plan Name * (UNIQUE)
            </label>
            <input
              type="text"
              required
              placeholder="e.g. VIP Annual Pass"
              value={formData.planName}
              onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                Duration (Months) * (CHECK &gt; 0)
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.durationMonths}
                onChange={(e) => setFormData({ ...formData, durationMonths: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                Price ($) * (CHECK &gt;= 0.00)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="49.99"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
              Package Description
            </label>
            <textarea
              rows="3"
              placeholder="Includes group classes, trainer support, towel service..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{ width: '100%' }}
            ></textarea>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(51, 65, 85, 0.4)' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddOpen(false)}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Creating...' : 'Create Plan'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Plan Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title={`Edit Plan: ${selectedPlan?.planName}`}>
        <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {formError && (
            <div style={{ padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', fontSize: '0.875rem' }}>
              {formError}
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
              Plan Name *
            </label>
            <input
              type="text"
              required
              value={formData.planName}
              onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                Duration (Months) *
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.durationMonths}
                onChange={(e) => setFormData({ ...formData, durationMonths: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                Price ($) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
              Description
            </label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{ width: '100%' }}
            ></textarea>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(51, 65, 85, 0.4)' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsEditOpen(false)}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Updating...' : 'Save Plan'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Membership Plan"
        message={`Are you sure you want to delete the plan '${selectedPlan?.planName}'? If members have purchased subscriptions under this plan, foreign key referential integrity (ON DELETE RESTRICT) will block deletion.`}
        confirmText="Confirm Delete"
      />
    </div>
  );
}
