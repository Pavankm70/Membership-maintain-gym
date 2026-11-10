import React, { useState, useEffect } from 'react';
import { 
  LogIn, 
  LogOut, 
  Clock, 
  Calendar, 
  User, 
  Users, 
  RefreshCw,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { attendanceApi, membersApi } from '../api/client';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';

export default function Attendance({ showToast }) {
  const [attendanceList, setAttendanceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCount, setActiveCount] = useState(0);
  const [memberFilter, setMemberFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [membersList, setMembersList] = useState([]);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const [listRes, countRes] = await Promise.all([
        attendanceApi.getAll({
          memberId: memberFilter || null,
          page,
          size: 8
        }),
        attendanceApi.getActiveCount()
      ]);
      setAttendanceList(listRes.content || []);
      setTotalPages(listRes.totalPages || 0);
      setTotalElements(listRes.totalElements || 0);
      setActiveCount(countRes || 0);
    } catch (err) {
      showToast({ type: 'error', message: err.message || 'Failed to load attendance logs' });
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async () => {
    try {
      const res = await membersApi.getAll({ size: 100, status: 'ACTIVE' });
      setMembersList(res.content || []);
    } catch (err) {
      console.error('Error fetching members for attendance', err);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [page, memberFilter]);

  useEffect(() => {
    loadMembers();
  }, []);

  const openCheckInModal = () => {
    setSelectedMemberId(membersList.length > 0 ? membersList[0].memberId : '');
    setFormError('');
    setIsCheckInOpen(true);
  };

  const handleCheckInSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMemberId) {
      setFormError('Please select a gym member to check in.');
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      await attendanceApi.checkIn({ memberId: Number(selectedMemberId) });
      showToast({ type: 'success', message: 'Member successfully checked in!' });
      setIsCheckInOpen(false);
      fetchAttendance();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckOut = async (attendanceId, memberName) => {
    try {
      await attendanceApi.checkOut({ attendanceId });
      showToast({ type: 'success', message: `${memberName} successfully checked out!` });
      fetchAttendance();
    } catch (err) {
      showToast({ type: 'error', message: err.message });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Occupancy Banner & Actions */}
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.5rem 1rem',
            borderRadius: '0.75rem',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }}>
            <span style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 10px #10b981'
            }}></span>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Currently in Gym</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>{activeCount} Active Visitors</div>
            </div>
          </div>

          <select
            value={memberFilter}
            onChange={(e) => {
              setMemberFilter(e.target.value);
              setPage(0);
            }}
            style={{ width: '220px' }}
          >
            <option value="">All Members Log</option>
            {membersList.map((m) => (
              <option key={m.memberId} value={m.memberId}>
                {m.fullName}
              </option>
            ))}
          </select>
        </div>

        <button onClick={openCheckInModal} className="btn btn-primary">
          <LogIn size={16} />
          <span>Member Check-In</span>
        </button>
      </div>

      {/* Attendance Log Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Log ID</th>
                <th>Member Name</th>
                <th>Check-In Time</th>
                <th>Check-Out Time</th>
                <th>Session Duration</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>
                    <RefreshCw className="animate-spin" size={24} color="#10b981" style={{ margin: '0 auto' }} />
                  </td>
                </tr>
              ) : attendanceList.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    No attendance records found.
                  </td>
                </tr>
              ) : (
                attendanceList.map((a) => (
                  <tr key={a.attendanceId}>
                    <td style={{ color: '#64748b', fontFamily: 'monospace' }}>#{a.attendanceId}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#f8fafc' }}>{a.memberName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{a.memberEmail}</div>
                    </td>
                    <td style={{ color: '#cbd5e1', fontSize: '0.8125rem' }}>
                      {new Date(a.checkIn).toLocaleString()}
                    </td>
                    <td style={{ color: '#cbd5e1', fontSize: '0.8125rem' }}>
                      {a.checkOut ? new Date(a.checkOut).toLocaleString() : '—'}
                    </td>
                    <td>
                      {a.durationMinutes !== null ? (
                        <span style={{ fontWeight: 600, color: a.isOpenSession ? '#34d399' : '#e2e8f0' }}>
                          {a.durationMinutes} mins {a.isOpenSession && '(ongoing)'}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>
                      {a.isOpenSession ? (
                        <span className="badge badge-emerald">Active Workout</span>
                      ) : (
                        <span className="badge badge-slate">Completed</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {a.isOpenSession && (
                        <button
                          onClick={() => handleCheckOut(a.attendanceId, a.memberName)}
                          className="btn btn-secondary"
                          style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', color: '#fb7185' }}
                        >
                          <LogOut size={13} />
                          <span>Check Out</span>
                        </button>
                      )}
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

      {/* Check In Modal */}
      <Modal isOpen={isCheckInOpen} onClose={() => setIsCheckInOpen(false)} title="Member Gym Check-In">
        <form onSubmit={handleCheckInSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {formError && (
            <div style={{ padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', fontSize: '0.875rem' }}>
              {formError}
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
              Select Active Member *
            </label>
            <select
              required
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="">-- Choose Member --</option>
              {membersList.map((m) => (
                <option key={m.memberId} value={m.memberId}>
                  #{m.memberId} - {m.fullName} ({m.phone})
                </option>
              ))}
            </select>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.35rem' }}>
              Only members with status ACTIVE may check in. Duplicate open sessions are blocked by DBMS business logic.
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(51, 65, 85, 0.4)' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsCheckInOpen(false)}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Checking In...' : 'Confirm Check-In'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
