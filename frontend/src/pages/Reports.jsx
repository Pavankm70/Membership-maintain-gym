import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart as PieIcon, 
  Calendar, 
  Clock, 
  Users, 
  RefreshCw,
  AlertCircle 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line 
} from 'recharts';
import { reportsApi } from '../api/client';

export default function Reports({ showToast }) {
  const [loading, setLoading] = useState(true);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [planDistribution, setPlanDistribution] = useState([]);
  const [memberStatus, setMemberStatus] = useState([]);
  const [expiringSubs, setExpiringSubs] = useState([]);
  const [expiryDays, setExpiryDays] = useState(30);
  const [peakHours, setPeakHours] = useState([]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [rev, plans, status, expiring, hours] = await Promise.all([
        reportsApi.getMonthlyRevenue(),
        reportsApi.getPlanDistribution(),
        reportsApi.getMemberStatus(),
        reportsApi.getExpiringSubscriptions(expiryDays),
        reportsApi.getPeakHours()
      ]);
      setMonthlyRevenue(rev || []);
      setPlanDistribution(plans || []);
      setMemberStatus(status || []);
      setExpiringSubs(expiring || []);
      setPeakHours(hours || []);
    } catch (err) {
      showToast({ type: 'error', message: err.message || 'Failed to fetch SQL report data' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [expiryDays]);

  const COLORS = ['#10b981', '#06b6d4', '#f59e0b', '#8b5cf6', '#ec4899', '#3b82f6'];

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '1rem' }}>
        <RefreshCw className="animate-spin" size={32} color="#10b981" />
        <p style={{ color: '#94a3b8', fontSize: '0.9375rem' }}>Aggregating live SQL analytics from MySQL 8...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Controls Banner */}
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#f8fafc' }}>
            DBMS Viva &amp; Operational SQL Reports
          </h3>
          <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
            Aggregations computed in MySQL via GROUP BY, SUM, COUNT, DATE_FORMAT, and HAVING.
          </p>
        </div>

        <button onClick={fetchReports} className="btn btn-secondary">
          <RefreshCw size={15} />
          <span>Refresh All Reports</span>
        </button>
      </div>

      {/* Row 1: Monthly Revenue & Plan Distribution */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem' }}>
        {/* Monthly Revenue Chart */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h4 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#f8fafc' }}>Monthly Revenue Collection</h4>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Realized income from successful transactions</p>
            </div>
            <TrendingUp size={18} color="#10b981" />
          </div>

          <div style={{ width: '100%', height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={(val) => `$${val}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', color: '#fff' }}
                  formatter={(val) => [`$${Number(val).toFixed(2)}`, 'Revenue']}
                />
                <Bar dataKey="totalAmount" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Plan Revenue Pie Chart */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h4 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#f8fafc' }}>Revenue by Membership Plan</h4>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total dollars generated per package</p>
            </div>
            <PieIcon size={18} color="#06b6d4" />
          </div>

          <div style={{ width: '100%', height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={planDistribution}
                  dataKey="totalRevenue"
                  nameKey="planName"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  innerRadius={50}
                  paddingAngle={4}
                  label={({ planName, percent }) => `${planName} (${(percent * 100).toFixed(0)}%)`}
                >
                  {planDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', color: '#fff' }}
                  formatter={(val) => [`$${Number(val).toFixed(2)}`, 'Total Revenue']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Peak Workout Hours & Member Status */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem' }}>
        {/* Peak Hours Histogram */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h4 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#f8fafc' }}>Peak Workout Hours Breakdown</h4>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Gym floor check-ins grouped by hour of the day</p>
            </div>
            <Clock size={18} color="#f59e0b" />
          </div>

          <div style={{ width: '100%', height: '240px' }}>
            {peakHours.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={peakHours}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="hour" stroke="#64748b" fontSize={12} tickFormatter={(h) => `${h}:00`} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', color: '#fff' }}
                    labelFormatter={(h) => `Hour: ${h}:00 - ${h}:59`}
                    formatter={(val) => [val, 'Check-Ins']}
                  />
                  <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b', fontSize: '0.875rem' }}>
                No hourly attendance logs yet.
              </div>
            )}
          </div>
        </div>

        {/* Member Status Breakdown */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h4 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#f8fafc' }}>Member Account Status Distribution</h4>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Active vs Inactive vs Suspended roster</p>
            </div>
            <Users size={18} color="#8b5cf6" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginTop: '1rem' }}>
            {memberStatus.map((s, idx) => (
              <div key={idx} style={{
                padding: '0.875rem 1.25rem',
                borderRadius: '0.75rem',
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(51, 65, 85, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className={s.status === 'ACTIVE' ? 'badge badge-emerald' : s.status === 'SUSPENDED' ? 'badge badge-rose' : 'badge badge-slate'}>
                    {s.status}
                  </span>
                  <span style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>Members</span>
                </div>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>
                  {s.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Subscription Expiry Forecast */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h4 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#f8fafc' }}>
              Subscription Expiry Forecast Report
            </h4>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Identifies active memberships ending within target horizon for retention renewals
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', color: '#cbd5e1' }}>Horizon:</span>
            {[7, 30, 60, 90].map((d) => (
              <button
                key={d}
                onClick={() => setExpiryDays(d)}
                className={expiryDays === d ? 'btn btn-primary' : 'btn btn-secondary'}
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
              >
                {d} Days
              </button>
            ))}
          </div>
        </div>

        {expiringSubs.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Sub ID</th>
                  <th>Member Name</th>
                  <th>Plan Tier</th>
                  <th>End Date</th>
                  <th>Days Remaining</th>
                  <th>Amount Paid</th>
                </tr>
              </thead>
              <tbody>
                {expiringSubs.map((s) => (
                  <tr key={s.subscriptionId}>
                    <td style={{ color: '#64748b', fontFamily: 'monospace' }}>#{s.subscriptionId}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#f8fafc' }}>{s.memberName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{s.memberEmail}</div>
                    </td>
                    <td style={{ color: '#38bdf8' }}>{s.planName}</td>
                    <td style={{ color: '#cbd5e1' }}>{s.endDate}</td>
                    <td>
                      <span className="badge badge-amber">{s.daysRemaining} days</span>
                    </td>
                    <td style={{ fontWeight: 600, color: '#10b981' }}>
                      ${Number(s.amountAtPurchase).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
            No subscriptions expire within the next {expiryDays} days.
          </div>
        )}
      </div>
    </div>
  );
}
