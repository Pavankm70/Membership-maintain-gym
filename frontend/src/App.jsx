import React, { useState, useEffect } from 'react';
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Trainers from './pages/Trainers';
import Plans from './pages/Plans';
import Subscriptions from './pages/Subscriptions';
import Payments from './pages/Payments';
import Attendance from './pages/Attendance';
import Reports from './pages/Reports';
import Users from './pages/Users';
import DatabaseExplorer from './pages/DatabaseExplorer';
import Toast from './components/Toast';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activePage, setActivePage] = useState('dashboard');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('gymsphere_user');
    const token = localStorage.getItem('gymsphere_token');
    if (savedUser && token) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('gymsphere_user');
        localStorage.removeItem('gymsphere_token');
      }
    }
  }, []);

  const showToast = ({ type = 'info', message }) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setActivePage('dashboard');
    showToast({ type: 'success', message: `Welcome back, ${user.fullName}!` });
  };

  const handleLogout = () => {
    localStorage.removeItem('gymsphere_token');
    localStorage.removeItem('gymsphere_user');
    setCurrentUser(null);
    showToast({ type: 'info', message: 'You have been safely signed out.' });
  };

  if (!currentUser) {
    return (
      <>
        <Login onLoginSuccess={handleLoginSuccess} />
        <Toast toast={toast} onClose={() => setToast(null)} />
      </>
    );
  }

  return (
    <>
      <AdminLayout
        activePage={activePage}
        setActivePage={setActivePage}
        user={currentUser}
        onLogout={handleLogout}
      >
        {activePage === 'dashboard' && <Dashboard setActivePage={setActivePage} />}
        {activePage === 'members' && <Members showToast={showToast} />}
        {activePage === 'trainers' && <Trainers showToast={showToast} />}
        {activePage === 'plans' && <Plans showToast={showToast} />}
        {activePage === 'subscriptions' && <Subscriptions showToast={showToast} />}
        {activePage === 'payments' && <Payments showToast={showToast} />}
        {activePage === 'attendance' && <Attendance showToast={showToast} />}
        {activePage === 'reports' && <Reports showToast={showToast} />}
        {activePage === 'users' && <Users currentUser={currentUser} showToast={showToast} />}
        {activePage === 'explorer' && <DatabaseExplorer showToast={showToast} />}
      </AdminLayout>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}
