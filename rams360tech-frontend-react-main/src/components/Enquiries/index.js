import React, { useState, useEffect, useCallback, useRef } from "react";
import Api from "../../Api";

// ─── Constants ───────────────────────────────────────────────────────────────
const ENQUIRY_BASE = "/api/v1/enquiry";
const STATUSES = ["New", "Contacted", "In Progress", "Closed"];
const ENQUIRY_TYPES = ["Beta Access", "Demo Request", "Pricing", "Partnership", "General"];
const LIMIT_OPTIONS = [5, 10, 20, 50];

const EMPTY_FORM = {
  fullName: "",
  workEmail: "",
  company: "",
  role: "",
  country: "",
  enquiryType: "Beta Access",
  message: "",
  consent: false,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function validateForm(form) {
  const errors = {};
  if (!form.fullName.trim()) errors.fullName = "Full name is required";
  if (!form.workEmail.trim()) errors.workEmail = "Work email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.workEmail))
    errors.workEmail = "Enter a valid email address";
  if (!form.company.trim()) errors.company = "Company is required";
  if (!form.role.trim()) errors.role = "Role is required";
  if (!form.country.trim()) errors.country = "Country is required";
  if (!form.message.trim()) errors.message = "Message is required";
  if (!form.consent) errors.consent = "You must give consent to proceed";
  return errors;
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    New: styles.badgeNew,
    Contacted: styles.badgeContacted,
    "In Progress": styles.badgeInProgress,
    Closed: styles.badgeClosed,
  };
  return (
    <span style={{ ...styles.badge, ...(map[status] || styles.badgeClosed) }}>
      {status}
    </span>
  );
}

