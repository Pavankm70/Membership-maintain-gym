import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div style={{
      position: 'fixed',
      bottom: '1.5rem',
      right: '1.5rem',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.875rem 1.25rem',
      backgroundColor: '#0f172a',
      border: `1px solid ${isSuccess ? '#10b981' : isError ? '#ef4444' : '#06b6d4'}`,
      boxShadow: `0 10px 25px -5px rgba(0,0,0,0.5), 0 0 15px ${isSuccess ? 'rgba(16,185,129,0.25)' : isError ? 'rgba(239,68,68,0.25)' : 'rgba(6,182,212,0.25)'}`,
      borderRadius: '0.75rem',
      color: '#f8fafc',
      maxWidth: '24rem',
      animation: 'fadeIn 0.25s ease-out'
    }}>
      <div style={{ color: isSuccess ? '#10b981' : isError ? '#ef4444' : '#06b6d4', flexShrink: 0 }}>
        {isSuccess && <CheckCircle2 size={20} />}
        {isError && <AlertCircle size={20} />}
        {!isSuccess && !isError && <Info size={20} />}
      </div>
      <div style={{ fontSize: '0.875rem', lineHeight: '1.4', flex: 1 }}>
        {toast.message}
      </div>
      <button
        onClick={onClose}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#94a3b8',
          cursor: 'pointer',
          padding: '0.2rem'
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
}
