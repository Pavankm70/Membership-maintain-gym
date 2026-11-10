import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  CalendarCheck, 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign, 
  User, 
  UserCheck,
  RefreshCw,
  AlertCircle 
} from 'lucide-react';
import { subscriptionsApi, membersApi, plansApi, trainersApi } from '../api/client';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';

export default function Subscriptions({ showToast }) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Available entities for dropdown creation
  const [membersList, setMembersList] = useState([]);
  const [plansList, setPlansList] = useState([]);
  const [trainersList, setTrainersList] = useState([]);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isAssignTrainerOpen, setIsAssignTrainerOpen] = useState(false);
  const [selectedSubForTrainer, setSelectedSubForTrainer] = useState(null);
  const [assignedTrainerId, setAssignedTrainerId] = useState('');
  const [assignSubmitting, setAssignSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    memberId: '',
    planId: '',
    trainerId: '',
    startDate: new Date().toISOString().split('T')[0]
  });
  const [calculatedEndDate, setCalculatedEndDate] = useState('');
  const [previewPrice, setPreviewPrice] = useState(0);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const res = await subscriptionsApi.getAll({
        query: searchQuery,
        status: statusFilter,
        page,
        size: 8
      });
      setSubscriptions(res.content || []);
      setTotalPages(res.totalPages || 0);
      setTotalElements(res.totalElements || 0);
    } catch (err) {
      showToast({ type: 'error', message: err.message || 'Failed to fetch subscriptions' });
    } finally {
      setLoading(false);
    }
  };

  const loadDropdownData = async () => {
    try {
      const [membersRes, plansRes, trainersRes] = await Promise.all([
        membersApi.getAll({ size: 100, status: 'ACTIVE' }),
        plansApi.getAll(),
        trainersApi.getActive()
      ]);
      setMembersList(membersRes.content || []);
      setPlansList(plansRes || []);
      setTrainersList(trainersRes || []);
    } catch (err) {
      console.error('Error loading dropdown options', err);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [page, statusFilter]);

  useEffect(() => {
    loadDropdownData();
  }, []);

  // Update calculated end date & purchase price when plan or start date changes
  useEffect(() => {
    if (!formData.planId || !formData.startDate) {
      setCalculatedEndDate('');
      setPreviewPrice(0);
      return;
    }

    const selectedPlan = plansList.find(p => String(p.planId) === String(formData.planId));
    if (selectedPlan) {
      setPreviewPrice(selectedPlan.price);
      const start = new Date(formData.startDate);
      start.setMonth(start.getMonth() + selectedPlan.durationMonths);
      setCalculatedEndDate(start.toISOString().split('T')[0]);
    }
  }, [formData.planId, formData.startDate, plansList]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    fetchSubscriptions();
  };

  const openAddModal = () => {
    setFormData({
      memberId: membersList.length > 0 ? membersList[0].memberId : '',
      planId: plansList.length > 0 ? plansList[0].planId : '',
      trainerId: '',
      startDate: new Date().toISOString().split('T')[0]
    });
    setFormError('');
    setIsAddOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.memberId || !formData.planId) {
      setFormError('Please select both a member and a membership plan.');
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      await subscriptionsApi.create({
        memberId: Number(formData.memberId),
        planId: Number(formData.planId),
        trainerId: formData.trainerId ? Number(formData.trainerId) : null,
        startDate: formData.startDate
      });
      showToast({ type: 'success', message: 'Subscription successfully issued!' });
      setIsAddOpen(false);
      fetchSubscriptions();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await subscriptionsApi.updateStatus(id, newStatus);
      showToast({ type: 'success', message: `Subscription marked as ${newStatus}` });
      fetchSubscriptions();
    } catch (err) {
      showToast({ type: 'error', message: err.message });
    }
  };

  const openAssignTrainerModal = (sub) => {
    setSelectedSubForTrainer(sub);
    setAssignedTrainerId(sub.trainerId ? String(sub.trainerId) : '');
    setIsAssignTrainerOpen(true);
  };

  const handleAssignTrainerSubmit = async (e) => {
    e.preventDefault();
    setAssignSubmitting(true);
    try {
      const trainerIdVal = assignedTrainerId ? Number(assignedTrainerId) : null;
      await subscriptionsApi.assignTrainer(selectedSubForTrainer.subscriptionId, trainerIdVal);
      showToast({ 
        type: 'success', 
        message: trainerIdVal ? 'Trainer assigned to subscription successfully!' : 'Trainer removed from subscription.' 
      });
      setIsAssignTrainerOpen(false);
      fetchSubscriptions();
    } catch (err) {
      showToast({ type: 'error', message: err.message || 'Failed to update trainer.' });
    } finally {
      setAssignSubmitting(false);
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
              placeholder="Search by member name, plan, or trainer..."
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
            <option value="EXPIRED">EXPIRED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>

          <button onClick={openAddModal} className="btn btn-primary">
            <Plus size={16} />
            <span>New Subscription</span>
          </button>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Member</th>
                <th>Plan Tier</th>
                <th>Trainer</th>
                <th>Term Period</th>
                <th>Purchase Rate</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem' }}>
                    <RefreshCw className="animate-spin" size={24} color="#10b981" style={{ margin: '0 auto' }} />
                  </td>
                </tr>
              ) : subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    No subscriptions found.
                  </td>
                </tr>
              ) : (
                subscriptions.map((s) => (
                  <tr key={s.subscriptionId}>
                    <td style={{ color: '#64748b', fontFamily: 'monospace' }}>#{s.subscriptionId}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#f8fafc' }}>{s.memberName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{s.memberEmail}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#38bdf8' }}>{s.planName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{s.durationMonths} months</div>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => openAssignTrainerModal(s)}
                        style={{
                          background: 'rgba(196, 181, 253, 0.08)',
                          border: '1px solid rgba(196, 181, 253, 0.25)',
                          borderRadius: '0.375rem',
                          padding: '0.25rem 0.5rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          transition: 'all 0.15s ease'
                        }}
                        title="Click to assign or change trainer"
                      >
                        <UserCheck size={13} color="#a78bfa" />
                        <span style={{ fontSize: '0.8125rem', color: s.trainerName !== 'None Assigned' ? '#c4b5fd' : '#94a3b8', fontWeight: s.trainerName !== 'None Assigned' ? 600 : 400 }}>
                          {s.trainerName}
                        </span>
                      </button>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8125rem', color: '#cbd5e1' }}>{s.startDate} &rarr; {s.endDate}</div>
                      {s.status === 'ACTIVE' && (
                        <div style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 600, marginTop: '0.1rem' }}>
                          {s.daysRemaining} days remaining
                        </div>
                      )}
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: '#10b981' }}>
                        ${Number(s.amountAtPurchase).toFixed(2)}
                      </span>
                    </td>
                    <td>
                      <span className={s.status === 'ACTIVE' ? 'badge badge-emerald' : s.status === 'EXPIRED' ? 'badge badge-slate' : 'badge badge-rose'}>
                        {s.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                        <button
                          onClick={() => openAssignTrainerModal(s)}
                          className="btn btn-secondary"
                          style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem', color: '#c4b5fd' }}
                          title="Assign or Change Personal Trainer"
                        >
                          Trainer
                        </button>
                        {s.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleStatusChange(s.subscriptionId, 'CANCELLED')}
                            className="btn btn-secondary"
                            style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem', color: '#fda4af' }}
                            title="Cancel Active Subscription"
                          >
                            Cancel
                          </button>
                        )}
                        {s.status === 'CANCELLED' && (
                          <button
                            onClick={() => handleStatusChange(s.subscriptionId, 'ACTIVE')}
                            className="btn btn-secondary"
                            style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem', color: '#34d399' }}
                            title="Reactivate Subscription"
                          >
                            Reactivate
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

      {/* New Subscription Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Issue New Member Subscription">
        <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {formError && (
            <div style={{ padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', fontSize: '0.875rem' }}>
              {formError}
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
              Select Gym Member *
            </label>
            <select
              required
              value={formData.memberId}
              onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
              style={{ width: '100%' }}
            >
              <option value="">-- Choose Member --</option>
              {membersList.map((m) => (
                <option key={m.memberId} value={m.memberId}>
                  #{m.memberId} - {m.fullName} ({m.phone})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
              Select Membership Plan Tier *
            </label>
            <select
              required
              value={formData.planId}
              onChange={(e) => setFormData({ ...formData, planId: e.target.value })}
              style={{ width: '100%' }}
            >
              <option value="">-- Choose Plan Tier --</option>
              {plansList.map((p) => (
                <option key={p.planId} value={p.planId}>
                  {p.planName} - ${Number(p.price).toFixed(2)} ({p.durationMonths} Months)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
              Assign Personal Trainer (Optional)
            </label>
            <select
              value={formData.trainerId}
              onChange={(e) => setFormData({ ...formData, trainerId: e.target.value })}
              style={{ width: '100%' }}
            >
              <option value="">-- None (Standard Gym Membership) --</option>
              {trainersList.map((t) => (
                <option key={t.trainerId} value={t.trainerId}>
                  {t.fullName} &bull; {t.specialization}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
              Subscription Start Date *
            </label>
            <input
              type="date"
              required
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>

          {/* Automatic Calculation Preview Box */}
          {calculatedEndDate && (
            <div style={{
              padding: '1rem',
              borderRadius: '0.75rem',
              backgroundColor: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#10b981', fontWeight: 700, letterSpacing: '0.05em' }}>
                Automated DBMS Calculation Preview
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#e2e8f0' }}>
                <span>Calculated End Date:</span>
                <strong style={{ color: '#38bdf8' }}>{calculatedEndDate}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#e2e8f0' }}>
                <span>Amount Locked at Purchase:</span>
                <strong style={{ color: '#34d399', fontSize: '1rem' }}>${Number(previewPrice).toFixed(2)}</strong>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(51, 65, 85, 0.4)' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddOpen(false)}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Issuing...' : 'Create Subscription'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Assign / Change Trainer Modal */}
      <Modal 
        isOpen={isAssignTrainerOpen} 
        onClose={() => setIsAssignTrainerOpen(false)} 
        title={`Assign Trainer: ${selectedSubForTrainer?.memberName || ''}`}
      >
        <form onSubmit={handleAssignTrainerSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: 'rgba(51, 65, 85, 0.4)', fontSize: '0.8125rem', color: '#cbd5e1' }}>
            <div><strong>Member:</strong> {selectedSubForTrainer?.memberName} ({selectedSubForTrainer?.memberEmail})</div>
            <div><strong>Plan:</strong> {selectedSubForTrainer?.planName} ({selectedSubForTrainer?.durationMonths} months)</div>
            <div><strong>Current Trainer:</strong> {selectedSubForTrainer?.trainerName}</div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
              Select Certified Fitness Trainer
            </label>
            <select
              value={assignedTrainerId}
              onChange={(e) => setAssignedTrainerId(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="">-- None (No Personal Trainer) --</option>
              {trainersList.map((t) => (
                <option key={t.trainerId} value={t.trainerId}>
                  {t.fullName} &bull; {t.specialization || 'General Fitness'} {t.status === 'INACTIVE' ? '(Inactive)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(51, 65, 85, 0.4)' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAssignTrainerOpen(false)}>
              Cancel
            </button>
            <button type="submit" disabled={assignSubmitting} className="btn btn-primary">
              {assignSubmitting ? 'Saving...' : 'Save Trainer Assignment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
