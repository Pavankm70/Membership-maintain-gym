import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  DollarSign, 
  Hash, 
  Calendar, 
  RefreshCw 
} from 'lucide-react';
import { paymentsApi, subscriptionsApi } from '../api/client';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';

export default function Payments({ showToast }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Subscriptions available to receive payment
  const [subscriptionsList, setSubscriptionsList] = useState([]);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({
    subscriptionId: '',
    amount: '',
    paymentMethod: 'UPI',
    paymentStatus: 'SUCCESS',
    transactionRef: ''
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await paymentsApi.getAll({
        status: statusFilter,
        method: methodFilter,
        page,
        size: 8
      });
      setPayments(res.content || []);
      setTotalPages(res.totalPages || 0);
      setTotalElements(res.totalElements || 0);
    } catch (err) {
      showToast({ type: 'error', message: err.message || 'Failed to fetch payments' });
    } finally {
      setLoading(false);
    }
  };

  const loadSubscriptions = async () => {
    try {
      const res = await subscriptionsApi.getAll({ size: 100 });
      setSubscriptionsList(res.content || []);
    } catch (err) {
      console.error('Error fetching subscriptions for payment', err);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [page, statusFilter, methodFilter]);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const openAddModal = () => {
    const firstSub = subscriptionsList.length > 0 ? subscriptionsList[0] : null;
    setFormData({
      subscriptionId: firstSub ? firstSub.subscriptionId : '',
      amount: firstSub ? firstSub.amountAtPurchase : '',
      paymentMethod: 'UPI',
      paymentStatus: 'SUCCESS',
      transactionRef: `TXN-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(1000 + Math.random() * 9000)}`
    });
    setFormError('');
    setIsAddOpen(true);
  };

  const handleSubChange = (e) => {
    const subId = e.target.value;
    const sub = subscriptionsList.find(s => String(s.subscriptionId) === String(subId));
    setFormData({
      ...formData,
      subscriptionId: subId,
      amount: sub ? sub.amountAtPurchase : formData.amount
    });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subscriptionId) {
      setFormError('Please select a target subscription.');
      return;
    }
    if (Number(formData.amount) <= 0) {
      setFormError('Payment amount must be greater than zero.');
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      await paymentsApi.create({
        subscriptionId: Number(formData.subscriptionId),
        amount: parseFloat(formData.amount),
        paymentMethod: formData.paymentMethod,
        paymentStatus: formData.paymentStatus,
        transactionRef: formData.transactionRef.trim()
      });
      showToast({ type: 'success', message: 'Payment successfully recorded into ledger!' });
      setIsAddOpen(false);
      fetchPayments();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Controls Bar */}
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
            style={{ width: '160px' }}
          >
            <option value="">All Payment Statuses</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="PENDING">PENDING</option>
            <option value="FAILED">FAILED</option>
          </select>

          <select
            value={methodFilter}
            onChange={(e) => {
              setMethodFilter(e.target.value);
              setPage(0);
            }}
            style={{ width: '160px' }}
          >
            <option value="">All Payment Methods</option>
            <option value="UPI">UPI</option>
            <option value="CREDIT_CARD">Credit Card</option>
            <option value="DEBIT_CARD">Debit Card</option>
            <option value="CASH">Cash</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
          </select>
        </div>

        <button onClick={openAddModal} className="btn btn-primary">
          <Plus size={16} />
          <span>Record Payment</span>
        </button>
      </div>

      {/* Payments Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Receipt ID</th>
                <th>Member / Subscription</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Transaction Ref</th>
                <th>Date &amp; Time</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>
                    <RefreshCw className="animate-spin" size={24} color="#10b981" style={{ margin: '0 auto' }} />
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    No payment records found.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.paymentId}>
                    <td style={{ color: '#64748b', fontFamily: 'monospace' }}>#{p.paymentId}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#f8fafc' }}>{p.memberName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#38bdf8' }}>
                        Sub #{p.subscriptionId} &bull; {p.planName}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                        ${Number(p.amount).toFixed(2)}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-slate">{p.paymentMethod}</span>
                    </td>
                    <td>
                      <span className={p.paymentStatus === 'SUCCESS' ? 'badge badge-emerald' : p.paymentStatus === 'PENDING' ? 'badge badge-amber' : 'badge badge-rose'}>
                        {p.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#cbd5e1' }}>
                        {p.transactionRef || 'N/A'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
                      {new Date(p.paymentDate).toLocaleString()}
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

      {/* Record Payment Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Record New Payment Transaction">
        <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {formError && (
            <div style={{ padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', fontSize: '0.875rem' }}>
              {formError}
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
              Associated Subscription *
            </label>
            <select
              required
              value={formData.subscriptionId}
              onChange={handleSubChange}
              style={{ width: '100%' }}
            >
              <option value="">-- Choose Subscription --</option>
              {subscriptionsList.map((s) => (
                <option key={s.subscriptionId} value={s.subscriptionId}>
                  Sub #{s.subscriptionId} &bull; {s.memberName} - {s.planName} (${Number(s.amountAtPurchase).toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                Amount ($) * (CHECK &gt; 0)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                Payment Method *
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                style={{ width: '100%' }}
              >
                <option value="UPI">UPI</option>
                <option value="CREDIT_CARD">Credit Card</option>
                <option value="DEBIT_CARD">Debit Card</option>
                <option value="CASH">Cash</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                Payment Status *
              </label>
              <select
                value={formData.paymentStatus}
                onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                style={{ width: '100%' }}
              >
                <option value="SUCCESS">SUCCESS (Counts in Revenue)</option>
                <option value="PENDING">PENDING</option>
                <option value="FAILED">FAILED</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                Transaction Ref (UNIQUE)
              </label>
              <input
                type="text"
                value={formData.transactionRef}
                onChange={(e) => setFormData({ ...formData, transactionRef: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(51, 65, 85, 0.4)' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddOpen(false)}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Recording...' : 'Save Payment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
