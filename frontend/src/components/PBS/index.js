import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  memo,
  useReducer,
} from "react";
import { Button, Card, Col, Dropdown, Form, Modal, Row } from "react-bootstrap";
import Label from "../LabelComponent";
import { ErrorMessage, Formik } from "formik";
import Select from "react-select";
import Environment from "../core/Environment";
import Api from "../../Api";
import * as Yup from "yup";
import { Electronic, Mechanical } from "../core/partTypeCategory";
import * as XLSX from "xlsx";
import { useHistory } from "react-router-dom";
import Loader from "../core/Loader";
import Projectname from "../Company/projectname";
import {
  FaEllipsisV,
  FaExclamationCircle,
  FaCheckCircle,
  FaChevronRight,
  FaChevronDown,
} from "react-icons/fa";
import { customStyles } from "../core/select";
import Tooltip from "@mui/material/Tooltip";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileDownload,
  faFileUpload,
  faSitemap,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../context/AuthContext";

/* ─────────────────────────────────────────────
   Inline Styles (replaces PBS.scss)
───────────────────────────────────────────── */
const injectStyles = () => {
  const id = "pbs-styles-v2";
  if (document.getElementById(id)) return;
  const style = document.createElement("style");
  style.id = id;
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

    :root {
      --pbs-teal:        #0d9488;
      --pbs-teal-dark:   #0f766e;
      --pbs-teal-light:  #f0fdfa;
      --pbs-teal-mid:    #ccfbf1;
      --pbs-teal-border: #99f6e4;
      --pbs-slate:       #0f172a;
      --pbs-slate-2:     #1e293b;
      --pbs-slate-3:     #334155;
      --pbs-muted:       #64748b;
      --pbs-border:      #e2e8f0;
      --pbs-bg:          #f8fafc;
      --pbs-white:       #ffffff;
      --pbs-red:         #ef4444;
      --pbs-red-bg:      #fef2f2;
      --pbs-shadow-sm:   0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
      --pbs-shadow:      0 4px 16px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04);
      --pbs-shadow-lg:   0 12px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06);
      --pbs-radius-sm:   6px;
      --pbs-radius:      10px;
      --pbs-radius-lg:   14px;
      --pbs-font:        'Plus Jakarta Sans', sans-serif;
      --pbs-mono:        'JetBrains Mono', monospace;
    }

    /* ── Base ── */
    .pbs-main {
      margin-top: 50px;
      min-height: 100vh;
      font-family: var(--pbs-font);
      background: var(--pbs-bg);
      overflow-x: visible;
    }

    /* ── Sticky Header ── */
    .pbs-sticky-header {
      position: sticky;
      top: 0;
      z-index: 20;
      background: rgba(248,250,252,0.92);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      padding-block: 6px;
      border-bottom: 1px solid var(--pbs-border);
      margin-bottom: 16px;
    }

    /* ── Stats Bar ── */
    .pbs-stats-bar {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      align-items: center;
      margin-bottom: 14px;
      padding: 0;
    }

    .pbs-stat-chip {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 5px 12px;
      background: var(--pbs-white);
      border: 1px solid var(--pbs-border);
      border-radius: 999px;
      font-size: 12px;
      font-weight: 500;
      color: var(--pbs-muted);
      font-family: var(--pbs-font);
      box-shadow: var(--pbs-shadow-sm);
    }

    .pbs-stat-chip strong {
      color: var(--pbs-teal);
      font-weight: 700;
    }

    .pbs-stat-chip.filter-chip {
      background: var(--pbs-teal-light);
      border-color: var(--pbs-teal-border);
      color: var(--pbs-teal-dark);
    }

    .pbs-stat-chip.filter-chip .chip-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: var(--pbs-teal);
      animation: pbs-pulse 1.5s infinite;
    }

    @keyframes pbs-pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(1.3); }
    }

    /* ── Toolbar ── */
    .pbs-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
      margin-bottom: 16px;
      flex-wrap: nowrap;
      position: relative;
      z-index: 30;
      width: 100%;
      box-sizing: border-box;
      overflow: visible;
    }

    .pbs-toolbar-left {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .pbs-toolbar-divider {
      width: 1px;
      height: 24px;
      background: var(--pbs-border);
      flex-shrink: 0;
    }

    /* Search */
    .pbs-search-wrap {
      position: relative;
      display: flex;
      align-items: center;
    }

    .pbs-search-icon {
      position: absolute;
      left: 10px;
      color: var(--pbs-muted);
      font-size: 13px;
      pointer-events: none;
      z-index: 1;
    }

    .pbs-search-input {
      width: 260px !important;
      height: 36px !important;
      padding-left: 32px !important;
      border-radius: var(--pbs-radius-sm) !important;
      border: 1.5px solid var(--pbs-border) !important;
      background: var(--pbs-white) !important;
      font-family: var(--pbs-font) !important;
      font-size: 13px !important;
      color: var(--pbs-slate) !important;
      transition: border-color 0.15s, box-shadow 0.15s;
      box-shadow: var(--pbs-shadow-sm);
    }

    .pbs-search-input:focus {
      border-color: var(--pbs-teal) !important;
      box-shadow: 0 0 0 3px rgba(13,148,136,0.12) !important;
      outline: none !important;
    }

    /* Buttons */
    .pbs-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      height: 36px;
      padding: 0 14px;
      border-radius: var(--pbs-radius-sm);
      border: 1.5px solid var(--pbs-border);
      background: var(--pbs-white);
      color: var(--pbs-slate-3);
      font-family: var(--pbs-font);
      font-size: 12.5px;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.15s;
      box-shadow: var(--pbs-shadow-sm);
      flex-shrink: 0;
    }

    .pbs-btn:hover:not(:disabled) {
      border-color: var(--pbs-teal);
      color: var(--pbs-teal);
      background: var(--pbs-teal-light);
    }

    .pbs-btn:disabled, .pbs-btn.disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    .pbs-btn-primary {
      background: var(--pbs-teal) !important;
      border-color: var(--pbs-teal) !important;
      color: var(--pbs-white) !important;
      box-shadow: 0 2px 8px rgba(13,148,136,0.25);
    }

    .pbs-btn-primary:hover:not(:disabled) {
      background: var(--pbs-teal-dark) !important;
      border-color: var(--pbs-teal-dark) !important;
      color: var(--pbs-white) !important;
      box-shadow: 0 4px 16px rgba(13,148,136,0.35);
      transform: translateY(-1px);
    }

    .pbs-btn-primary:active:not(:disabled) {
      transform: translateY(0);
    }

    /* ── Table Container ── */
    .pbs-table-wrap {
      background: var(--pbs-white);
      border-radius: var(--pbs-radius-lg);
      border: 1px solid var(--pbs-border);
      box-shadow: var(--pbs-shadow);
      overflow: visible;
      margin-bottom: 32px;
    }

    /* Table Header Bar */
    .pbs-table-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 20px;
      border-bottom: 1px solid var(--pbs-border);
      background: linear-gradient(135deg, #f0fdfa 0%, #f8fafc 100%);
      border-radius: var(--pbs-radius-lg) var(--pbs-radius-lg) 0 0;
    }

    .pbs-table-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 700;
      font-size: 13.5px;
      color: var(--pbs-slate-2);
      font-family: var(--pbs-font);
    }

    .pbs-table-badge {
      display: inline-flex;
      align-items: center;
      padding: 2px 9px;
      background: var(--pbs-teal-light);
      border: 1px solid var(--pbs-teal-border);
      border-radius: 999px;
      font-size: 11px;
      font-weight: 700;
      color: var(--pbs-teal-dark);
      font-family: var(--pbs-mono);
    }

    /* ── Virtual Table ── */
    .vt-wrapper {
      display: flex;
      flex-direction: column;
      width: 100%;
    }

    .vt-scroll-outer {
      overflow-x: auto;
      overflow-y: auto;
      height: calc(100vh - 380px);
      min-height: 300px;
      max-height: calc(100vh - 280px);
      scrollbar-width: thin;
      scrollbar-color: #cbd5e1 transparent;
      -webkit-overflow-scrolling: touch;
    }

    .vt-scroll-outer::-webkit-scrollbar { width: 6px; height: 6px; }
    .vt-scroll-outer::-webkit-scrollbar-track { background: transparent; }
    .vt-scroll-outer::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }

    .vt-table {
      table-layout: auto;
      width: 100%;
      min-width: 100%;
      border-collapse: collapse;
      font-family: var(--pbs-font);
      font-size: 13px;
    }

    /* Thead */
    .vt-thead {
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .vt-th {
      background: #f8fafc;
      border-bottom: 1px solid var(--pbs-border);
      border-right: 1px solid #f1f5f9;
      padding: 11px 16px;
      font-size: 10.5px;
      font-weight: 700;
      color: var(--pbs-muted);
      text-transform: uppercase;
      letter-spacing: 0.07em;
      white-space: nowrap;
      text-align: left;
      user-select: none;
    }

    .vt-th:last-child { border-right: none; }

    .vt-th-actions {
      text-align: center;
      width: 52px;
      min-width: 52px;
    }

    /* Rows */
    .vt-row {
      border-bottom: 1px solid #f1f5f9;
      cursor: pointer;
      transition: background 0.1s;
    }

    .vt-row:hover { background: #f8fffe; }

    .vt-row.vt-row-selected {
      background: #f0fdfa !important;
    }

    .vt-row.vt-row-selected td:first-child {
      border-left: 3px solid var(--pbs-teal);
    }

    /* Cells */
    .vt-td {
      padding: 0 16px;
      height: 44px;
      vertical-align: middle;
      border-right: 1px solid #f1f5f9;
      color: var(--pbs-slate-2);
      max-width: 280px;
    }

    .vt-td:last-child { border-right: none; }

    .vt-td-inner {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 100%;
      display: flex;
      align-items: center;
    }

    .vt-td-actions {
      text-align: center;
      width: 52px;
      min-width: 52px;
      padding: 0 6px;
      overflow: visible !important;
      position: relative;
    }

    /* Action dropdown menu */
    .vt-td-actions .dropdown-menu {
      z-index: 9999 !important;
      position: fixed !important;
      box-shadow: var(--pbs-shadow-lg) !important;
      border: 1px solid var(--pbs-border) !important;
      border-radius: var(--pbs-radius) !important;
      font-size: 12.5px;
      font-family: var(--pbs-font);
      min-width: 178px;
      padding: 5px;
    }

    .vt-td-actions .dropdown-item {
      border-radius: var(--pbs-radius-sm);
      padding: 8px 12px;
      font-size: 12.5px;
      color: var(--pbs-slate-2);
      font-weight: 500;
      transition: background 0.1s, color 0.1s;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .vt-td-actions .dropdown-item:hover {
      background: var(--pbs-teal-light);
      color: var(--pbs-teal);
    }

    .vt-td-actions .dropdown-item.text-danger { color: var(--pbs-red) !important; }
    .vt-td-actions .dropdown-item.text-danger:hover { background: var(--pbs-red-bg) !important; }
    .vt-td-actions .dropdown-item:disabled, .vt-td-actions .dropdown-item.disabled { opacity: 0.35; cursor: not-allowed; }
    .vt-td-actions .dropdown-divider { margin: 4px 6px; border-color: var(--pbs-border); }

    /* Category Badges */
    .cat-badge {
      display: inline-flex;
      align-items: center;
      padding: 2px 8px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.02em;
    }

    .cat-badge-assembly { background: #eff6ff; color: #2563eb; }
    .cat-badge-electronic { background: #fdf4ff; color: #9333ea; }
    .cat-badge-mechanical { background: #fff7ed; color: #ea580c; }
    .cat-badge-default { background: var(--pbs-bg); color: var(--pbs-muted); }

    /* Numeric values */
    .vt-num {
      font-family: var(--pbs-mono);
      font-size: 11.5px;
      color: var(--pbs-slate-3);
      letter-spacing: -0.3px;
    }

    .vt-dash { color: #cbd5e1; font-size: 12px; }
    .vt-index {
      font-weight: 700;
      font-size: 11.5px;
      color: var(--pbs-teal);
      font-family: var(--pbs-mono);
      white-space: nowrap;
    }

    /* Expand button */
    .vt-expand-btn {
      border: 1px solid #e2e8f0;
      background: var(--pbs-white);
      border-radius: 4px;
      width: 18px;
      height: 18px;
      min-width: 18px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      margin-right: 6px;
      flex-shrink: 0;
      color: var(--pbs-muted);
      padding: 0;
      transition: all 0.12s;
    }

    .vt-expand-btn:hover {
      background: var(--pbs-teal-light);
      border-color: var(--pbs-teal);
      color: var(--pbs-teal);
    }

    .vt-sitemap-icon {
      opacity: 0.3;
      margin-right: 6px;
      flex-shrink: 0;
      color: var(--pbs-teal);
      font-size: 11px;
    }

    /* Action toggle */
    .vt-action-toggle {
      width: 30px;
      height: 30px;
      border-radius: var(--pbs-radius-sm);
      border: 1px solid transparent;
      background: transparent;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--pbs-muted);
      font-size: 12px;
      padding: 0;
      margin: 0 auto;
      transition: all 0.12s;
    }

    .vt-action-toggle:hover {
      background: var(--pbs-teal-light);
      border-color: var(--pbs-teal-border);
      color: var(--pbs-teal);
    }

    .vt-action-toggle::after { display: none !important; }

    /* Empty state */
    .vt-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 220px;
      color: #94a3b8;
      font-size: 13.5px;
      gap: 12px;
    }

    .vt-empty-icon {
      width: 56px; height: 56px;
      background: #f1f5f9;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      color: #cbd5e1;
    }

    /* ── Pagination ── */
    .vt-pagination {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 12px;
      padding: 10px 16px;
      border-top: 1px solid var(--pbs-border);
      background: var(--pbs-bg);
      font-size: 12.5px;
      flex-wrap: wrap;
      border-radius: 0 0 var(--pbs-radius-lg) var(--pbs-radius-lg);
      font-family: var(--pbs-font);
    }

    .vt-page-info { color: var(--pbs-muted); margin-right: auto; font-size: 12px; }

    .vt-page-size-select {
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--pbs-muted);
    }

    .vt-page-size-select select {
      border: 1px solid var(--pbs-border);
      border-radius: 6px;
      padding: 3px 8px;
      font-size: 12px;
      font-family: var(--pbs-font);
      cursor: pointer;
      background: var(--pbs-white);
      color: var(--pbs-slate-2);
    }

    .vt-page-size-select select:focus { outline: none; border-color: var(--pbs-teal); }

    .vt-page-btns {
      display: flex;
      align-items: center;
      gap: 2px;
    }

    .vt-page-btns button {
      border: 1px solid var(--pbs-border);
      background: var(--pbs-white);
      border-radius: 6px;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 13px;
      color: var(--pbs-muted);
      padding: 0;
      transition: all 0.1s;
    }

    .vt-page-btns button:hover:not(:disabled) {
      background: var(--pbs-teal-light);
      border-color: var(--pbs-teal-border);
      color: var(--pbs-teal);
    }

    .vt-page-btns button:disabled { opacity: 0.3; cursor: not-allowed; }

    .vt-page-num {
      padding-inline: 12px;
      font-size: 12px;
      color: var(--pbs-slate-2);
      font-weight: 600;
      min-width: 60px;
      text-align: center;
      background: var(--pbs-white);
      border: 1px solid var(--pbs-border);
      border-radius: 6px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--pbs-mono);
    }

    /* ── Modals ── */
    .pbs-modal .modal-content {
      border: none !important;
      border-radius: var(--pbs-radius-lg) !important;
      box-shadow: var(--pbs-shadow-lg) !important;
      font-family: var(--pbs-font) !important;
    }

    .pbs-modal .modal-header {
      border-bottom: 1px solid var(--pbs-border) !important;
      padding: 18px 24px 14px !important;
      background: linear-gradient(135deg, #f0fdfa 0%, #f8fafc 100%) !important;
      border-radius: var(--pbs-radius-lg) var(--pbs-radius-lg) 0 0 !important;
    }

    .pbs-modal .modal-title {
      font-size: 15px !important;
      font-weight: 700 !important;
      color: var(--pbs-slate-2) !important;
    }

    .pbs-modal .modal-body {
      padding: 20px 24px !important;
    }

    .pbs-modal .modal-footer {
      border-top: 1px solid var(--pbs-border) !important;
      padding: 14px 24px !important;
      background: var(--pbs-bg) !important;
      border-radius: 0 0 var(--pbs-radius-lg) var(--pbs-radius-lg) !important;
      gap: 8px !important;
    }

    .pbs-section-label {
      font-size: 10.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--pbs-muted);
      margin-bottom: 10px;
      font-family: var(--pbs-font);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .pbs-section-label::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--pbs-border);
    }

    .pbs-modal-card {
      border-radius: var(--pbs-radius) !important;
      border: 1px solid var(--pbs-border) !important;
      background: var(--pbs-bg) !important;
      padding: 16px !important;
    }

    /* Form controls in modal */
    .pbs-modal .form-control {
      border: 1.5px solid var(--pbs-border) !important;
      border-radius: var(--pbs-radius-sm) !important;
      font-family: var(--pbs-font) !important;
      font-size: 13px !important;
      color: var(--pbs-slate-2) !important;
      background: var(--pbs-white) !important;
      transition: border-color 0.15s, box-shadow 0.15s;
      padding: 8px 12px !important;
    }

    .pbs-modal .form-control:focus {
      border-color: var(--pbs-teal) !important;
      box-shadow: 0 0 0 3px rgba(13,148,136,0.12) !important;
    }

    .save-btn {
      background: var(--pbs-teal) !important;
      border-color: var(--pbs-teal) !important;
      color: var(--pbs-white) !important;
      font-weight: 600 !important;
      font-family: var(--pbs-font) !important;
      border-radius: var(--pbs-radius-sm) !important;
      transition: all 0.15s !important;
      padding: 8px 20px !important;
    }

    .save-btn:hover:not(:disabled) {
      background: var(--pbs-teal-dark) !important;
      border-color: var(--pbs-teal-dark) !important;
      box-shadow: 0 4px 12px rgba(13,148,136,0.3) !important;
    }

    /* Status modals */
    .pbs-status-modal .modal-content {
      border: none !important;
      border-radius: var(--pbs-radius-lg) !important;
      box-shadow: var(--pbs-shadow-lg) !important;
    }

    .pbs-icon-circle {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 12px;
    }

    .pbs-icon-circle-success { background: #f0fdfa; }
    .pbs-icon-circle-danger { background: #fef2f2; }

    /* MUI Tooltip */
    .MuiTooltip-popper { z-index: 1060 !important; }
    .modal { z-index: 1055 !important; }
    .modal-backdrop { z-index: 1050 !important; }

    /* Access Denied */
    .pbs-denied-card {
      max-width: 420px;
      margin: 80px auto 0;
      text-align: center;
      padding: 48px 32px;
      background: var(--pbs-white);
      border-radius: var(--pbs-radius-lg);
      border: 1px solid var(--pbs-border);
      box-shadow: var(--pbs-shadow);
    }

    /* Responsive */
    @media (max-width: 768px) {
      .pbs-main { margin-top: 70px; padding-inline: 12px !important; }
      .pbs-search-input { width: 100% !important; }
      .pbs-toolbar { flex-direction: column; align-items: stretch; }
    }

    @media (max-width: 600px) {
      .vt-scroll-outer { height: calc(100vh - 320px); min-height: 260px; }
      .vt-page-info { display: none; }
    }
  `;
  document.head.appendChild(style);
};

/* ─────────────────────────────────────────────
   Constants
───────────────────────────────────────────── */
const CATEGORY_OPTIONS = Object.freeze([
  { value: "Assembly", label: "Assembly" },
  { value: "Electronic", label: "Electronic" },
  { value: "Mechanical", label: "Mechanical" },
]);

const EXCEL_VALID_EXT = new Set(["xlsx", "xls"]);

const COLUMNS_TO_REMOVE = Object.freeze([
  "type", "productId", "id", "reference", "children", "tableData",
  "parentId", "status", "temperature", "environment", "quantity",
]);

const DEFAULT_CATEGORY = Object.freeze({ value: "Assembly", label: "Assembly" });
const ROW_HEIGHT = 44;
const OVERSCAN = 8;
const MAX_TREE_DEPTH = 50;
const DEBOUNCE_DELAY = 250;

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
const isAbortError = (e) => e?.name === "AbortError" || e?.code === "ERR_CANCELED";

function useDebounced(value, ms = DEBOUNCE_DELAY) {
  const [v, set] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => set(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

function indexSortKey(v) {
  if (!v) return "000000";
  return String(v).split(".").map(x => {
    const n = parseInt(x, 10);
    return Number.isFinite(n) ? String(n).padStart(6, "0") : "999999";
  }).join(".");
}

function getCategoryBadge(cat) {
  if (!cat) return null;
  const map = {
    Assembly: "cat-badge cat-badge-assembly",
    Electronic: "cat-badge cat-badge-electronic",
    Mechanical: "cat-badge cat-badge-mechanical",
  };
  return <span className={map[cat] || "cat-badge cat-badge-default"}>{cat}</span>;
}

/* ─────────────────────────────────────────────
   Reducer
───────────────────────────────────────────── */
const uiReducer = (state, { type, payload }) => {
  switch (type) {
    case "LOADING": return { ...state, isLoading: payload };
    case "MODAL": return { ...state, ...payload };
    case "RESET_MODAL": return {
      ...state,
      mainProductModalOpen: false,
      patchModal: false,
      subProduct: false,
      childProductCriteria: false,
    };
    case "UPDATE": return { ...state, ...payload };
    default: return state;
  }
};

const UI0 = {
  isLoading: true,
  permissionsChecked: null,
  showStatusModal: false,
  deleteConfirmOpen: false,
  deleteSuccess: false,
  errorCode: 0,
  productMessage: "",
  mainProductModalOpen: false,
  patchModal: false,
  subProduct: false,
  subProductError: false,
  childProductCriteria: false,
  search: "",
};

/* ─────────────────────────────────────────────
   Virtual Table
───────────────────────────────────────────── */
const VirtualTable = memo(function VirtualTable({ rows, columns, actions, onRowClick, selectedRowId }) {
  const outerRef = useRef(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [scroll, setScroll] = useState(0);
  const [height, setHeight] = useState(520);
  const [pageSize, setPageSize] = useState(50);
  const [page, setPage] = useState(0);

  const handleDropdownToggle = useCallback((rowId) => {
    setOpenDropdownId(prev => (prev === rowId ? null : rowId));
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!outerRef.current?.contains(e.target)) setOpenDropdownId(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const update = () => setHeight(Math.max(200, el.getBoundingClientRect().height - ROW_HEIGHT));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => { ro.disconnect(); window.removeEventListener("resize", update); };
  }, []);

  useEffect(() => { setPage(0); }, [rows.length]);

  const paged = useMemo(() => {
    const start = page * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, page, pageSize]);

  const visibleCount = Math.ceil(height / ROW_HEIGHT) + OVERSCAN * 2;
  const startIdx = Math.max(0, Math.floor(scroll / ROW_HEIGHT) - OVERSCAN);
  const endIdx = Math.min(paged.length, startIdx + visibleCount);
  const paddingTop = startIdx * ROW_HEIGHT;
  const paddingBot = Math.max(0, (paged.length - endIdx) * ROW_HEIGHT);
  const visibleRows = paged.slice(startIdx, endIdx);
  const totalPages = Math.ceil(rows.length / pageSize);

  return (
    <div className="vt-wrapper">
      <div
        ref={outerRef}
        className="vt-scroll-outer"
        onScroll={e => { setScroll(e.currentTarget.scrollTop); setOpenDropdownId(null); }}
      >
        <table className="vt-table">
          <colgroup>
            {columns.map(c => <col key={c.field} />)}
            <col className="vt-th-actions" />
          </colgroup>
          <thead className="vt-thead">
            <tr>
              {columns.map(c => <th key={c.field} className="vt-th">{c.title}</th>)}
              <th className="vt-th vt-th-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paddingTop > 0 && (
              <tr aria-hidden style={{ height: paddingTop }}>
                <td colSpan={columns.length + 1} />
              </tr>
            )}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1}>
                  <div className="vt-empty">
                    <div className="vt-empty-icon">
                      <FontAwesomeIcon icon={faSitemap} />
                    </div>
                    <span>No records found</span>
                  </div>
                </td>
              </tr>
            ) : (
              visibleRows.map(row => (
                <VirtualRow
                  key={row.id}
                  row={row}
                  columns={columns}
                  actions={actions}
                  onRowClick={onRowClick}
                  isSelected={row.id === selectedRowId}
                  isDropdownOpen={openDropdownId === row.id}
                  onDropdownToggle={handleDropdownToggle}
                />
              ))
            )}
            {paddingBot > 0 && (
              <tr aria-hidden style={{ height: paddingBot }}>
                <td colSpan={columns.length + 1} />
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="vt-pagination">
        <span className="vt-page-info">
          {rows.length === 0
            ? "0 rows"
            : `${page * pageSize + 1}–${Math.min((page + 1) * pageSize, rows.length)} of ${rows.length} rows`}
        </span>
        <div className="vt-page-size-select">
          <label style={{ fontSize: 12, color: "var(--pbs-muted)" }}>Rows per page</label>
          <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(0); }}>
            {[20, 50, 100, 200].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div className="vt-page-btns">
          <button disabled={page === 0} onClick={() => setPage(0)} title="First">«</button>
          <button disabled={page === 0} onClick={() => setPage(p => p - 1)} title="Prev">‹</button>
          <span className="vt-page-num">{page + 1} / {Math.max(1, totalPages)}</span>
          <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} title="Next">›</button>
          <button disabled={page >= totalPages - 1} onClick={() => setPage(totalPages - 1)} title="Last">»</button>
        </div>
      </div>
    </div>
  );
});

const VirtualRow = memo(function VirtualRow({
  row, columns, actions, onRowClick, isSelected,
  isDropdownOpen, onDropdownToggle,
}) {
  return (
    <tr
      className={`vt-row${isSelected ? " vt-row-selected" : ""}`}
      onClick={() => onRowClick?.(row)}
    >
      {columns.map(c => (
        <td key={c.field} className="vt-td" title={c.render ? undefined : String(row[c.field] ?? "")}>
          <div className="vt-td-inner">
            {c.render ? c.render(row) : (row[c.field] != null && row[c.field] !== "" && row[c.field] !== "-"
              ? row[c.field]
              : <span className="vt-dash">—</span>)}
          </div>
        </td>
      ))}
      <td className="vt-td vt-td-actions" onClick={e => e.stopPropagation()}>
        {actions.map((action, i) => {
          const config = typeof action === "function" ? action(row) : action;
          return (
            <React.Fragment key={i}>
              {config.icon ? config.icon(row, isDropdownOpen, onDropdownToggle) : null}
            </React.Fragment>
          );
        })}
      </td>
    </tr>
  );
}, (prev, next) => (
  prev.row === next.row &&
  prev.actions === next.actions &&
  prev.columns === next.columns &&
  prev.isSelected === next.isSelected &&
  prev.isDropdownOpen === next.isDropdownOpen &&
  prev.onDropdownToggle === next.onDropdownToggle
));

/* ─────────────────────────────────────────────
   Toolbar
───────────────────────────────────────────── */
const Toolbar = memo(function Toolbar({
  hasWriteAccess, canExport,
  onImportExcel, onExportExcel,
  searchValue, onSearchChange, onCreateRoot,
}) {
  return (
    <div className="pbs-toolbar">
      <div className="pbs-toolbar-left">
        <Tooltip placement="bottom" title="Import Excel" PopperProps={{ style: { zIndex: 9999 } }}>
          <label
            htmlFor="file-input"
            className={`pbs-btn${!hasWriteAccess ? " disabled" : ""}`}
            style={{ cursor: hasWriteAccess ? "pointer" : "not-allowed" }}
          >
            <FontAwesomeIcon icon={faFileDownload} style={{ fontSize: 12 }} />
            <span>Import</span>
            <input
              type="file"
              id="file-input"
              onChange={onImportExcel}
              disabled={!hasWriteAccess}
              style={{ display: "none" }}
              accept=".xlsx,.xls"
            />
          </label>
        </Tooltip>

        <Tooltip placement="bottom" title="Export Excel" PopperProps={{ style: { zIndex: 9999 } }}>
          <span>
            <button
              className="pbs-btn"
              onClick={onExportExcel}
              disabled={!canExport || !hasWriteAccess}
              type="button"
            >
              <FontAwesomeIcon icon={faFileUpload} style={{ fontSize: 12 }} />
              <span>Export</span>
            </button>
          </span>
        </Tooltip>

        <div className="pbs-toolbar-divider" />

        <div className="pbs-search-wrap">
          <svg className="pbs-search-icon" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <Form.Control
            placeholder="Search name, part no, category…"
            value={searchValue}
            onChange={onSearchChange}
            className="pbs-search-input"
          />
        </div>
      </div>

      <Tooltip placement="left" title="Create Root Product" PopperProps={{ style: { zIndex: 9999 } }}>
        <span>
          <Button
            className="pbs-btn pbs-btn-primary"
            onClick={onCreateRoot}
            disabled={!hasWriteAccess}
          >
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span>New Product</span>
          </Button>
        </span>
      </Tooltip>
    </div>
  );
});

/* ─────────────────────────────────────────────
   Modals
───────────────────────────────────────────── */
const StatusModal = memo(function StatusModal({ show, errorCode, message, onHide }) {
  return (
    <Modal show={show} centered onHide={onHide} size="sm" dialogClassName="pbs-status-modal">
      <Modal.Body className="text-center py-5">
        <div className={`pbs-icon-circle ${errorCode === 400 ? "pbs-icon-circle-danger" : "pbs-icon-circle-success"}`}>
          {errorCode === 400
            ? <FaExclamationCircle size={28} color="#ef4444" />
            : <FaCheckCircle size={28} color="var(--pbs-teal)" />}
        </div>
        <h5 style={{ fontSize: 15, fontWeight: 700, color: "var(--pbs-slate-2)", fontFamily: "var(--pbs-font)" }}>{message}</h5>
      </Modal.Body>
    </Modal>
  );
});

const DeleteConfirmModal = memo(function DeleteConfirmModal({ show, onHide, onYes }) {
  return (
    <Modal show={show} centered onHide={onHide} dialogClassName="pbs-status-modal">
      <Modal.Body className="text-center p-5">
        <div className="pbs-icon-circle pbs-icon-circle-danger">
          <FaExclamationCircle size={28} color="#ef4444" />
        </div>
        <h5 style={{ fontSize: 16, fontWeight: 700, color: "var(--pbs-slate-2)", margin: "0 0 6px", fontFamily: "var(--pbs-font)" }}>
          Delete this product?
        </h5>
        <p style={{ color: "var(--pbs-muted)", fontSize: 13, margin: 0, fontFamily: "var(--pbs-font)" }}>
          This action cannot be undone.
        </p>
      </Modal.Body>
      <Modal.Footer className="justify-content-center border-0 pb-4 gap-2">
        <button className="pbs-btn" onClick={onHide} style={{ minWidth: 100 }}>Cancel</button>
        <button
          className="pbs-btn"
          onClick={onYes}
          style={{ minWidth: 100, background: "#ef4444", borderColor: "#ef4444", color: "#fff" }}
        >
          Delete
        </button>
      </Modal.Footer>
    </Modal>
  );
});

const DeleteSuccessModal = memo(function DeleteSuccessModal({ show, onHide }) {
  return (
    <Modal show={show} centered onHide={onHide} size="sm" dialogClassName="pbs-status-modal">
      <Modal.Body className="text-center py-5">
        <div className="pbs-icon-circle pbs-icon-circle-success">
          <FaCheckCircle size={28} color="var(--pbs-teal)" />
        </div>
        <h5 style={{ fontSize: 15, fontWeight: 700, color: "var(--pbs-slate-2)", fontFamily: "var(--pbs-font)" }}>
          Product Deleted Successfully
        </h5>
      </Modal.Body>
    </Modal>
  );
});

// ─── CHANGE 1: ProductModal now accepts `dirty` and `isUpdating` props ───────
const ProductModal = memo(function ProductModal({
  show, title, childProductCriteria, category, onCategoryChange,
  partTypeValue, onPartTypeChange, envOptions, values,
  handleSubmit, handleChange, handleBlur, isValid, setFieldValue, onCancel,
  dirty,       // NEW: Formik dirty flag — true when any field differs from initialValues
  isUpdating,  // NEW: true while the PATCH request is in-flight
}) {
  // The Update button should only be active when:
  //   1. At least one field has changed (dirty)
  //   2. The form is valid (isValid)
  //   3. We are not already waiting on the API (isUpdating)
  const updateDisabled = !dirty || !isValid || isUpdating;

  return (
    <Modal show={show} size="lg" onHide={onCancel} backdrop="static" centered dialogClassName="pbs-modal">
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ overflowY: "auto", maxHeight: "70vh" }}>
          <p className="pbs-section-label">General Information</p>
          <div className="pbs-modal-card mb-4">
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Label notify className="mb-1" style={{ fontSize: 12, fontWeight: 600, color: "var(--pbs-slate-3)" }}>Name</Label>
                  <Form.Control type="text" name="productName" placeholder="Product name"
                    value={values.productName} onChange={handleChange} onBlur={handleBlur} />
                  <ErrorMessage className="text-danger" component="span" name="productName" style={{ fontSize: 11 }} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Label notify className="mb-1" style={{ fontSize: 12, fontWeight: 600 }}>Part Number</Label>
                  <Form.Control type="text" name="partNumber" placeholder="Part number"
                    value={values.partNumber} onChange={handleChange} onBlur={handleBlur} />
                  <ErrorMessage className="text-danger" component="span" name="partNumber" style={{ fontSize: 11 }} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Label notify className="mb-1" style={{ fontSize: 12, fontWeight: 600 }}>Quantity</Label>
                  <Form.Control type="number" min="0" step="any" name="quantity" placeholder="Qty"
                    value={values.quantity} onChange={handleChange} onBlur={handleBlur} />
                  <ErrorMessage className="text-danger" component="span" name="quantity" style={{ fontSize: 11 }} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Label className="mb-1" style={{ fontSize: 12, fontWeight: 600 }}>Reference / Position</Label>
                  <Form.Control type="text" name="referenceOrPosition" placeholder="Ref or position"
                    value={values.referenceOrPosition} onChange={handleChange} onBlur={handleBlur} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Label notify className="mb-1" style={{ fontSize: 12, fontWeight: 600 }}>Category</Label>
                  <Select
                    isDisabled={childProductCriteria}
                    value={category}
                    name="category"
                    placeholder="Select category"
                    onBlur={handleBlur}
                    onChange={e => { setFieldValue("category", e); setFieldValue("partType", ""); onCategoryChange(e); }}
                    options={CATEGORY_OPTIONS}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    styles={{ ...customStyles, menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                  />
                  <ErrorMessage className="text-danger" component="span" name="category" style={{ fontSize: 11 }} />
                </Form.Group>
              </Col>
              {category?.value !== "Assembly" && (
                <Col md={6}>
                  <Form.Group>
                    <Label notify style={{ fontSize: 12, fontWeight: 600 }}>Part Type</Label>
                    <Select
                      value={partTypeValue}
                      placeholder="Select part type"
                      name="partType"
                      className="mt-1"
                      onBlur={handleBlur}
                      onChange={e => { setFieldValue("partType", e); onPartTypeChange(e); }}
                      options={[{
                        options: (category?.value === "Electronic" ? Electronic : Mechanical)
                          .map(l => ({ value: l.value, label: l.label }))
                          .sort((a, b) => a.label.localeCompare(b.label)),
                      }]}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                      styles={{ ...customStyles, menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                    />
                    <ErrorMessage className="text-danger" component="span" name="partType" style={{ fontSize: 11 }} />
                  </Form.Group>
                </Col>
              )}
            </Row>
          </div>

          <p className="pbs-section-label">Environment & Temperature</p>
          <div className="pbs-modal-card">
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Label notify className="mb-1" style={{ fontSize: 12, fontWeight: 600 }}>Environment</Label>
                  <Select
                    value={values.environment}
                    name="environment"
                    placeholder="Select environment"
                    onChange={e => setFieldValue("environment", e)}
                    onBlur={handleBlur}
                    options={envOptions}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    styles={{ ...customStyles, menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                  />
                  <ErrorMessage className="text-danger" component="span" name="environment" style={{ fontSize: 11 }} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Label notify className="mb-1" style={{ fontSize: 12, fontWeight: 600 }}>Temperature (°C)</Label>
                  <Form.Control type="number" min="0" step="any" name="temperature"
                    value={values.temperature} onChange={handleChange} onBlur={handleBlur} />
                  <ErrorMessage className="text-danger" component="span" name="temperature" style={{ fontSize: 11 }} />
                </Form.Group>
              </Col>
            </Row>
          </div>
        </Modal.Body>

        {/* ─── CHANGE 2: Smart footer for Edit vs Create ─────────────────── */}
        <Modal.Footer>
          <button className="pbs-btn" type="button" onClick={onCancel} disabled={isUpdating}>
            Cancel
          </button>

          {title === "Edit Product" ? (
            // UPDATE button: disabled until something changes, locked while submitting
            <Button
              className="save-btn"
              type="submit"
              disabled={updateDisabled}
              style={{ minWidth: 140, position: "relative" }}
            >
              {isUpdating ? (
                // Loading state: spinner + label
                <>
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                    style={{
                      width: 13,
                      height: 13,
                      borderWidth: 2,
                      marginRight: 7,
                      verticalAlign: "middle",
                    }}
                  />
                  Updating…
                </>
              ) : (
                "Update Product"
              )}
            </Button>
          ) : (
            // CREATE button: unchanged — just needs a valid form
            <Button className="save-btn" type="submit" disabled={!isValid}>
              Create Product
            </Button>
          )}
        </Modal.Footer>
      </Form>
    </Modal>
  );
});

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
export default function PBS(props) {
  // Inject styles on mount
  useEffect(() => { injectStyles(); }, []);

  const { user } = useAuth();
  const role = user?.role;
  const userId = user?._id;
  const companyId = user?.companyId;
  const history = useHistory();
  const [, startTransition] = useTransition();
  const abortRef = useRef(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; abortRef.current?.abort(); };
  }, []);

  const projectId = useMemo(() => {
    let pid = props?.location?.state?.projectId;
    if (!pid) { const p = window.location.href.split("/"); pid = p[p.length - 1]; }
    return pid;
  }, [props?.location?.state?.projectId]);

  const [ui, dispatchUi] = useReducer(uiReducer, UI0);
  const [access, setAccess] = useState({ permission: null, isOwner: false, createdBy: null });
  const [projectMeta, setProjectMeta] = useState({
    companyName: "", projectName: "", prefillEnviron: [], prefillTemp: [],
  });
  const [rawData, setRawData] = useState([]);
  const [expanded, setExpanded] = useState(() => {
    try {
      const s = sessionStorage.getItem(`pbs_ex_${projectId}`);
      return s ? new Set(JSON.parse(s)) : new Set();
    } catch { return new Set(); }
  });

  // ─── CHANGE 3: Track in-flight state for the update request ──────────────
  const [isUpdating, setIsUpdating] = useState(false);

  const [pbs, setPbs] = useState({
    category: DEFAULT_CATEGORY, partType: "",
    "environment": null, temperature: "",
    productId: null, treeId: null, parentId: "",
    parentsId: null, deleteId: null, deleteTreeId: null,
    productIndexCount: null, count: null,
    patchCategory: "", patchPartType: "", patchName: "",
    partNumber: "", quantity: "", reference: "",
    copyProductTreeId: "", copyProductId: "", copiedName: "",
    selectedRowId: null,
  });

  useEffect(() => {
    const t = setTimeout(() => {
      try { sessionStorage.setItem(`pbs_ex_${projectId}`, JSON.stringify([...expanded])); }
      catch { }
    }, 800);
    return () => clearTimeout(t);
  }, [expanded, projectId]);

  const hasWriteAccess = useMemo(() => {
    if (role === "admin" || role === "SuperAdmin") return true;
    if (access.isOwner && access.createdBy === userId) return true;
    return access.permission?.write === true;
  }, [access, role, userId]);

  const hasReadAccess = useMemo(() => {
    if (role === "admin" || role === "SuperAdmin") return true;
    if (access.isOwner && access.createdBy === userId) return true;
    return access.permission?.read !== false;
  }, [access, role, userId]);

  const logout = useCallback(() => {
    localStorage.clear(); history.push("/login"); window.location.reload();
  }, [history]);

  const openStatusModal = useCallback((message, code = 0) => {
    dispatchUi({ type: "UPDATE", payload: { productMessage: message, errorCode: code, showStatusModal: true } });
    const t1 = setTimeout(() => { if (isMounted.current) dispatchUi({ type: "UPDATE", payload: { showStatusModal: false } }); }, 1800);
    const t2 = setTimeout(() => { if (isMounted.current) dispatchUi({ type: "UPDATE", payload: { errorCode: 0 } }); }, 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const openDeleteSuccess = useCallback(() => {
    dispatchUi({ type: "UPDATE", payload: { deleteSuccess: true, deleteConfirmOpen: false } });
    setTimeout(() => { if (isMounted.current) dispatchUi({ type: "UPDATE", payload: { deleteSuccess: false } }); }, 1800);
  }, []);

  const resetModal = useCallback(() => {
    dispatchUi({ type: "RESET_MODAL" });
    setPbs(p => ({
      ...p,
      category: DEFAULT_CATEGORY, partType: "",
      patchCategory: "", patchPartType: "", reference: "",
      quantity: "", partNumber: "", patchName: "",
      environment: null,
      //temperature: "",
    }));
  }, []);

  const envOptions = useMemo(() => Object.freeze([
    { value: null, label: "None" },
    { options: Environment.map(l => ({ value: l.value, label: l.label })) },
  ]), []);

  const apiFetch = useCallback((fn) => {
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    return fn(ctrl.signal);
  }, []);

  const getTreeProduct = useCallback(() =>
    apiFetch(signal => Api.get("/api/v1/productTreeStructure/product/list", {
      params: { projectId, userId }, signal,
    }).then(res => {
      if (!isMounted.current) return;
      setRawData(res?.data?.data || []);
    }).catch(e => {
      if (!isAbortError(e)) { console.error(e); if (e?.response?.status === 401) logout(); }
    })), [apiFetch, logout, projectId]);

  const getPermission = useCallback(() =>
    apiFetch(signal => Api.get("/api/v1/projectPermission/list", {
      params: { authorizedPersonnel: userId, projectId, userId }, signal,
    }).then(res => {
      if (!isMounted.current) return;
      const pdata = res?.data?.data;
      if (role === "Employee") {
        const mod = pdata?.modules?.find(m => m.name === "PBS" || m.moduleName === "PBS") || pdata?.modules?.[0];
        if (mod) setAccess(p => ({ ...p, permission: { read: mod.read, write: mod.write } }));
      } else {
        setAccess(p => ({ ...p, permission: { read: true, write: true } }));
      }
      dispatchUi({ type: "UPDATE", payload: { permissionsChecked: true } });
    }).catch(e => {
      if (!isAbortError(e)) { if (e?.response?.status === 401) logout(); }
      if (isMounted.current) dispatchUi({ type: "UPDATE", payload: { permissionsChecked: true } });
    })), [apiFetch, logout, projectId]);

  const getProjectMeta = useCallback(() =>
    apiFetch(signal => Api.get(`/api/v1/projectCreation/${projectId}`, { headers: { userId }, signal })
      .then(res => {
        if (!isMounted.current) return;
        const d = res?.data?.data;
        setProjectMeta({
          companyName: d?.companyId?.companyName || "",
          projectName: d?.projectName || "",
          prefillEnviron: d?.environment ? { value: d.environment, label: d.environment } : "",
          prefillTemp: d?.temperature,
        });
        setAccess(p => ({ ...p, isOwner: d?.isOwner, createdBy: d?.createdBy }));
      }).catch(e => {
        if (!isAbortError(e) && e?.response?.status === 401) logout();
      })), [apiFetch, logout, projectId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      dispatchUi({ type: "LOADING", payload: true });
      try { await Promise.all([getPermission(), getProjectMeta(), getTreeProduct()]); }
      catch (e) { if (!isAbortError(e)) console.error(e); }
      finally { if (!cancelled && isMounted.current) dispatchUi({ type: "LOADING", payload: false }); }
    })();
    return () => { cancelled = true; };
  }, [getPermission, getProjectMeta, getTreeProduct]);

  const withRefresh = useCallback(async (fn, successMsg) => {
    dispatchUi({ type: "LOADING", payload: true });
    try {
      const res = await fn();
      await getTreeProduct();
      if (successMsg) toast.success(successMsg, { position: "top-right", autoClose: 2500 });
      return res;
    } catch (err) {
      if (err?.response?.status === 401) logout();
      if (!isAbortError(err))
        toast.error(err?.response?.data?.message || "Something went wrong", { position: "top-right", autoClose: 3000 });
      throw err;
    } finally {
      if (isMounted.current) dispatchUi({ type: "LOADING", payload: false });
    }
  }, [getTreeProduct, logout]);

  /* ── Data pipeline ── */
  const { rowMap, childrenMap, roots, parentMap } = useMemo(() => {
    const sorted = rawData.slice().sort((a, b) =>
      indexSortKey(a.indexCount).localeCompare(indexSortKey(b.indexCount))
    );
    const rowMap = new Map(), parentMap = new Map(), childrenMap = new Map(), roots = [];
    for (const r of sorted) {
      rowMap.set(r.id, r);
      const pid = r.productId;
      if (pid) {
        parentMap.set(r.id, pid);
        const arr = childrenMap.get(pid) ?? [];
        arr.push(r.id);
        childrenMap.set(pid, arr);
      } else roots.push(r.id);
    }
    return { rowMap, childrenMap, roots, parentMap };
  }, [rawData]);

  useEffect(() => {
    setExpanded(prev => {
      let changed = false;
      const next = new Set();
      for (const id of prev) { if (rowMap.has(id)) next.add(id); else changed = true; }
      return changed ? next : prev;
    });
  }, [rowMap]);

  const searchIndex = useMemo(() => {
    const m = new Map();
    for (const [id, r] of rowMap) {
      m.set(id, [r.indexCount, r.productName, r.partNumber, r.partType, r.category, r.reference ?? r.referenceOrPosition]
        .map(x => (x ?? "").toString().toLowerCase()).join(" | "));
    }
    return m;
  }, [rowMap]);

  const debouncedSearch = useDebounced(ui.search);

  const visibleIdSet = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return null;
    const keep = new Set();
    for (const [id, blob] of searchIndex) if (blob.includes(q)) keep.add(id);
    for (const id of [...keep]) {
      let cur = id, guard = 0;
      while (guard++ < MAX_TREE_DEPTH) {
        const p = parentMap.get(cur);
        if (!p || keep.has(p)) break;
        keep.add(p);
        cur = p;
      }
    }
    return keep;
  }, [debouncedSearch, searchIndex, parentMap]);

  const flatRows = useMemo(() => {
    const out = [];
    const pushNode = (id, depth) => {
      if (depth > MAX_TREE_DEPTH) return;
      const row = rowMap.get(id);
      if (!row) return;
      if (visibleIdSet && !visibleIdSet.has(id)) return;
      const childIds = childrenMap.get(id) || [];
      const hasChildren = childIds.length > 0;
      const isExpanded = expanded.has(id);
      out.push({ ...row, __depth: depth, __hasChildren: hasChildren, __expanded: isExpanded });
      if (hasChildren && (visibleIdSet ? true : isExpanded))
        for (const cid of childIds) pushNode(cid, depth + 1);
    };
    for (const rid of roots) pushNode(rid, 0);
    return out;
  }, [rowMap, childrenMap, roots, expanded, visibleIdSet]);

  const toggleExpand = useCallback((id, e) => {
    e?.stopPropagation();
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  /* ── Columns ── */
  const NumCell = useCallback(({ val, dp = 4 }) => {
    if (val == null || val === "" || val === "-") return <span className="vt-dash">—</span>;
    const n = parseFloat(val);
    const display = Number.isFinite(n) ? n.toFixed(dp) : String(val);
    return <span className="vt-num" title={String(val)}>{display}</span>;
  }, []);

  const tableColumns = useMemo(() => [
    {
      title: "Item", field: "indexCount",
      render: row => (
        <div style={{ display: "flex", alignItems: "center", paddingLeft: (row.__depth || 0) * 20, gap: 4, whiteSpace: "nowrap" }}>
          <button
            type="button"
            className="vt-expand-btn"
            onClick={e => toggleExpand(row.id, e)}
            style={{ visibility: row.__hasChildren ? "visible" : "hidden" }}
            title={row.__expanded ? "Collapse" : "Expand"}
          >
            {row.__expanded ? <FaChevronDown size={8} /> : <FaChevronRight size={8} />}
          </button>
          <FontAwesomeIcon icon={faSitemap} className="vt-sitemap-icon" />
          <span className="vt-index">{row.indexCount}</span>
        </div>
      ),
    },
    {
      title: "Name", field: "productName",
      render: row => (
        <span title={row.productName} style={{ whiteSpace: "nowrap", fontWeight: 500 }}>
          {row.productName || <span className="vt-dash">—</span>}
        </span>
      ),
    },
    {
      title: "Category", field: "category",
      render: row => row.category ? getCategoryBadge(row.category) : <span className="vt-dash">—</span>,
    },
    {
      title: "Part No", field: "partNumber",
      render: row => (
        <span className="vt-num" title={row.partNumber}>
          {row.partNumber || <span className="vt-dash">—</span>}
        </span>
      ),
    },
    {
      title: "Part Type", field: "partType",
      render: row => (row.partType && row.partType !== "-"
        ? <span style={{ fontSize: 12 }} title={row.partType}>{row.partType}</span>
        : <span className="vt-dash">—</span>),
    },
    { title: "Qty", field: "quantity", render: row => row.quantity ?? <span className="vt-dash">—</span> },
    { title: "FR", field: "fr", render: row => <NumCell val={row.fr} dp={4} /> },
    { title: "FR Without Qty", field: "frWithoutQuantity", render: row => <NumCell val={row.frWithoutQuantity} dp={4} /> },
    { title: "MTTR", field: "mttr", render: row => <NumCell val={row.mttr} dp={4} /> },
    { title: "MCT", field: "mct", render: row => <NumCell val={row.mct} dp={2} /> },
    { title: "MLH", field: "mlh", render: row => <NumCell val={row.mlh} dp={0} /> },
  ], [toggleExpand, NumCell]);

  /* ── Actions ── */
  const canPaste = Boolean(pbs.copyProductTreeId && pbs.copyProductId);

  const actions = useMemo(() => [
    row => ({
      icon: (row, isDropdownOpen, onDropdownToggle) => !hasWriteAccess ? null : (
        <Dropdown
          show={isDropdownOpen}
          onToggle={(nextShow) => {
            onDropdownToggle(nextShow ? row.id : null);
          }}
        >
          <Dropdown.Toggle as="button" className="vt-action-toggle" title="Actions">
            <FaEllipsisV />
          </Dropdown.Toggle>
          <Dropdown.Menu
            align="end"
            popperConfig={{
              strategy: "fixed",
              modifiers: [
                { name: "preventOverflow", options: { boundary: "viewport", padding: 8 } },
                { name: "flip", options: { fallbackPlacements: ["top-end", "top-start", "bottom-start"] } },
              ],
            }}
            renderOnMount
          >
            {(row.category !== "Electronic" && row.category !== "Mechanical") && <>
              <Dropdown.Item onClick={() => {
                onDropdownToggle(null);
                dispatchUi({ type: "MODAL", payload: { mainProductModalOpen: true, subProduct: true, patchModal: false, childProductCriteria: false } });
                setPbs(p => ({
                  ...p, partType: "", parentId: row.id,
                  productIndexCount: row.indexCount,
                  count: parseInt(row.indexCount, 10),
                }));
              }}>
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
                Add Child Part
              </Dropdown.Item>
              <Dropdown.Divider />
            </>}

            <Dropdown.Item onClick={() => {
              onDropdownToggle(null);
              setPbs(p => ({
                ...p,
                productId: row.id, treeId: row.parentId,
                reference: row.reference || row.referenceOrPosition || "",
                quantity: row.quantity, partNumber: row.partNumber,
                patchName: row.productName, patchCategory: row.category, patchPartType: row.partType,
                category: row.category ? { value: row.category, label: row.category } : p.category,
                environment: row.environment ? { value: row.environment, label: row.environment } : null,
                temperature: row.temperature || "",
              }));
              // DELETE the setProjectMeta line — no longer needed for edit
              //setProjectMeta(p => ({ ...p, prefillTemp: row.temperature }));
              dispatchUi({
                type: "MODAL", payload: {
                  childProductCriteria: row?.children?.length > 0,
                  mainProductModalOpen: true, patchModal: true, subProduct: false,
                }
              });
            }}>
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
              Edit
            </Dropdown.Item>
            <Dropdown.Divider />

            <Dropdown.Item className="text-danger" onClick={() => {
              onDropdownToggle(null);
              setPbs(p => ({
                ...p,
                parentsId: row.productId, deleteId: row.id,
                productIndexCount: row.indexCount, deleteTreeId: row.parentId,
              }));
              dispatchUi({ type: "UPDATE", payload: { deleteConfirmOpen: true } });
            }}>
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>
              Delete
            </Dropdown.Item>
            <Dropdown.Divider />

            <Dropdown.Item onClick={() => {
              onDropdownToggle(null);
              setPbs(p => ({
                ...p,
                copyProductTreeId: row.parentId,
                copyProductId: row.id,
                copiedName: row.productName || "",
              }));
              toast.success("Copied!", { position: "top-right", autoClose: 1500 });
            }}>
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
              Copy
            </Dropdown.Item>
            <Dropdown.Divider />

            <Dropdown.Item
              disabled={!canPaste}
              onClick={async () => {
                onDropdownToggle(null);
                if (!canPaste) { toast.error("Copy a part first.", { position: "top-right" }); return; }
                await withRefresh(
                  () => Api.post("/api/v1/product/copy/paste/sub/product", {
                    copyProductTreeId: pbs.copyProductTreeId,
                    pasteProductTreeId: row.parentId,
                    pasteProductId: row.id,
                    copyProductId: pbs.copyProductId,
                  }),
                  "Pasted successfully!"
                );
              }}
            >
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /></svg>
              Paste {pbs.copiedName ? `"${pbs.copiedName}"` : ""}
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      ),
    }),
  ], [hasWriteAccess, canPaste, pbs.copyProductId, pbs.copyProductTreeId, pbs.copiedName, withRefresh]);

  /* ── CRUD ── */
  const mainProductSchema = useMemo(() => Yup.object().shape({
    productName: Yup.string().required("Name is required"),
    partNumber: Yup.string().required("Part number is required"),
    referenceOrPosition: Yup.string().nullable(),
    quantity: Yup.number().typeError("Numbers only").required("Quantity is required"),
    environment: Yup.object().required("Environment is required"),
    //environment
    partType: pbs.category === "" || pbs.category.value === "Assembly"
      ? Yup.object().nullable()
      : Yup.object().required("Part Type is required"),
    temperature: Yup.string().typeError("Numbers only").required("Temperature is required"),
  }), [pbs.category]);

  console.log("pbs", pbs);

  const formInitialValues = useMemo(() => ({
    productName: pbs.patchName || "",
    partNumber: pbs.partNumber || "",
    partType: pbs.patchPartType ? { label: pbs.patchPartType, value: pbs.patchPartType } : "",
    referenceOrPosition: pbs.reference || "",
    quantity: pbs.quantity || "",
    environment: pbs.environment || projectMeta.prefillEnviron,
    temperature: pbs.temperature || projectMeta.prefillTemp,
    category: pbs.patchCategory ? { label: pbs.patchCategory, value: pbs.patchCategory } : "",
  }), [pbs.patchCategory, pbs.patchName, pbs.patchPartType, pbs.partNumber, pbs.quantity, pbs.reference, projectMeta.prefillEnviron, projectMeta.prefillTemp, pbs.environment, pbs.temperature]);

  const mainProductForm = useCallback(async (values, { resetForm }) => {
    const res = await withRefresh(() => Api.post("api/v1/productBreakdownStructure", {
      productName: values.productName, category: pbs.category.value,
      partNumber: values.partNumber, partType: pbs.partType || "-",
      reference: values.referenceOrPosition, quantity: values.quantity,
      environment: values.environment?.value || projectMeta.prefillEnviron?.value || "AIF",
      temperature: values.temperature, projectId, companyId, userId,
    }));
    resetForm({ values: "" });
    resetModal();
    openStatusModal(res?.data?.message || "Created successfully");
  }, [withRefresh, pbs.category.value, pbs.partType, projectMeta.prefillEnviron, projectId, resetModal, openStatusModal]);

  const subProductForm = useCallback(async (values, { resetForm }) => {
    const res = await withRefresh(() => Api.post("api/v1/product/", {
      productName: values.productName, category: pbs.category.value,
      partType: pbs.partType || "-", partNumber: values.partNumber,
      reference: values.referenceOrPosition, quantity: values.quantity,
      environment: values.environment?.value || projectMeta.prefillEnviron?.value || "AIF",
      temperature: values.temperature || projectMeta.prefillTemp?.value,
      indexCount: pbs.count, productCount: pbs.productIndexCount,
      projectId, companyId, parentId: pbs.parentId, userId,
    }));
    resetForm({ values: "" });
    resetModal();
    openStatusModal(res?.data?.message || "Created successfully");
  }, [withRefresh, pbs, projectMeta.prefillEnviron, projectId, resetModal, openStatusModal]);

  // ─── CHANGE 4: patchForm manages isUpdating — locks on submit, unlocks on failure ──
  const patchForm = useCallback(async (values) => {
    setIsUpdating(true);
    try {
      const res = await withRefresh(() => Api.patch("/api/v1/product/update", {
        productId: pbs.productId, productName: values.productName,
        category: pbs.category.value, reference: values.referenceOrPosition,
        environment: values.environment?.value || pbs.environment,
        temperature: values.temperature, partNumber: values.partNumber,
        partType: values.partType?.value || "-", quantity: values.quantity,
        userId, productTreeStructureId: pbs.treeId, projectId,
      }));
      // On success: close modal (isUpdating will be reset when modal unmounts / modal resets)
      resetModal();
      openStatusModal(res?.data?.message || "Updated successfully");
      // Reset isUpdating after success so it's clean if the modal is re-opened
      setIsUpdating(false);
    } catch {
      // On failure: re-enable the button so the user can retry
      if (isMounted.current) setIsUpdating(false);
    }
  }, [withRefresh, pbs, projectId, resetModal, openStatusModal]);

  const deleteForm = useCallback(async () => {
    const pic = pbs.productIndexCount;
    const parentIndex = String(pic - Math.floor(pic)) !== "0" ? pic.slice(0, -2) : pic;
    await withRefresh(() => Api.patch("/api/v1/product/delete", {
      productId: pbs.deleteId, projectId, companyId,
      parentId: pbs.parentsId, indexCount: parentIndex,
      productTreeStructureId: pbs.deleteTreeId, userId,
    }));
    openDeleteSuccess();
  }, [withRefresh, pbs, projectId, openDeleteSuccess]);

  const DownloadExcel = useCallback(() => {
    const { companyName, projectName } = projectMeta;
    const rows = (rawData || []).map(row => {
      const r = { ...row, CompanyName: companyName, ProjectName: projectName };
      COLUMNS_TO_REMOVE.forEach(k => delete r[k]);
      return r;
    });
    if (!rows.length) { toast.error("No data to export", { position: "top-right" }); return; }
    try {
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), "PBS Data");
      const blob = new Blob(
        [XLSX.write(wb, { bookType: "xlsx", type: "buffer" })],
        { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }
      );
      const a = Object.assign(document.createElement("a"), {
        href: URL.createObjectURL(blob),
        download: `PBS_${projectName}_${Date.now()}.xlsx`,
      });
      a.click(); URL.revokeObjectURL(a.href);
      toast.success("Exported!", { position: "top-right", autoClose: 2000 });
    } catch { toast.error("Export failed", { position: "top-right" }); }
  }, [rawData, projectMeta]);

 const importExcel = useCallback((e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const ext = file.name.split(".").pop()?.toLowerCase();

  if (!EXCEL_VALID_EXT.has(ext)) {
    toast.error("Please upload .xlsx or .xls", { position: "top-right" });
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    toast.error("Max file size is 10MB", { position: "top-right" });
    return;
  }

  const reader = new FileReader();

  reader.onload = async (ev) => {
    try {
      const wb = XLSX.read(ev.target.result, { type: "binary" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const fileData = XLSX.utils.sheet_to_json(ws, { header: 1 });

      const headers = fileData.shift() || [];

      if (!fileData.length) {
        toast.error("No data in sheet", { position: "top-right" });
        return;
      }

      const rows = fileData.map((row, i) => {
        const r = Object.fromEntries(headers.map((h, j) => [h, row[j]]));
        r.indexCount = r.indexCount || (i + 1).toString();
        r.partType = r.partType || "-";
        r.reference = r.reference || "";
        r.quantity = r.quantity || 1;
        return r;
      });

      const rowData = rows.map((r) => ({
        indexCount: r["S.No"]?.toString() || r.indexCount?.toString() || "1",
        productName: r["Product Name"] || r.productName || "",
        category: r["Category"] || r.category || "",
        partNumber: r["Part Number"]?.toString() || r.partNumber?.toString() || "",
        partType: r["Part Type"] || r.partType || "",
        reference: r.reference || r.referenceOrPosition || "",
        quantity: r.quantity || 1,
        environment: r.environment || projectMeta.prefillEnviron?.value || "AIF",
        temperature: r.temperature || projectMeta.prefillTemp || null,
        fr: r["FR"] || r.fr,
        mttr: r["MTTR"] || r.mttr,
        mct: r["MCT"] || r.mct,
        mlh: r["MLH"] || r.mlh,
        productTreeStructureId: pbs.treeId,
        projectId,
      }));

      try {
        await withRefresh(
          () =>
            Api.post("api/v1/productBreakdownStructure/import/record/create", {
              rowData,
              projectId,
              companyId,
            }),
          "Imported successfully!"
        );
      } catch (error) {
        const apiMessage =
          error?.response?.data?.message || "Import failed";

        const errorList = error?.response?.data?.errors || [];

        toast.error(apiMessage, { position: "top-right" });

        if (Array.isArray(errorList) && errorList.length > 0) {
          errorList.forEach((msg, index) => {
            setTimeout(() => {
              toast.error(msg, { position: "top-right" });
            }, index * 200);
          });
        }
      }
    } catch (error) {
      toast.error("Failed to parse file", { position: "top-right" });
    }
  };

  reader.readAsBinaryString(file);
  e.target.value = "";
}, [pbs.treeId, projectId, companyId, projectMeta.prefillEnviron, projectMeta.prefillTemp, withRefresh]);


  const handleSearchChange = useCallback(e => {
    const v = e.target.value;
    startTransition(() => dispatchUi({ type: "UPDATE", payload: { search: v } }));
  }, [startTransition]);

  const modalTitle = ui.patchModal ? "Edit Product" : ui.subProduct ? "Create Sub Product" : "Create Product";

  /* ── Render ── */
  return (
    <div className="pbs-main px-4">
      {ui.isLoading || !ui.permissionsChecked ? (
        <Loader />
      ) : hasReadAccess ? (
        <>
          <div className="pbs-sticky-header">
            <Projectname projectId={projectId} />
          </div>

          {/* Stats */}
          <div className="pbs-stats-bar">
            <span className="pbs-stat-chip">
              <FontAwesomeIcon icon={faSitemap} style={{ fontSize: 10 }} />
              <strong>{rawData.length}</strong> total parts
            </span>
            {roots.length > 0 && (
              <span className="pbs-stat-chip">
                Root items: <strong>{roots.length}</strong>
              </span>
            )}
            {debouncedSearch && (
              <span className="pbs-stat-chip filter-chip">
                <span className="chip-dot" />
                Filtering: "{debouncedSearch}" — {flatRows.length} results
              </span>
            )}
          </div>

          <Formik
            enableReinitialize
            initialValues={formInitialValues}
            validationSchema={mainProductSchema}
            onSubmit={(values, bag) => {
              if (ui.patchModal) patchForm(values, bag);
              else if (ui.subProduct) subProductForm(values, bag);
              else mainProductForm(values, bag);
            }}
          >
            {/* ─── CHANGE 5: Destructure `dirty` from Formik render props ── */}
            {({ values, dirty, handleChange, handleSubmit, handleBlur, isValid, setFieldValue, resetForm }) => (
              <>
                <Toolbar
                  hasWriteAccess={hasWriteAccess}
                  canExport={rawData.length > 0}
                  onImportExcel={importExcel}
                  onExportExcel={DownloadExcel}
                  searchValue={ui.search}
                  onSearchChange={handleSearchChange}
                  onCreateRoot={() => dispatchUi({
                    type: "MODAL", payload: {
                      mainProductModalOpen: true, patchModal: false,
                      subProduct: false, childProductCriteria: false,
                    }
                  })}
                />

                {/* ─── CHANGE 6: Pass `dirty` and `isUpdating` to ProductModal ── */}
                <ProductModal
                  show={ui.mainProductModalOpen}
                  title={modalTitle}
                  childProductCriteria={ui.childProductCriteria}
                  category={pbs.category}
                  onCategoryChange={e => setPbs(p => ({ ...p, category: e, partType: "" }))}
                  partTypeValue={values.partType}
                  onPartTypeChange={e => setPbs(p => ({ ...p, partType: e.value }))}
                  envOptions={envOptions}
                  values={values}
                  handleSubmit={handleSubmit}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                  isValid={isValid}
                  setFieldValue={setFieldValue}
                  onCancel={() => { resetModal(); resetForm(); setIsUpdating(false); }}
                  dirty={dirty}
                  isUpdating={isUpdating}
                />
              </>
            )}
          </Formik>

          {/* Table */}
          <div className="pbs-table-wrap">
            <div className="pbs-table-header">
              <div className="pbs-table-title">
                <FontAwesomeIcon icon={faSitemap} style={{ color: "var(--pbs-teal)", opacity: 0.8 }} />
                Product Breakdown Structure
                <span className="pbs-table-badge">{flatRows.length}</span>
              </div>
              {expanded.size > 0 && (
                <button
                  className="pbs-btn"
                  style={{ height: 28, padding: "0 10px", fontSize: 11 }}
                  onClick={() => setExpanded(new Set())}
                  type="button"
                >
                  Collapse all
                </button>
              )}
            </div>
            <VirtualTable
              rows={flatRows}
              columns={tableColumns}
              actions={actions}
              onRowClick={row => setPbs(p => ({ ...p, selectedRowId: row.id }))}
              selectedRowId={pbs.selectedRowId}
            />
          </div>

          <StatusModal
            show={ui.showStatusModal}
            errorCode={ui.errorCode}
            message={ui.productMessage}
            onHide={() => dispatchUi({ type: "UPDATE", payload: { showStatusModal: false } })}
          />
          <DeleteConfirmModal
            show={ui.deleteConfirmOpen}
            onHide={() => dispatchUi({ type: "UPDATE", payload: { deleteConfirmOpen: false } })}
            onYes={deleteForm}
          />
          <DeleteSuccessModal
            show={ui.deleteSuccess}
            onHide={() => dispatchUi({ type: "UPDATE", payload: { deleteSuccess: false } })}
          />
        </>
      ) : (
        <div className="pbs-denied-card">
          <div className="pbs-icon-circle pbs-icon-circle-danger" style={{ margin: "0 auto 16px" }}>
            <FaExclamationCircle size={28} color="#ef4444" />
          </div>
          <h5 style={{ fontWeight: 700, fontSize: 16, color: "var(--pbs-slate-2)", marginBottom: 8, fontFamily: "var(--pbs-font)" }}>
            Access Denied
          </h5>
          <p style={{ color: "var(--pbs-muted)", fontSize: 13, marginBottom: 20, fontFamily: "var(--pbs-font)" }}>
            You don't have permission to view this section. Contact your admin or go back.
          </p>
          <Button className="save-btn" onClick={history.goBack}>Go Back</Button>
        </div>
      )}
    </div>
  );
}