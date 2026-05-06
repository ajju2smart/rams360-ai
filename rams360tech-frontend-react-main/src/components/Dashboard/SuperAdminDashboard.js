import React, { useState, useEffect, useCallback } from "react";
import { useHistory } from "react-router-dom";
import Api from "../../Api";
import { useAuth } from "../../context/AuthContext";
import "../../css/SuperAdminDashboard.scss";

function fmt(d) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}
function fmtShort(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function StatCard({ icon, value, label, sub, color }) {
  return (
    <div className="sad__stat-card">
      <div className="sad__stat-icon" style={{ background: color + "18", color }}>
        {icon}
      </div>
      <div className="sad__stat-body">
        <div className="sad__stat-value">{value}</div>
        <div className="sad__stat-label">{label}</div>
        {sub && <div className="sad__stat-sub">{sub}</div>}
      </div>
    </div>
  );
}

function Badge({ text, type }) {
  return <span className={"sad__badge sad__badge--" + type}>{text}</span>;
}

function Pagination({ page, total, perPage, onChange }) {
  const pages = Math.ceil(total / perPage);
  if (pages <= 1) return null;
  return (
    <div className="sad__pagination">
      <button disabled={page === 1} onClick={() => onChange(page - 1)}>‹</button>
      {Array.from({ length: pages }, (_, i) => (
        <button
          key={i + 1}
          className={page === i + 1 ? "active" : ""}
          onClick={() => onChange(i + 1)}
        >{i + 1}</button>
      ))}
      <button disabled={page === pages} onClick={() => onChange(page + 1)}>›</button>
    </div>
  );
}

const SuperAdminDashboard = () => {
  const { user } = useAuth();
  const history = useHistory();

  const [companies, setCompanies] = useState([]);
  const [users, setUsers]         = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [enqStats, setEnqStats]   = useState({ total: 0, new: 0, contacted: 0, inProgress: 0, closed: 0 });
  const [loading, setLoading]     = useState(true);

  const [cPage, setCPage] = useState(1);
  const [uPage, setUPage] = useState(1);
  const [cSearch, setCSearch] = useState("");
  const [uSearch, setUSearch] = useState("");
  const [eSearch, setESearch] = useState("");
  const PER = 8;

  const userId = user?._id;

  const logout = useCallback(() => {
    localStorage.clear();
    history.push("/login");
    window.location.reload();
  }, [history]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [cRes, uRes, eRes] = await Promise.all([
        Api.get("/api/v1/company", { headers: { userId } }),
        Api.get("/api/v1/user/company/all", { headers: { userId } }),
        Api.get("/api/v1/enquiry", { params: { limit: 200, page: 1 } }),
      ]);
      const c = cRes?.data?.company || [];
      const u = uRes?.data?.companyUsersList || [];
      const e = eRes?.data?.data || [];

      setCompanies(Array.isArray(c) ? c : []);
      setUsers(Array.isArray(u) ? u : []);
      setEnquiries(Array.isArray(e) ? e : []);

      const eArr = Array.isArray(e) ? e : [];
      setEnqStats({
        total:      eArr.length,
        new:        eArr.filter(x => x.status === "New").length,
        contacted:  eArr.filter(x => x.status === "Contacted").length,
        inProgress: eArr.filter(x => x.status === "In Progress").length,
        closed:     eArr.filter(x => x.status === "Closed").length,
      });
    } catch (err) {
      if (err?.response?.status === 401) logout();
    } finally {
      setLoading(false);
    }
  }, [userId, logout]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filteredCompanies = companies.filter(c =>
    (c.companyName || c.name || "").toLowerCase().includes(cSearch.toLowerCase())
  );
  const filteredUsers = users.filter(u =>
    (u.name || "").toLowerCase().includes(uSearch.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(uSearch.toLowerCase())
  );
  const filteredEnquiries = enquiries.filter(e =>
    (e.fullName || e.name || "").toLowerCase().includes(eSearch.toLowerCase()) ||
    (e.workEmail || e.email || "").toLowerCase().includes(eSearch.toLowerCase()) ||
    (e.company || "").toLowerCase().includes(eSearch.toLowerCase())
  );

  const cSlice = filteredCompanies.slice((cPage - 1) * PER, cPage * PER);
  const uSlice = filteredUsers.slice((uPage - 1) * PER, uPage * PER);

  if (loading) {
    return (
      <div className="sad__loading">
        <div className="sad__spinner" />
        <p>Loading dashboard…</p>
      </div>
    );
  }

  return (
    <div className="sad">
      <div className="sad__header">
        <div>
          <h1 className="sad__welcome">Welcome back, Super Admin 👋</h1>
          
        </div>
      </div>

      <div className="sad__stats">
        <StatCard
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 21h18M9 8h1m-1 4h1m4-4h1m-1 4h1M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16"/></svg>}
          value={companies.length} label="Total Companies" sub="Active companies" color="#6366f1"
        />
        <StatCard
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>}
          value={users.length} label="Total Users" sub="Registered users" color="#0ea5e9"
        />
        <StatCard
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>}
          value={enqStats.total} label="Total Enquiries" sub="All time enquiries" color="#f59e0b"
        />
        <StatCard
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>}
          value="92%" label="System Health" sub="All systems operational" color="#10b981"
        />
      </div>

      <div className="sad__tables-row">
        {/* Companies */}
        <div className="sad__panel">
          <div className="sad__panel-header">
            <div>
              <h2 className="sad__panel-title">Companies</h2>
              <p className="sad__panel-desc">Manage and oversee all registered companies</p>
            </div>
            <button className="sad__btn-primary" onClick={() => history.push("/company")}>Create / Modify Company</button>
          </div>
          <div className="sad__toolbar">
            <div className="sad__search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" placeholder="Search companies..." value={cSearch} onChange={e => { setCSearch(e.target.value); setCPage(1); }} />
            </div>
          </div>
          <div className="sad__table-wrap">
            <table className="sad__table">
              <thead><tr><th>S.No</th><th>Company Name</th><th>Status</th></tr></thead>
              <tbody>
                {cSlice.length === 0 ? (
                  <tr><td colSpan={3} className="sad__empty">No companies found</td></tr>
                ) : cSlice.map((c, i) => (
                  <tr key={c._id || i}>
                    <td>{(cPage - 1) * PER + i + 1}</td>
                    <td className="sad__company-name">{c.companyName || c.name || "—"}</td>
                    <td><Badge text="Active" type="active" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="sad__table-footer">
            <span>Showing {Math.min((cPage - 1) * PER + 1, filteredCompanies.length || 1)}–{Math.min(cPage * PER, filteredCompanies.length)} of {filteredCompanies.length} results</span>
            <Pagination page={cPage} total={filteredCompanies.length} perPage={PER} onChange={setCPage} />
          </div>
        </div>

        {/* Users */}
        <div className="sad__panel">
          <div className="sad__panel-header">
            <div>
              <h2 className="sad__panel-title">Users</h2>
              <p className="sad__panel-desc">Manage system users and their access</p>
            </div>
            <button className="sad__btn-primary" onClick={() => history.push("/company/admin")}>Add / Modify User</button>
          </div>
          <div className="sad__toolbar">
            <div className="sad__search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" placeholder="Search users..." value={uSearch} onChange={e => { setUSearch(e.target.value); setUPage(1); }} />
            </div>
          </div>
          <div className="sad__table-wrap">
            <table className="sad__table">
              <thead><tr><th>S.No</th><th>User Name</th><th>Email Address</th><th>Role</th><th>Company</th></tr></thead>
              <tbody>
                {uSlice.length === 0 ? (
                  <tr><td colSpan={5} className="sad__empty">No users found</td></tr>
                ) : uSlice.map((u, i) => (
                  <tr key={u._id || i}>
                    <td>{(uPage - 1) * PER + i + 1}</td>
                    <td className="sad__user-name">{u.name || "—"}</td>
                    <td className="sad__email">{u.email || "—"}</td>
                    <td>{u.role || <span className="sad__muted">—</span>}</td>
                    <td>{u.companyName || <span className="sad__muted">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="sad__table-footer">
            <span>Showing {Math.min((uPage - 1) * PER + 1, filteredUsers.length || 1)}–{Math.min(uPage * PER, filteredUsers.length)} of {filteredUsers.length} results</span>
            <Pagination page={uPage} total={filteredUsers.length} perPage={PER} onChange={setUPage} />
          </div>
        </div>
      </div>

      {/* Enquiries */}
      <div className="sad__panel sad__panel--full">
        <div className="sad__panel-header">
          <div>
            <h2 className="sad__panel-title">Enquiries</h2>
            <p className="sad__panel-desc">Manage and track all incoming enquiries</p>
          </div>
          <button className="sad__btn-primary" onClick={() => history.push("/company/enquiries")}>+ New Enquiry</button>
        </div>

        <div className="sad__enq-stats">
          {[
            { icon: "📋", val: enqStats.total,      label: "Total",       type: "total" },
            { icon: "🆕", val: enqStats.new,         label: "New",         type: "new" },
            { icon: "📞", val: enqStats.contacted,   label: "Contacted",   type: "contacted" },
            { icon: "⚙️", val: enqStats.inProgress,  label: "In Progress", type: "inprogress" },
            { icon: "✅", val: enqStats.closed,       label: "Closed",      type: "closed" },
          ].map(s => (
            <div key={s.type} className={"sad__enq-mini sad__enq-mini--" + s.type}>
              <span className="sad__enq-mini-icon">{s.icon}</span>
              <span className="sad__enq-mini-val">{s.val}</span>
              <span className="sad__enq-mini-label">{s.label}</span>
            </div>
          ))}
        </div>

        <div className="sad__toolbar">
          <div className="sad__search sad__search--wide">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="Search by name, company, email..." value={eSearch} onChange={e => setESearch(e.target.value)} />
          </div>
        </div>

        <div className="sad__table-wrap">
          <table className="sad__table">
            <thead>
              <tr><th>#</th><th>Name</th><th>Email</th><th>Company</th><th>Role</th><th>Country</th><th>Type</th><th>Status</th><th>Date</th></tr>
            </thead>
            <tbody>
              {filteredEnquiries.length === 0 ? (
                <tr><td colSpan={9} className="sad__empty">No enquiries found</td></tr>
              ) : filteredEnquiries.slice(0, 10).map((e, i) => (
                <tr key={e._id || i}>
                  <td>{i + 1}</td>
                  <td className="sad__user-name">{e.fullName || e.name || "—"}</td>
                  <td className="sad__email">{e.workEmail || e.email || "—"}</td>
                  <td>{e.company || "—"}</td>
                  <td>{e.role || "—"}</td>
                  <td>{e.country || "—"}</td>
                  <td><Badge text={e.enquiryType || e.type || "—"} type="type" /></td>
                  <td>
                    <Badge
                      text={e.status || "New"}
                      type={e.status === "New" ? "new" : e.status === "Contacted" ? "contacted" : e.status === "In Progress" ? "inprogress" : e.status === "Closed" ? "closed" : "new"}
                    />
                  </td>
                  <td>{fmtShort(e.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="sad__table-footer">
          <span>Showing 1–{Math.min(10, filteredEnquiries.length)} of {filteredEnquiries.length} results</span>
          <button className="sad__btn-link" onClick={() => history.push("/company/enquiries")}>View all →</button>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