function Toast({ message, type, visible }) {
  return (
    <div
      style={{
        ...styles.toast,
        ...(type === "success" ? styles.toastSuccess : styles.toastError),
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <span style={styles.toastIcon}>{type === "success" ? "✓" : "✕"}</span>
      {message}
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={styles.statCard}>
      <div style={{ ...styles.statNum, color }}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  );
}

function FormField({ label, error, children }) {
  return (
    <div style={styles.formGroup}>
      <label style={styles.fieldLabel}>{label}</label>
      {children}
      {error && <p style={styles.errorText}>{error}</p>}
    </div>
  );
}

function Modal({ onClose, title, children, footer }) {
  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <span style={styles.modalTitle}>{title}</span>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div style={styles.modalBody}>{children}</div>
        {footer && <div style={styles.modalFooter}>{footer}</div>}
      </div>
    </div>
  );
}

// ─── Create Enquiry Modal ─────────────────────────────────────────────────────
function CreateEnquiryModal({ onClose, onSuccess }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    const errs = validateForm(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      const res = await Api.post(ENQUIRY_BASE, form);
      if (res.data?.success) { onSuccess("Enquiry submitted successfully"); onClose(); }
    } catch (e) {
      const msg = e.response?.data?.message || "Submission failed";
      setErrors({ _server: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="New Enquiry"
      onClose={onClose}
      footer={
        <>
          <button style={styles.btnSecondary} onClick={onClose}>Cancel</button>
          <button style={styles.btnPrimary} onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting…" : "Submit Enquiry"}
          </button>
        </>
      }
    >
      {errors._server && <div style={styles.serverError}>{errors._server}</div>}
      <div style={styles.formRow}>
        <FormField label="Full name *" error={errors.fullName}>
          <input style={styles.input} value={form.fullName}
            onChange={(e) => set("fullName", e.target.value)} placeholder="John Doe" />
        </FormField>
        <FormField label="Work email *" error={errors.workEmail}>
          <input style={styles.input} type="email" value={form.workEmail}
            onChange={(e) => set("workEmail", e.target.value)} placeholder="john@company.com" />
        </FormField>
      </div>
      <div style={styles.formRow}>
        <FormField label="Company *" error={errors.company}>
          <input style={styles.input} value={form.company}
            onChange={(e) => set("company", e.target.value)} placeholder="Acme Inc." />
        </FormField>
        <FormField label="Role *" error={errors.role}>
          <input style={styles.input} value={form.role}
            onChange={(e) => set("role", e.target.value)} placeholder="e.g. CTO" />
        </FormField>
      </div>
      <div style={styles.formRow}>
        <FormField label="Country *" error={errors.country}>
          <input style={styles.input} value={form.country}
            onChange={(e) => set("country", e.target.value)} placeholder="India" />
        </FormField>
        <FormField label="Enquiry type">
          <select style={styles.input} value={form.enquiryType}
            onChange={(e) => set("enquiryType", e.target.value)}>
            {ENQUIRY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </FormField>
      </div>
      <FormField label="Message *" error={errors.message}>
        <textarea style={{ ...styles.input, minHeight: 90, resize: "vertical" }}
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
          placeholder="Tell us more about your use case…" />
      </FormField>
      <div style={styles.consentRow}>
        <input type="checkbox" id="consent" checked={form.consent}
          onChange={(e) => set("consent", e.target.checked)} style={{ marginTop: 2 }} />
        <label htmlFor="consent" style={styles.consentLabel}>
          I consent to RAMS360 collecting and processing my data for the purpose of this enquiry.
        </label>
      </div>
      {errors.consent && <p style={{ ...styles.errorText, marginTop: 4 }}>{errors.consent}</p>}
    </Modal>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────
function DetailModal({ enquiry, onClose }) {
  const fields = [
    { label: "Company", value: enquiry.company },
    { label: "Role", value: enquiry.role },
    { label: "Country", value: enquiry.country },
    { label: "Enquiry type", value: enquiry.enquiryType || "—" },
    { label: "Created", value: formatDate(enquiry.createdAt) },
    { label: "Updated", value: formatDate(enquiry.updatedAt) },
  ];
  return (
    <Modal title="Enquiry Details" onClose={onClose}
      footer={<button style={styles.btnSecondary} onClick={onClose}>Close</button>}>
      <div style={styles.detailMeta}>
        <div>
          <div style={styles.detailName}>{enquiry.fullName}</div>
          <div style={styles.detailEmail}>{enquiry.workEmail}</div>
        </div>
        <StatusBadge status={enquiry.status} />
      </div>
      <div style={styles.detailGrid}>
        {fields.map((f) => (
          <div key={f.label} style={styles.detailItem}>
            <div style={styles.detailItemLabel}>{f.label}</div>
            <div style={styles.detailItemValue}>{f.value}</div>
          </div>
        ))}
        <div style={{ ...styles.detailItem, gridColumn: "1 / -1" }}>
          <div style={styles.detailItemLabel}>Message</div>
          <div style={{ ...styles.detailItemValue, fontWeight: 400, lineHeight: 1.65 }}>
            {enquiry.message}
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
function DeleteModal({ name, onCancel, onConfirm }) {
  return (
    <div style={styles.overlay}>
      <div style={styles.confirmModal}>
        <div style={styles.confirmTitle}>Delete enquiry?</div>
        <div style={styles.confirmMsg}>
          Are you sure you want to delete the enquiry from{" "}
          <strong>{name}</strong>? This action cannot be undone.
        </div>
        <div style={styles.confirmActions}>
          <button style={styles.btnSecondary} onClick={onCancel}>Cancel</button>
          <button style={styles.btnDanger} onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ pagination, onPage }) {
  const { page, total, limit, pages } = pagination;
  const totalPages = Math.max(1, pages || Math.ceil(total / limit) || 1);
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const visiblePages = () => {
    const arr = [];
    if (totalPages <= 5) { for (let i = 1; i <= totalPages; i++) arr.push(i); }
    else if (page <= 3) { for (let i = 1; i <= 5; i++) arr.push(i); }
    else if (page >= totalPages - 2) { for (let i = totalPages - 4; i <= totalPages; i++) arr.push(i); }
    else { for (let i = page - 2; i <= page + 2; i++) arr.push(i); }
    return arr;
  };

  return (
    <div style={styles.pagination}>
      <span style={styles.paginationInfo}>
        Showing {from}–{to} of {total}
      </span>
      <div style={styles.pageButtons}>
        <button style={styles.pageBtn} onClick={() => onPage(page - 1)} disabled={page <= 1}>←</button>
        {visiblePages().map((p) => (
          <button
            key={p}
            style={{ ...styles.pageBtn, ...(p === page ? styles.pageBtnActive : {}) }}
            onClick={() => onPage(p)}
          >
            {p}
          </button>
        ))}
        <button style={styles.pageBtn} onClick={() => onPage(page + 1)} disabled={page >= totalPages}>→</button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Index() {
  const [enquiries, setEnquiries] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 0 });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, name }
  const [toast, setToast] = useState({ message: "", type: "success", visible: false });
  const searchTimer = useRef(null);

  // ── Stats derived ──────────────────────────────────────────────────────────
  const stats = {
    total: pagination.total,
    New: enquiries.filter((e) => e.status === "New").length,
    Contacted: enquiries.filter((e) => e.status === "Contacted").length,
    "In Progress": enquiries.filter((e) => e.status === "In Progress").length,
    Closed: enquiries.filter((e) => e.status === "Closed").length,
  };

  // ── Toast helper ───────────────────────────────────────────────────────────
  const showToast = (message, type = "success") => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3000);
  };

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchEnquiries = useCallback(
    async (overrides = {}) => {
      setLoading(true);
      try {
        const params = {
          page: pagination.page,
          limit: pagination.limit,
          ...(search ? { search } : {}),
          ...(statusFilter ? { status: statusFilter } : {}),
          ...overrides,
        };
        const res = await Api.get(ENQUIRY_BASE, { params });
        if (res.data?.success) {
          setEnquiries(res.data.data || []);
          setPagination((prev) => ({ ...prev, ...res.data.pagination }));
        }
      } catch (e) {
        showToast(e.response?.data?.message || "Failed to load enquiries", "error");
      } finally {
        setLoading(false);
      }
    },
    [pagination.page, pagination.limit, search, statusFilter]
  );

  useEffect(() => { fetchEnquiries(); }, [pagination.page, pagination.limit, statusFilter]);

  // ── Search debounce ────────────────────────────────────────────────────────
  const handleSearch = (val) => {
    setSearch(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setPagination((p) => ({ ...p, page: 1 }));
      fetchEnquiries({ page: 1, search: val });
    }, 450);
  };

  // ── Status update ──────────────────────────────────────────────────────────
  const handleStatusChange = async (id, status) => {
    try {
      const res = await Api.put(`${ENQUIRY_BASE}/${id}`, { status });
      if (res.data?.success) {
        setEnquiries((prev) => prev.map((e) => (e._id === id ? { ...e, status } : e)));
        showToast("Status updated");
      }
    } catch (e) {
      showToast(e.response?.data?.message || "Update failed", "error");
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await Api.delete(`${ENQUIRY_BASE}/${deleteTarget.id}`);
      if (res.data?.success) {
        showToast("Enquiry deleted");
        setDeleteTarget(null);
        fetchEnquiries();
      }
    } catch (e) {
      showToast(e.response?.data?.message || "Delete failed", "error");
    }
  };

  // ── View detail ────────────────────────────────────────────────────────────
  const handleViewDetail = async (id) => {
    try {
      const res = await Api.get(`${ENQUIRY_BASE}/${id}`);
      if (res.data?.success) setDetailData(res.data.data);
    } catch (e) {
      showToast(e.response?.data?.message || "Failed to load detail", "error");
    }
  };

  // ── Pagination & filter handlers ───────────────────────────────────────────
  const goPage = (p) => setPagination((prev) => ({ ...prev, page: p }));
  const handleLimitChange = (val) => setPagination((prev) => ({ ...prev, limit: Number(val), page: 1 }));
  const handleStatusFilter = (val) => { setStatusFilter(val); setPagination((p) => ({ ...p, page: 1 })); };

  // ── Row index ──────────────────────────────────────────────────────────────
  const rowIndex = (i) => (pagination.page - 1) * pagination.limit + i + 1;

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>Enquiries</h1>
          <p style={styles.pageSubtitle}>Manage and track all incoming enquiries</p>
        </div>
        <button style={styles.btnPrimary} onClick={() => setShowCreate(true)}>
          + New Enquiry
        </button>
      </div>

      {/* Stats */}
      <div style={styles.statsBar}>
        <StatCard label="Total" value={stats.total} color="#185FA5" />
        <StatCard label="New" value={stats.New} color="#185FA5" />
        <StatCard label="Contacted" value={stats.Contacted} color="#3B6D11" />
        <StatCard label="In Progress" value={stats["In Progress"]} color="#854F0B" />
        <StatCard label="Closed" value={stats.Closed} color="#5F5E5A" />
      </div>

      {/* Toolbar */}
      <div style={styles.toolbar}>
        <input
          style={styles.searchInput}
          type="text"
          placeholder="Search by name, company, email, country…"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
        />
        <select style={styles.filterSelect} value={statusFilter} onChange={(e) => handleStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select style={styles.filterSelect} value={pagination.limit} onChange={(e) => handleLimitChange(e.target.value)}>
          {LIMIT_OPTIONS.map((l) => <option key={l} value={l}>{l} / page</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={styles.card}>
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                {["#", "Name", "Email", "Company", "Role", "Country", "Type", "Status", "Date", "Actions"].map((h) => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} style={styles.emptyCell}>
                    <div style={styles.loadingState}>Loading enquiries…</div>
                  </td>
                </tr>
              ) : enquiries.length === 0 ? (
                <tr>
                  <td colSpan={10} style={styles.emptyCell}>
                    <div style={styles.emptyState}>
                      <div style={styles.emptyIcon}>📭</div>
                      <div>No enquiries found</div>
                    </div>
                  </td>
                </tr>
              ) : (
                enquiries.map((enq, i) => (
                  <tr key={enq._id} style={styles.tr}>
                    <td style={{ ...styles.td, color: "#888780", width: 40 }}>{rowIndex(i)}</td>
                    <td style={{ ...styles.td, fontWeight: 500 }}>{enq.fullName}</td>
                    <td style={{ ...styles.td, color: "#5F5E5A" }}>{enq.workEmail}</td>
                    <td style={styles.td}>{enq.company}</td>
                    <td style={styles.td}>{enq.role}</td>
                    <td style={styles.td}>{enq.country}</td>
                    <td style={styles.td}>{enq.enquiryType || "—"}</td>
                    <td style={styles.td}>
                      <select
                        style={styles.statusSelect}
                        value={enq.status}
                        onChange={(e) => handleStatusChange(enq._id, e.target.value)}
                      >
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td style={{ ...styles.td, whiteSpace: "nowrap", color: "#5F5E5A" }}>
                      {formatDate(enq.createdAt)}
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionBtns}>
                        <button style={styles.iconBtn} title="View details"
                          onClick={() => handleViewDetail(enq._id)}>
                          👁
                        </button>
                        <button style={{ ...styles.iconBtn, ...styles.iconBtnDanger }}
                          title="Delete" onClick={() => setDeleteTarget({ id: enq._id, name: enq.fullName })}>
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination pagination={pagination} onPage={goPage} />
      </div>

      {/* Modals */}
      {showCreate && (
        <CreateEnquiryModal
          onClose={() => setShowCreate(false)}
          onSuccess={(msg) => { showToast(msg); fetchEnquiries(); }}
        />
      )}
      {detailData && (
        <DetailModal enquiry={detailData} onClose={() => setDetailData(null)} />
      )}
      {deleteTarget && (
        <DeleteModal
          name={deleteTarget.name}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}

      {/* Toast */}
      <Toast message={toast.message} type={toast.type} visible={toast.visible} />
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {
  // Layout
  page: { marginTop: "1.5rem", padding: "1.5rem", fontFamily: "'Segoe UI', system-ui, sans-serif", color: "#2C2C2A", maxWidth: "100%" },
  pageHeader: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.25rem", flexWrap: "wrap", gap: 12 },
  pageTitle: { fontSize: 22, fontWeight: 600, margin: 0, lineHeight: 1.2 },
  pageSubtitle: { fontSize: 13, color: "#888780", marginTop: 4 },

  // Stats
  statsBar: { display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: "1.25rem" },
  statCard: { background: "#F1EFE8", borderRadius: 8, padding: "12px 14px", textAlign: "center" },
  statNum: { fontSize: 22, fontWeight: 600, lineHeight: 1 },
  statLabel: { fontSize: 11, color: "#888780", marginTop: 4 },

  // Toolbar
  toolbar: { display: "flex", gap: 10, flexWrap: "wrap", marginBottom: "0.875rem", alignItems: "center" },
  searchInput: {
    padding: "7px 12px", border: "0.5px solid #B4B2A9", borderRadius: 8,
    fontSize: 13, fontFamily: "inherit", background: "#fff", color: "#2C2C2A",
    width: 280, outline: "none",
  },
  filterSelect: {
    padding: "7px 10px", border: "0.5px solid #B4B2A9", borderRadius: 8,
    fontSize: 13, fontFamily: "inherit", background: "#fff", color: "#2C2C2A",
    cursor: "pointer", outline: "none",
  },

  // Card / Table
  card: { background: "#fff", border: "0.5px solid #D3D1C7", borderRadius: 12, overflow: "hidden" },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: {
    padding: "10px 12px", textAlign: "left", fontWeight: 500, color: "#5F5E5A",
    borderBottom: "0.5px solid #D3D1C7", background: "#F1EFE8", whiteSpace: "nowrap",
  },
  td: { padding: "10px 12px", borderBottom: "0.5px solid #EEECE6", verticalAlign: "middle" },
  tr: {},
  emptyCell: { padding: 0, border: "none" },
  emptyState: { padding: "3rem", textAlign: "center", color: "#888780" },
  emptyIcon: { fontSize: 28, marginBottom: 8 },
  loadingState: { padding: "3rem", textAlign: "center", color: "#888780" },

  // Status select inline
  statusSelect: {
    padding: "4px 8px", border: "0.5px solid #D3D1C7", borderRadius: 6,
    fontSize: 12, fontFamily: "inherit", background: "#fff", color: "#2C2C2A",
    cursor: "pointer", outline: "none",
  },

  // Action buttons
  actionBtns: { display: "flex", gap: 6 },
  iconBtn: {
    padding: "4px 8px", border: "0.5px solid #D3D1C7", borderRadius: 6,
    background: "transparent", cursor: "pointer", fontSize: 13, color: "#5F5E5A",
  },
  iconBtnDanger: { color: "#A32D2D", borderColor: "#F7C1C1" },

  // Badges
  badge: { display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 500 },
  badgeNew: { background: "#E6F1FB", color: "#0C447C" },
  badgeContacted: { background: "#EAF3DE", color: "#27500A" },
  badgeInProgress: { background: "#FAEEDA", color: "#633806" },
  badgeClosed: { background: "#F1EFE8", color: "#444441" },

  // Pagination
  pagination: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "12px 16px", borderTop: "0.5px solid #D3D1C7", flexWrap: "wrap", gap: 8,
  },
  paginationInfo: { fontSize: 13, color: "#888780" },
  pageButtons: { display: "flex", gap: 4 },
  pageBtn: {
    padding: "5px 10px", border: "0.5px solid #D3D1C7", borderRadius: 6,
    background: "transparent", cursor: "pointer", fontSize: 12, color: "#5F5E5A", fontFamily: "inherit",
  },
  pageBtnActive: { background: "#185FA5", color: "#fff", borderColor: "#185FA5" },

  // Buttons
  btnPrimary: {
    padding: "9px 18px", borderRadius: 8, border: "none",
    background: "#185FA5", color: "#fff", cursor: "pointer",
    fontSize: 13, fontFamily: "inherit", fontWeight: 500,
  },
  btnSecondary: {
    padding: "8px 16px", borderRadius: 8, border: "0.5px solid #B4B2A9",
    background: "transparent", color: "#2C2C2A", cursor: "pointer",
    fontSize: 13, fontFamily: "inherit",
  },
  btnDanger: {
    padding: "8px 16px", borderRadius: 8, border: "0.5px solid #F7C1C1",
    background: "transparent", color: "#A32D2D", cursor: "pointer",
    fontSize: 13, fontFamily: "inherit",
  },

  // Overlay / Modal
  overlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 1000, padding: "1rem",
  },
  modal: {
    background: "#fff", borderRadius: 12, border: "0.5px solid #D3D1C7",
    width: "100%", maxWidth: 580, maxHeight: "90vh", overflowY: "auto",
  },
  modalHeader: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "1rem 1.25rem", borderBottom: "0.5px solid #D3D1C7",
  },
  modalTitle: { fontSize: 16, fontWeight: 600 },
  modalBody: { padding: "1.25rem" },
  modalFooter: {
    padding: "1rem 1.25rem", borderTop: "0.5px solid #D3D1C7",
    display: "flex", justifyContent: "flex-end", gap: 8,
  },
  closeBtn: {
    background: "none", border: "none", fontSize: 16, cursor: "pointer",
    color: "#888780", padding: "2px 6px", borderRadius: 4, lineHeight: 1,
  },

  // Form
  formRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  formGroup: { marginBottom: "0.875rem" },
  fieldLabel: { display: "block", fontSize: 12, fontWeight: 500, color: "#5F5E5A", marginBottom: 5 },
  input: {
    width: "100%", padding: "8px 10px", border: "0.5px solid #B4B2A9", borderRadius: 8,
    fontSize: 13, fontFamily: "inherit", background: "#fff", color: "#2C2C2A",
    boxSizing: "border-box", outline: "none",
  },
  errorText: { fontSize: 11, color: "#A32D2D", marginTop: 3 },
  serverError: {
    background: "#FCEBEB", color: "#791F1F", border: "0.5px solid #F7C1C1",
    borderRadius: 8, padding: "10px 12px", fontSize: 13, marginBottom: "1rem",
  },
  consentRow: { display: "flex", alignItems: "flex-start", gap: 8, marginTop: 4 },
  consentLabel: { fontSize: 12, color: "#5F5E5A", lineHeight: 1.5 },

  // Detail modal
  detailMeta: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" },
  detailName: { fontSize: 16, fontWeight: 600 },
  detailEmail: { fontSize: 12, color: "#888780", marginTop: 3 },
  detailGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 },
  detailItem: { padding: "10px 0", borderBottom: "0.5px solid #EEECE6" },
  detailItemLabel: { fontSize: 11, color: "#888780", marginBottom: 3 },
  detailItemValue: { fontSize: 13, fontWeight: 500 },

  // Confirm modal
  confirmModal: {
    background: "#fff", borderRadius: 12, border: "0.5px solid #D3D1C7",
    width: "100%", maxWidth: 400, padding: "1.5rem",
  },
  confirmTitle: { fontSize: 16, fontWeight: 600, marginBottom: 8 },
  confirmMsg: { fontSize: 13, color: "#5F5E5A", marginBottom: "1.25rem", lineHeight: 1.6 },
  confirmActions: { display: "flex", justifyContent: "flex-end", gap: 8 },

  // Toast
  toast: {
    position: "fixed", bottom: "1.5rem", right: "1.5rem",
    padding: "11px 16px", borderRadius: 8, fontSize: 13,
    zIndex: 2000, display: "flex", alignItems: "center", gap: 8,
    transition: "opacity 0.25s, transform 0.25s",
  },
  toastSuccess: { background: "#EAF3DE", color: "#27500A", border: "0.5px solid #C0DD97" },
  toastError: { background: "#FCEBEB", color: "#791F1F", border: "0.5px solid #F7C1C1" },
  toastIcon: { fontWeight: 700, fontSize: 12 },
};