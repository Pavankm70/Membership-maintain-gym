import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  CalendarCheck, 
  DollarSign, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  ArrowRight,
  CreditCard,
  RefreshCw
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  CartesianGrid 
} from 'recharts';
import { reportsApi } from '../api/client';

export default function Dashboard({ setActivePage }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const summary = await reportsApi.getDashboard();
      setData(summary);
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const COLORS = ['#10b981', '#06b6d4', '#f59e0b', '#8b5cf6', '#ec4899'];
  const STATUS_COLORS = {
    ACTIVE: '#10b981',
    INACTIVE: '#64748b',
    SUSPENDED: '#ef4444'
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '1rem' }}>
        <RefreshCw className="animate-spin" size={32} color="#10b981" />
        <p style={{ color: '#94a3b8', fontSize: '0.9375rem' }}>Loading live MySQL operational data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
        <AlertCircle size={40} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem' }}>Connection Error</h3>
        <p style={{ color: '#fca5a5', marginBottom: '1.5rem' }}>{error}</p>
        <button onClick={fetchDashboard} className="btn btn-primary">
          <RefreshCw size={16} />
          <span>Retry Loading</span>
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* 6 Key Performance Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.25rem'
      }}>
        {/* Total Members */}
        <div className="glass-panel glass-panel-hover" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#94a3b8' }}>Total Members</span>
            <div style={{ padding: '0.5rem', borderRadius: '0.5rem', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <Users size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc' }}>
            {data?.totalMembers || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.35rem' }}>
            <span style={{ fontWeight: 600 }}>{data?.activeMembers || 0}</span> active memberships
          </div>
        </div>

        {/* Active Subscriptions */}
        <div className="glass-panel glass-panel-hover" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#94a3b8' }}>Active Subscriptions</span>
            <div style={{ padding: '0.5rem', borderRadius: '0.5rem', background: 'rgba(6, 182, 212, 0.15)', color: '#38bdf8' }}>
              <CalendarCheck size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc' }}>
            {data?.activeSubscriptions || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#06b6d4', marginTop: '0.35rem' }}>
            Enrolled gym packages
          </div>
        </div>

        {/* Collected Revenue */}
        <div className="glass-panel glass-panel-hover" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#94a3b8' }}>Collected Revenue</span>
            <div style={{ padding: '0.5rem', borderRadius: '0.5rem', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <DollarSign size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc' }}>
            ${parseFloat(data?.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#f59e0b', marginTop: '0.35rem' }}>
            From successful payments
          </div>
        </div>

        {/* Registered Trainers */}
        <div className="glass-panel glass-panel-hover" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#94a3b8' }}>Certified Trainers</span>
            <div style={{ padding: '0.5rem', borderRadius: '0.5rem', background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa' }}>
              <UserCheck size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc' }}>
            {data?.registeredTrainers || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#8b5cf6', marginTop: '0.35rem' }}>
            Fitness instructors
          </div>
        </div>

        {/* Currently in Gym */}
        <div className="glass-panel glass-panel-hover" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#94a3b8' }}>Live Gym Occupancy</span>
            <div style={{ padding: '0.5rem', borderRadius: '0.5rem', background: 'rgba(236, 72, 153, 0.15)', color: '#f472b6' }}>
              <Clock size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span>{data?.currentlyCheckedIn || 0}</span>
            <span style={{ fontSize: '0.875rem', color: '#34d399', fontWeight: 500 }}>Active Now</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.35rem' }}>
            Open workout sessions
          </div>
        </div>

        {/* Expiring Soon */}
        <div className="glass-panel glass-panel-hover" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#94a3b8' }}>Expiring In 30 Days</span>
            <div style={{ padding: '0.5rem', borderRadius: '0.5rem', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
              <AlertCircle size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc' }}>
            {data?.expiringSoonCount || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '0.35rem' }}>
            Renewal opportunities
          </div>
        </div>
      </div>

      {/* Analytics & Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {/* Monthly Revenue Chart */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#f8fafc' }}>
                Monthly Revenue Trend
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Aggregate income grouped by month (MySQL DATE_FORMAT)
              </p>
            </div>
            <TrendingUp size={18} color="#10b981" />
          </div>

          <div style={{ width: '100%', height: '240px' }}>
            {data?.monthlyRevenue?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.monthlyRevenue}>
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
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b', fontSize: '0.875rem' }}>
                No revenue records found yet.
              </div>
            )}
          </div>
        </div>

        {/* Plan Popularity Distribution Chart */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#f8fafc' }}>
                Plan Revenue Contribution
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Cumulative sales per membership package
              </p>
            </div>
            <CreditCard size={18} color="#06b6d4" />
          </div>

          <div style={{ width: '100%', height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {data?.planDistribution?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.planDistribution}
                    dataKey="totalRevenue"
                    nameKey="planName"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={45}
                    paddingAngle={3}
                  >
                    {data.planDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', color: '#fff' }}
                    formatter={(val) => [`$${Number(val).toFixed(2)}`, 'Total Revenue']}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ color: '#64748b', fontSize: '0.875rem' }}>No plan distribution data available.</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions & Upcoming Expirations Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem' }}>
        {/* Recent Payments Table */}
        <div className="glass-panel" style={{ padding: '1.5rem', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#f8fafc' }}>
              Recent Financial Transactions
            </h3>
            <button
              onClick={() => setActivePage('payments')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#34d399',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              <span>View All</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data?.recentPayments?.slice(0, 5).map((pay) => (
                  <tr key={pay.paymentId}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#f8fafc' }}>{pay.memberName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{pay.planName}</div>
                    </td>
                    <td style={{ fontWeight: 700, color: '#f8fafc' }}>
                      ${Number(pay.amount).toFixed(2)}
                    </td>
                    <td>
                      <span className="badge badge-slate">{pay.paymentMethod}</span>
                    </td>
                    <td>
                      <span className={pay.paymentStatus === 'SUCCESS' ? 'badge badge-emerald' : pay.paymentStatus === 'PENDING' ? 'badge badge-amber' : 'badge badge-rose'}>
                        {pay.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Expirations */}
        <div className="glass-panel" style={{ padding: '1.5rem', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#f8fafc' }}>
              Upcoming Expirations (Next 30 Days)
            </h3>
            <button
              onClick={() => setActivePage('subscriptions')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#34d399',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              <span>Manage</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {data?.upcomingExpirations?.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Plan</th>
                    <th>End Date</th>
                    <th>Days Left</th>
                  </tr>
                </thead>
                <tbody>
                  {data.upcomingExpirations.slice(0, 5).map((sub) => (
                    <tr key={sub.subscriptionId}>
                      <td style={{ fontWeight: 600, color: '#f8fafc' }}>{sub.memberName}</td>
                      <td style={{ fontSize: '0.8125rem', color: '#cbd5e1' }}>{sub.planName}</td>
                      <td style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>{sub.endDate}</td>
                      <td>
                        <span className="badge badge-amber">{sub.daysRemaining} days</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
              No memberships are expiring within the next 30 days.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
