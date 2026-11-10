import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export default function Pagination({ currentPage, totalPages, totalElements, pageSize, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1rem 0.5rem',
      flexWrap: 'wrap',
      gap: '0.75rem',
      color: '#94a3b8',
      fontSize: '0.875rem'
    }}>
      <div>
        Showing page <span style={{ color: '#f8fafc', fontWeight: 600 }}>{currentPage + 1}</span> of{' '}
        <span style={{ color: '#f8fafc', fontWeight: 600 }}>{totalPages}</span> ({totalElements} total records)
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
        <button
          className="btn btn-secondary"
          style={{ padding: '0.4rem 0.6rem', opacity: currentPage === 0 ? 0.4 : 1 }}
          disabled={currentPage === 0}
          onClick={() => onPageChange(0)}
          title="First Page"
        >
          <ChevronsLeft size={16} />
        </button>

        <button
          className="btn btn-secondary"
          style={{ padding: '0.4rem 0.6rem', opacity: currentPage === 0 ? 0.4 : 1 }}
          disabled={currentPage === 0}
          onClick={() => onPageChange(currentPage - 1)}
          title="Previous Page"
        >
          <ChevronLeft size={16} />
        </button>

        <span style={{
          padding: '0.35rem 0.75rem',
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          color: '#34d399',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '0.375rem',
          fontWeight: 600
        }}>
          {currentPage + 1}
        </span>

        <button
          className="btn btn-secondary"
          style={{ padding: '0.4rem 0.6rem', opacity: currentPage >= totalPages - 1 ? 0.4 : 1 }}
          disabled={currentPage >= totalPages - 1}
          onClick={() => onPageChange(currentPage + 1)}
          title="Next Page"
        >
          <ChevronRight size={16} />
        </button>

        <button
          className="btn btn-secondary"
          style={{ padding: '0.4rem 0.6rem', opacity: currentPage >= totalPages - 1 ? 0.4 : 1 }}
          disabled={currentPage >= totalPages - 1}
          onClick={() => onPageChange(totalPages - 1)}
          title="Last Page"
        >
          <ChevronsRight size={16} />
        </button>
      </div>
    </div>
  );
}
