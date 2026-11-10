import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Table as TableIcon, 
  Columns, 
  GitFork, 
  Share2, 
  Terminal, 
  BookOpen, 
  Play, 
  CheckCircle, 
  AlertCircle, 
  Key, 
  Link, 
  RefreshCw,
  Copy,
  ChevronRight
} from 'lucide-react';
import { explorerApi } from '../api/client';
import Pagination from '../components/Pagination';

export default function DatabaseExplorer({ showToast }) {
  const [activeTab, setActiveTab] = useState('tables');

  // Tab A: Tables Data
  const [tablesList, setTablesList] = useState([]);
  const [selectedTable, setSelectedTable] = useState('members');
  const [tableData, setTableData] = useState(null);
  const [tableDataLoading, setTableDataLoading] = useState(false);
  const [dataPage, setDataPage] = useState(0);

  // Tab B: Structure Data
  const [structureTable, setStructureTable] = useState('members');
  const [tableStructure, setTableStructure] = useState(null);
  const [structureLoading, setStructureLoading] = useState(false);

  // Tab C: Relationships
  const [relationships, setRelationships] = useState([]);

  // Tab E: SQL Lab
  const [queriesList, setQueriesList] = useState([]);
  const [selectedQueryId, setSelectedQueryId] = useState('');
  const [executingQuery, setExecutingQuery] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);

  const fetchTablesSummary = async () => {
    try {
      const summaries = await explorerApi.getTablesSummary();
      setTablesList(summaries || []);
    } catch (err) {
      console.error('Error fetching tables summary', err);
    }
  };

  const fetchTableData = async (table, page = 0) => {
    setTableDataLoading(true);
    try {
      const data = await explorerApi.getTableData(table, page, 10);
      setTableData(data);
      setDataPage(page);
    } catch (err) {
      showToast({ type: 'error', message: err.message || 'Failed to fetch table records' });
    } finally {
      setTableDataLoading(false);
    }
  };

  const fetchStructure = async (table) => {
    setStructureLoading(true);
    try {
      const struct = await explorerApi.getTableStructure(table);
      setTableStructure(struct);
    } catch (err) {
      showToast({ type: 'error', message: err.message || 'Failed to read table structure' });
    } finally {
      setStructureLoading(false);
    }
  };

  const fetchRelationships = async () => {
    try {
      const rels = await explorerApi.getRelationships();
      setRelationships(rels || []);
    } catch (err) {
      console.error('Error reading relationships', err);
    }
  };

  const fetchSqlLabQueries = async () => {
    try {
      const qList = await explorerApi.getSqlLabQueries();
      setQueriesList(qList || []);
      if (qList && qList.length > 0 && !selectedQueryId) {
        setSelectedQueryId(qList[0].id);
      }
    } catch (err) {
      console.error('Error loading SQL lab queries', err);
    }
  };

  useEffect(() => {
    fetchTablesSummary();
    fetchRelationships();
    fetchSqlLabQueries();
  }, []);

  useEffect(() => {
    if (activeTab === 'tables') {
      fetchTableData(selectedTable, 0);
    } else if (activeTab === 'structure') {
      fetchStructure(structureTable);
    }
  }, [activeTab, selectedTable, structureTable]);

  const handleExecuteQuery = async (queryId) => {
    const qId = queryId || selectedQueryId;
    if (!qId) return;

    setExecutingQuery(true);
    setExecutionResult(null);
    try {
      const result = await explorerApi.executeSqlLabQuery(qId);
      setExecutionResult(result);
      showToast({ type: 'success', message: `Query executed in ${result.executionTimeMs}ms (${result.rowCount} rows)` });
    } catch (err) {
      showToast({ type: 'error', message: err.message || 'Query execution error' });
    } finally {
      setExecutingQuery(false);
    }
  };

  const activeDemoQuery = queriesList.find(q => q.id === selectedQueryId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Tab Navigation Pill Bar */}
      <div className="glass-panel" style={{ padding: '0.625rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
        {[
          { id: 'tables', label: 'Tab A: Tables', icon: TableIcon },
          { id: 'structure', label: 'Tab B: Table Structure', icon: Columns },
          { id: 'relationships', label: 'Tab C: Relationships', icon: GitFork },
          { id: 'er_diagram', label: 'Tab D: ER Diagram', icon: Share2 },
          { id: 'sql_lab', label: 'Tab E: SQL Lab (Live)', icon: Terminal },
          { id: 'dbms_concepts', label: 'Tab F: DBMS Concepts', icon: BookOpen }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={isActive ? 'btn btn-primary' : 'btn btn-secondary'}
              style={{
                fontSize: '0.8125rem',
                padding: '0.55rem 0.95rem',
                border: isActive ? 'none' : '1px solid rgba(51, 65, 85, 0.5)'
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* =================================================================== */}
      {/* TAB A: TABLES & PAGINATED DATA GRID                                 */}
      {/* =================================================================== */}
      {activeTab === 'tables' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Table Selector Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '0.75rem'
          }}>
            {tablesList.map((t) => {
              const isSelected = selectedTable === t.tableName;
              return (
                <button
                  key={t.tableName}
                  onClick={() => {
                    setSelectedTable(t.tableName);
                    setDataPage(0);
                  }}
                  className={`glass-panel glass-panel-hover ${isSelected ? 'border-emerald-500' : ''}`}
                  style={{
                    padding: '0.875rem 1rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(15, 23, 42, 0.75)',
                    border: isSelected ? '1px solid #10b981' : '1px solid rgba(51, 65, 85, 0.5)',
                    borderRadius: '0.75rem'
                  }}
                >
                  <div style={{ fontSize: '0.75rem', color: isSelected ? '#34d399' : '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                    TABLE
                  </div>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.15rem' }}>
                    {t.tableName}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '0.25rem' }}>
                    {t.rowCount} records &bull; {t.columnCount} cols
                  </div>
                </button>
              );
            })}
          </div>

          {/* Table Data Viewer */}
          <div className="glass-panel" style={{ padding: '1.25rem', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#f8fafc' }}>
                  Raw MySQL Data: <span style={{ color: '#10b981', fontFamily: 'monospace' }}>{selectedTable}</span>
                </h3>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  Direct read from MySQL 8 InnoDB engine &bull; {tableData?.totalRecords || 0} total records
                </p>
              </div>

              <button onClick={() => fetchTableData(selectedTable, dataPage)} className="btn btn-secondary" style={{ padding: '0.4rem 0.75rem' }}>
                <RefreshCw size={14} />
                <span>Refresh Grid</span>
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              {tableDataLoading ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <RefreshCw className="animate-spin" size={24} color="#10b981" style={{ margin: '0 auto' }} />
                </div>
              ) : tableData?.rows?.length > 0 ? (
                <table className="custom-table">
                  <thead>
                    <tr>
                      {Object.keys(tableData.rows[0]).map((col) => (
                        <th key={col}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.rows.map((row, idx) => (
                      <tr key={idx}>
                        {Object.values(row).map((val, cIdx) => (
                          <td key={cIdx} style={{ fontSize: '0.8125rem' }}>
                            {val !== null ? String(val) : <span style={{ color: '#64748b', fontStyle: 'italic' }}>NULL</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                  Table '{selectedTable}' is currently empty.
                </div>
              )}
            </div>

            {tableData && tableData.totalRecords > 10 && (
              <Pagination
                currentPage={dataPage}
                totalPages={Math.ceil(tableData.totalRecords / 10)}
                totalElements={tableData.totalRecords}
                pageSize={10}
                onPageChange={(p) => fetchTableData(selectedTable, p)}
              />
            )}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB B: TABLE STRUCTURE (INFORMATION_SCHEMA METADATA)                */}
      {/* =================================================================== */}
      {activeTab === 'structure' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f8fafc' }}>Select Target Table:</span>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {tablesList.map((t) => (
                <button
                  key={t.tableName}
                  onClick={() => setStructureTable(t.tableName)}
                  className={structureTable === t.tableName ? 'btn btn-primary' : 'btn btn-secondary'}
                  style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}
                >
                  {t.tableName}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', overflow: 'hidden' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#f8fafc' }}>
                Schema Definition: <span style={{ color: '#10b981', fontFamily: 'monospace' }}>{structureTable}</span>
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Queried live from MySQL <code style={{ color: '#38bdf8' }}>INFORMATION_SCHEMA.COLUMNS</code> &amp; <code style={{ color: '#38bdf8' }}>KEY_COLUMN_USAGE</code>
              </p>
            </div>

            <div style={{ overflowX: 'auto', marginBottom: '2rem' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Column Name</th>
                    <th>SQL Data Type</th>
                    <th>Nullability</th>
                    <th>Keys &amp; Constraints</th>
                    <th>Default Value</th>
                    <th>Extra Attributes</th>
                  </tr>
                </thead>
                <tbody>
                  {structureLoading ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}>
                        <RefreshCw className="animate-spin" size={24} color="#10b981" style={{ margin: '0 auto' }} />
                      </td>
                    </tr>
                  ) : tableStructure?.columns?.map((col) => (
                    <tr key={col.columnName}>
                      <td style={{ fontWeight: 700, color: '#f8fafc', fontFamily: 'monospace' }}>
                        {col.columnName}
                      </td>
                      <td style={{ color: '#38bdf8', fontFamily: 'monospace' }}>
                        {col.dataType}
                      </td>
                      <td>
                        <span className={col.nullable ? 'badge badge-slate' : 'badge badge-amber'}>
                          {col.nullable ? 'NULLABLE' : 'NOT NULL'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                          {col.primaryKey && (
                            <span className="badge badge-emerald">
                              <Key size={12} />
                              <span>PRIMARY KEY</span>
                            </span>
                          )}
                          {col.foreignKey && (
                            <span className="badge badge-cyan" title={`References ${col.referencedTable}(${col.referencedColumn})`}>
                              <Link size={12} />
                              <span>FK &rarr; {col.referencedTable}({col.referencedColumn})</span>
                            </span>
                          )}
                          {col.unique && !col.primaryKey && (
                            <span className="badge badge-amber">
                              UNIQUE
                            </span>
                          )}
                          {!col.primaryKey && !col.foreignKey && !col.unique && (
                            <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Standard Column</span>
                          )}
                        </div>
                      </td>
                      <td style={{ color: '#94a3b8', fontFamily: 'monospace' }}>
                        {col.defaultValue !== null ? col.defaultValue : <span style={{ color: '#64748b' }}>NULL</span>}
                      </td>
                      <td style={{ color: '#cbd5e1', fontSize: '0.8125rem' }}>
                        {col.extra || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Indexes on this table */}
            <div>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.75rem' }}>
                Indexes Defined on Table (SHOW INDEX)
              </h4>
              <div style={{ overflowX: 'auto' }}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Key Name</th>
                      <th>Column</th>
                      <th>Unique</th>
                      <th>Index Type</th>
                      <th>Collation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableStructure?.indexes?.map((idx, i) => (
                      <tr key={i}>
                        <td style={{ fontFamily: 'monospace', color: '#f8fafc', fontWeight: 600 }}>
                          {idx.Key_name || idx.key_name}
                        </td>
                        <td style={{ fontFamily: 'monospace', color: '#38bdf8' }}>
                          {idx.Column_name || idx.column_name}
                        </td>
                        <td>
                          <span className={(idx.Non_unique === 0 || idx.non_unique === 0) ? 'badge badge-emerald' : 'badge badge-slate'}>
                            {(idx.Non_unique === 0 || idx.non_unique === 0) ? 'UNIQUE (B-Tree)' : 'NON-UNIQUE'}
                          </span>
                        </td>
                        <td style={{ color: '#cbd5e1' }}>
                          {idx.Index_type || idx.index_type || 'BTREE'}
                        </td>
                        <td style={{ color: '#94a3b8' }}>
                          {idx.Collation || idx.collation || 'A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB C: RELATIONSHIPS & CARDINALITIES                                */}
      {/* =================================================================== */}
      {activeTab === 'relationships' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#f8fafc' }}>
              Foreign Key Relationship Mapping &amp; Referential Integrity
            </h3>
            <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginTop: '0.25rem' }}>
              Strict database referential constraints enforcing 1:N cardinalities, cascading rules, and financial protection.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
            gap: '1.25rem'
          }}>
            {relationships.map((rel, idx) => (
              <div key={idx} className="glass-panel glass-panel-hover" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span className="badge badge-emerald" style={{ fontFamily: 'monospace' }}>
                      {rel.foreignKeyName}
                    </span>
                    <span className="badge badge-cyan">
                      {rel.cardinality}
                    </span>
                  </div>

                  {/* Visual Link */}
                  <div style={{
                    padding: '0.875rem',
                    borderRadius: '0.5rem',
                    backgroundColor: 'rgba(15, 23, 42, 0.7)',
                    border: '1px solid rgba(51, 65, 85, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1rem'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Child Table (FK)</div>
                      <div style={{ fontWeight: 700, color: '#f8fafc', fontFamily: 'monospace' }}>
                        {rel.fromTable}.{rel.fromColumn}
                      </div>
                    </div>
                    <div style={{ color: '#10b981', fontWeight: 800 }}>&rarr;</div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Parent Table (PK)</div>
                      <div style={{ fontWeight: 700, color: '#38bdf8', fontFamily: 'monospace' }}>
                        {rel.toTable}.{rel.toColumn}
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.8125rem', color: '#cbd5e1', lineHeight: '1.5', marginBottom: '1rem' }}>
                    {rel.description}
                  </p>
                </div>

                <div style={{
                  paddingTop: '0.875rem',
                  borderTop: '1px solid rgba(51, 65, 85, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.75rem',
                  color: '#94a3b8'
                }}>
                  <div>ON DELETE: <strong style={{ color: rel.onDelete === 'RESTRICT' ? '#fbbf24' : rel.onDelete === 'CASCADE' ? '#f87171' : '#38bdf8' }}>{rel.onDelete}</strong></div>
                  <div>ON UPDATE: <strong style={{ color: '#34d399' }}>{rel.onUpdate}</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB D: ER DIAGRAM (INTERACTIVE & MERMAID)                           */}
      {/* =================================================================== */}
      {activeTab === 'er_diagram' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#f8fafc' }}>
              GymSphere Relational Entity-Relationship Diagram (ERD)
            </h3>
            <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginTop: '0.25rem' }}>
              Normalized 3NF schema showing entities, primary keys (PK), foreign keys (FK), unique constraints (UK), and cardinalities.
            </p>
          </div>

          {/* Visual Entity Cards Hierarchy */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.25rem'
          }}>
            {[
              {
                name: 'MEMBERS',
                type: 'Strong Entity (Core Roster)',
                pk: 'member_id (BIGINT)',
                cols: ['full_name VARCHAR(100)', 'email VARCHAR(150) UNIQUE', 'phone VARCHAR(20) UNIQUE', 'gender VARCHAR(20)', 'join_date DATE', 'status VARCHAR(20)'],
                relations: ['1 : N with SUBSCRIPTIONS', '1 : N with ATTENDANCE']
              },
              {
                name: 'TRAINERS',
                type: 'Strong Entity (Staff)',
                pk: 'trainer_id (BIGINT)',
                cols: ['full_name VARCHAR(100)', 'email VARCHAR(150) UNIQUE', 'phone VARCHAR(20)', 'specialization VARCHAR(100)', 'status VARCHAR(20)'],
                relations: ['0..1 : N with SUBSCRIPTIONS']
              },
              {
                name: 'MEMBERSHIP_PLANS',
                type: 'Catalog Entity',
                pk: 'plan_id (BIGINT)',
                cols: ['plan_name VARCHAR(100) UNIQUE', 'duration_months INT (CHECK > 0)', 'price DECIMAL(10,2) (CHECK >= 0)', 'description VARCHAR(500)'],
                relations: ['1 : N with SUBSCRIPTIONS']
              },
              {
                name: 'SUBSCRIPTIONS',
                type: 'Associative Junction Entity',
                pk: 'subscription_id (BIGINT)',
                cols: ['member_id FK -> members', 'plan_id FK -> membership_plans', 'trainer_id FK -> trainers (Nullable)', 'start_date DATE', 'end_date DATE', 'amount_at_purchase DECIMAL(10,2)'],
                relations: ['1 : N with PAYMENTS']
              },
              {
                name: 'PAYMENTS',
                type: 'Financial Ledger Entity',
                pk: 'payment_id (BIGINT)',
                cols: ['subscription_id FK -> subscriptions', 'amount DECIMAL(10,2)', 'payment_date TIMESTAMP', 'payment_method VARCHAR(30)', 'payment_status VARCHAR(20)', 'transaction_ref UNIQUE'],
                relations: ['Child of SUBSCRIPTIONS']
              },
              {
                name: 'ATTENDANCE',
                type: 'Operational Access Log',
                pk: 'attendance_id (BIGINT)',
                cols: ['member_id FK -> members', 'check_in TIMESTAMP', 'check_out TIMESTAMP (CHECK >= check_in)'],
                relations: ['Child of MEMBERS']
              },
              {
                name: 'USERS',
                type: 'Security & Auth (Decoupled)',
                pk: 'user_id (BIGINT)',
                cols: ['full_name VARCHAR(100)', 'email VARCHAR(150) UNIQUE', 'password_hash VARCHAR(255) (BCrypt)', 'role VARCHAR(20) (ADMIN / STAFF)', 'enabled BOOLEAN'],
                relations: ['Independent authentication domain']
              }
            ].map((ent, i) => (
              <div key={i} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.05em' }}>{ent.name}</h4>
                  <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>TABLE</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600 }}>{ent.type}</div>

                <div style={{ padding: '0.5rem', borderRadius: '0.375rem', backgroundColor: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(51, 65, 85, 0.4)', fontSize: '0.75rem', color: '#34d399', fontFamily: 'monospace' }}>
                  PK: {ent.pk}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Key Columns:</span>
                  {ent.cols.map((c, cI) => (
                    <div key={cI} style={{ fontSize: '0.75rem', color: '#cbd5e1', fontFamily: 'monospace' }}>
                      &bull; {c}
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(51, 65, 85, 0.4)' }}>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Relationships:</span>
                  {ent.relations.map((r, rI) => (
                    <div key={rI} style={{ fontSize: '0.75rem', color: '#c4b5fd' }}>
                      &rarr; {r}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Raw Mermaid Syntax Box */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem' }}>
              Standard Mermaid ER Syntax (College Viva Presentation)
            </h4>
            <pre style={{
              backgroundColor: '#0a0e17',
              padding: '1.25rem',
              borderRadius: '0.75rem',
              fontSize: '0.8125rem',
              color: '#34d399',
              overflowX: 'auto',
              border: '1px solid rgba(51, 65, 85, 0.5)',
              lineHeight: '1.5'
            }}>
{`erDiagram
    MEMBERS ||--o{ SUBSCRIPTIONS : "purchases (1:N)"
    MEMBERS ||--o{ ATTENDANCE : "logs (1:N)"
    MEMBERSHIP_PLANS ||--o{ SUBSCRIPTIONS : "defines (1:N)"
    TRAINERS |o--o{ SUBSCRIPTIONS : "mentors (0/1:N)"
    SUBSCRIPTIONS ||--o{ PAYMENTS : "billed_via (1:N)"`}
            </pre>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB E: SQL LAB (EDUCATIONAL DEMONSTRATION SUITE)                    */}
      {/* =================================================================== */}
      {activeTab === 'sql_lab' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#f8fafc' }}>
              Interactive DBMS SQL Demonstration Lab
            </h3>
            <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginTop: '0.25rem' }}>
              Select a pre-compiled DBMS query to execute against the live MySQL 8 database. Safe read-only execution protects database integrity.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {/* Left: Query Selector */}
            <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                Selectable Viva Demonstrations
              </span>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '420px', overflowY: 'auto' }}>
                {queriesList.map((q) => {
                  const isSelected = selectedQueryId === q.id;
                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        setSelectedQueryId(q.id);
                        handleExecuteQuery(q.id);
                      }}
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '0.625rem',
                        textAlign: 'left',
                        background: isSelected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(15, 23, 42, 0.6)',
                        border: isSelected ? '1px solid #10b981' : '1px solid rgba(51, 65, 85, 0.4)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                        <span style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 600 }}>{q.category}</span>
                        {isSelected && <span className="badge badge-emerald" style={{ fontSize: '0.6rem' }}>ACTIVE</span>}
                      </div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f8fafc' }}>{q.title}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: SQL Preview & Execution Controls */}
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div>
                    <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
                      {activeDemoQuery?.category || 'SQL Demo'}
                    </span>
                    <h4 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#f8fafc', marginTop: '0.35rem' }}>
                      {activeDemoQuery?.title}
                    </h4>
                  </div>

                  <button
                    onClick={() => handleExecuteQuery(selectedQueryId)}
                    disabled={executingQuery}
                    className="btn btn-primary"
                    style={{ padding: '0.55rem 1rem' }}
                  >
                    {executingQuery ? <RefreshCw className="animate-spin" size={16} /> : <Play size={16} fill="#fff" />}
                    <span>{executingQuery ? 'Running...' : 'Execute Query'}</span>
                  </button>
                </div>

                <p style={{ fontSize: '0.8125rem', color: '#cbd5e1', lineHeight: '1.5', marginBottom: '1rem' }}>
                  {activeDemoQuery?.explanation}
                </p>

                <div style={{ position: 'relative' }}>
                  <pre style={{
                    backgroundColor: '#0a0e17',
                    padding: '1.25rem',
                    borderRadius: '0.75rem',
                    fontSize: '0.8125rem',
                    color: '#34d399',
                    overflowX: 'auto',
                    border: '1px solid rgba(51, 65, 85, 0.5)',
                    lineHeight: '1.5',
                    fontFamily: 'monospace'
                  }}>
                    {activeDemoQuery?.sql}
                  </pre>
                </div>
              </div>

              {executionResult && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                  <span>Query Executed: <strong style={{ color: '#f8fafc' }}>{executionResult.queryId}</strong></span>
                  <span>Execution Time: <strong style={{ color: '#10b981' }}>{executionResult.executionTimeMs} ms</strong> &bull; <strong style={{ color: '#38bdf8' }}>{executionResult.rowCount} rows returned</strong></span>
                </div>
              )}
            </div>
          </div>

          {/* Results Grid */}
          <div className="glass-panel" style={{ padding: '1.5rem', overflow: 'hidden' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '1rem' }}>
              Execution Result Grid
            </h4>

            {executingQuery ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <RefreshCw className="animate-spin" size={28} color="#10b981" style={{ margin: '0 auto' }} />
                <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.75rem' }}>Executing SQL statement in MySQL 8...</p>
              </div>
            ) : executionResult?.error ? (
              <div style={{ padding: '1rem', borderRadius: '0.5rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5' }}>
                {executionResult.error}
              </div>
            ) : executionResult?.rows?.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      {executionResult.columns.map((col) => (
                        <th key={col}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {executionResult.rows.map((row, rI) => (
                      <tr key={rI}>
                        {executionResult.columns.map((col, cI) => (
                          <td key={cI} style={{ fontSize: '0.8125rem' }}>
                            {row[col] !== null ? String(row[col]) : <span style={{ color: '#64748b', fontStyle: 'italic' }}>NULL</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: '2.5rem', textAlign: 'center', color: '#94a3b8' }}>
                Select a query above and click "Execute Query" to see live database results.
              </div>
            )}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB F: DBMS CONCEPTS (VIVA COMPANION)                               */}
      {/* =================================================================== */}
      {activeTab === 'dbms_concepts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#f8fafc' }}>
              DBMS Academic &amp; Viva Companion
            </h3>
            <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginTop: '0.25rem' }}>
              Core database management concepts illustrated using GymSphere's actual schema, tables, and transactional rules.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '1.25rem'
          }}>
            {[
              {
                title: 'Primary Keys vs. Foreign Keys',
                badge: 'Integrity',
                summary: 'Primary Keys uniquely identify a tuple. Foreign Keys link tuples across relations to enforce integrity.',
                example: 'subscriptions.member_id is a Foreign Key referencing members.member_id (Primary Key). Every subscription is guaranteed to belong to a registered member.'
              },
              {
                title: 'Referential Actions: RESTRICT vs. CASCADE',
                badge: 'Integrity Rules',
                summary: 'ON DELETE RESTRICT rejects deletions if child rows exist. ON DELETE CASCADE purges child rows automatically.',
                example: 'subscriptions has ON DELETE RESTRICT on member_id (preserving financial accounting history). attendance has ON DELETE CASCADE on member_id (deleting log sessions if member is purged).'
              },
              {
                title: 'Table Constraints (NOT NULL, UNIQUE, CHECK)',
                badge: 'Domain Constraints',
                summary: 'Domain constraints guarantee data validity at the database engine level, rejecting invalid states before write.',
                example: 'membership_plans uses CHECK (duration_months > 0) and CHECK (price >= 0.00). members uses UNIQUE(email) and UNIQUE(phone) to prevent duplicate profiles.'
              },
              {
                title: 'Third Normal Form (3NF) & Redundancy Reduction',
                badge: 'Normalization',
                summary: 'Eliminates transitive dependencies so every non-prime attribute is dependent solely on the primary key.',
                example: 'We do not store plan duration or plan name in subscriptions. We only store plan_id. The plan price is copied to amount_at_purchase because it is a snapshot of the sale price at that exact historical moment.'
              },
              {
                title: 'B-Tree Indexes & Query Optimization',
                badge: 'Performance',
                summary: 'Indexes accelerate SELECT queries by providing logarithmic O(log N) lookup instead of full table scans O(N).',
                example: 'We index idx_subs_status_dates (status, start_date, end_date) and idx_members_email to instantly resolve member lookups and dashboard expiration forecasts.'
              },
              {
                title: 'ACID Transactions (Atomicity & Rollback)',
                badge: 'Concurrency Control',
                summary: 'ACID guarantees that multi-step financial or enrollment workflows either succeed completely or revert cleanly.',
                example: 'When issuing a subscription and recording an initial payment, both statements run inside @Transactional. If payment fails, the subscription creation is rolled back.'
              }
            ].map((concept, idx) => (
              <div key={idx} className="glass-panel glass-panel-hover" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>{concept.badge}</span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Concept #{idx + 1}</span>
                </div>

                <h4 style={{ fontSize: '1.0625rem', fontWeight: 800, color: '#f8fafc' }}>
                  {concept.title}
                </h4>

                <p style={{ fontSize: '0.8125rem', color: '#cbd5e1', lineHeight: '1.5' }}>
                  {concept.summary}
                </p>

                <div style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '0.5rem',
                  backgroundColor: 'rgba(15, 23, 42, 0.7)',
                  border: '1px solid rgba(51, 65, 85, 0.5)',
                  fontSize: '0.75rem',
                  color: '#94a3b8',
                  lineHeight: '1.4'
                }}>
                  <strong style={{ color: '#38bdf8' }}>GymSphere Example: </strong>
                  {concept.example}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
