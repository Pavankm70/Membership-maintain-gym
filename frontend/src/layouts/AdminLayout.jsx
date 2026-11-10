import React from 'react';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Layers,
  CalendarCheck,
  CreditCard,
  Clock,
  BarChart3,
  ShieldCheck,
  Database,
  LogOut,
  Dumbbell
} from 'lucide-react';

export default function AdminLayout({ activePage, setActivePage, user, onLogout, children }) {

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'trainers', label: 'Trainers', icon: UserCheck },
    { id: 'plans', label: 'Membership Plans', icon: Layers },
    { id: 'subscriptions', label: 'Subscriptions', icon: CalendarCheck },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'users', label: 'Staff & Accounts', icon: ShieldCheck, adminOnly: true },
    { id: 'explorer', label: 'Database Explorer', icon: Database, isSpecial: true }
  ];

  const pageDescriptions = {
    dashboard: 'Live operational overview, financial analytics, and gym occupancy metrics.',
    members: 'Manage registered gym members, active plans, and contact records.',
    trainers: 'Certified personal trainers, specializations, and active client assignments.',
    plans: 'Membership tiers, duration periods, and base pricing structures.',
    subscriptions: 'Member enrollment junction records, calculated end-dates, and rate locks.',
    payments: 'Financial transactions, receipts, payment methods, and revenue ledger.',
    attendance: 'Daily member check-in & check-out logs with duration tracking.',
    reports: 'Analytical queries and visual charts backed by SQL aggregations.',
    users: 'Internal administrative credentials and role-based access management.',
    explorer: 'Live MySQL INFORMATION_SCHEMA inspector, relational ER diagram, and viva queries.'
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: '260px',
        minWidth: '260px',
        backgroundColor: 'rgba(15, 23, 42, 0.98)',
        borderRight: '1px solid rgba(51, 65, 85, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto',
        zIndex: 40
      }}>

        {/* Brand */}
        <div style={{
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          borderBottom: '1px solid rgba(51, 65, 85, 0.4)'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '0.75rem',
            background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            flexShrink: 0,
            boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)'
          }}>
            <Dumbbell size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.1875rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#f8fafc', margin: 0 }}>
              Gym<span style={{ color: '#10b981' }}>Sphere</span>
            </h1>
            <p style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 500, margin: 0 }}>
              DBMS College Edition
            </p>
          </div>
        </div>

        {/* Nav Links */}
        <nav style={{ padding: '1rem 0.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {navItems.map((item) => {
            if (item.adminOnly && user?.role !== 'ROLE_ADMIN') return null;
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '0.625rem 0.875rem',
                  borderRadius: '0.625rem',
                  border: isActive
                    ? '1px solid rgba(16, 185, 129, 0.4)'
                    : item.isSpecial
                    ? '1px solid rgba(139, 92, 246, 0.3)'
                    : '1px solid transparent',
                  background: isActive
                    ? 'linear-gradient(90deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.05) 100%)'
                    : item.isSpecial
                    ? 'rgba(139, 92, 246, 0.08)'
                    : 'transparent',
                  color: isActive ? '#34d399' : item.isSpecial ? '#c4b5fd' : '#94a3b8',
                  fontSize: '0.875rem',
                  fontWeight: isActive || item.isSpecial ? 600 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#f8fafc';
                    e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = item.isSpecial ? '#c4b5fd' : '#94a3b8';
                    e.currentTarget.style.background = item.isSpecial ? 'rgba(139, 92, 246, 0.08)' : 'transparent';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Icon size={18} color={isActive ? '#10b981' : item.isSpecial ? '#a78bfa' : '#94a3b8'} />
                  <span>{item.label}</span>
                </div>
                {item.isSpecial && (
                  <span style={{
                    fontSize: '0.65rem',
                    padding: '0.15rem 0.45rem',
                    borderRadius: '9999px',
                    background: 'rgba(139, 92, 246, 0.2)',
                    color: '#c4b5fd',
                    fontWeight: 700
                  }}>
                    DBMS
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Card */}
        <div style={{
          padding: '1rem',
          borderTop: '1px solid rgba(51, 65, 85, 0.4)',
          backgroundColor: 'rgba(15, 23, 42, 0.6)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ overflow: 'hidden' }}>
              <p style={{
                fontSize: '0.875rem', fontWeight: 600, color: '#f8fafc',
                whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', margin: 0
              }}>
                {user?.fullName || 'User'}
              </p>
              <span
                className={user?.role === 'ROLE_ADMIN' ? 'badge badge-emerald' : 'badge badge-cyan'}
                style={{ marginTop: '0.25rem', padding: '0.1rem 0.4rem', fontSize: '0.65rem' }}
              >
                {user?.role === 'ROLE_ADMIN' ? 'ADMIN' : 'STAFF'}
              </span>
            </div>
            <button
              onClick={onLogout}
              title="Sign Out"
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                padding: '0.5rem',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>

        {/* Top Header */}
        <header style={{
          height: '64px',
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(51, 65, 85, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.5rem',
          position: 'sticky',
          top: 0,
          zIndex: 30,
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
              width: '8px', height: '8px', borderRadius: '50%',
              backgroundColor: '#10b981', boxShadow: '0 0 8px #10b981',
              display: 'inline-block'
            }} />
            <span style={{ fontSize: '0.8125rem', color: '#94a3b8', fontWeight: 500 }}>
              MySQL 8.0 Live &bull; <strong style={{ color: '#e2e8f0' }}>gymsphere_db</strong>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              className="btn btn-secondary"
              style={{ fontSize: '0.8125rem', padding: '0.45rem 0.85rem' }}
              onClick={() => setActivePage('attendance')}
            >
              <Clock size={15} color="#34d399" />
              <span>Check-In / Out</span>
            </button>
            <button
              className="btn btn-primary"
              style={{ fontSize: '0.8125rem', padding: '0.45rem 0.85rem' }}
              onClick={() => setActivePage('subscriptions')}
            >
              <CalendarCheck size={15} />
              <span>New Membership</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
          <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{
                fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc',
                textTransform: 'capitalize', letterSpacing: '-0.02em', margin: 0
              }}>
                {activePage === 'explorer' ? 'MySQL Database Explorer' : activePage.replace(/-/g, ' ')}
              </h2>
              <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginTop: '0.25rem', margin: '0.25rem 0 0 0' }}>
                {pageDescriptions[activePage] || ''}
              </p>
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
