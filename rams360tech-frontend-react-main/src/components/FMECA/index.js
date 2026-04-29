import React, { use, useEffect, useState, useRef, useCallback } from "react";
import { Modal, Button } from "react-bootstrap";
import "../../css/FMECA.scss";
import Api from "../../Api";
import { tableIcons } from "../core/TableIcons";
import Loader from "../core/Loader";
import Projectname from "../Company/projectname";
import { toast } from "react-toastify";
import {
  faFileArrowUp,
  faTrash,
  faFileArrowDown,
} from "@fortawesome/free-solid-svg-icons";
import CreatableSelect from "react-select/creatable";
import * as XLSX from "xlsx";
import {
  faCircleCheck,
  faCircleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FaExclamationCircle } from "react-icons/fa";
import { useHistory } from "react-router-dom";
import Dropdown from "../Company/Dropdown";
import Tooltip from '@mui/material/Tooltip';
import { createTheme, ThemeProvider } from "@mui/material";
import MaterialTable from "material-table";
import { useAuth } from "../../context/AuthContext";

// hooks/useTableValidation.js
const useTableValidation = () => {
  const [validationErrors, setValidationErrors] = useState([]);
  const [showValidationModal, setShowValidationModal] = useState(false);

  const fieldConfig = {
    operatingPhase: { label: 'Operating Phase', required: true },
    function: { label: 'Function', required: true },
    failureMode: { label: 'Failure Mode', required: true },
    failureModeRatioAlpha: { label: 'Failure Mode Ratio (α)', required: true },
    subSystemEffect: { label: 'Sub System Effect', required: true },
    systemEffect: { label: 'System Effect', required: true },
    endEffect: { label: 'End Effect', required: true },
    endEffectRatioBeta: { label: 'End Effect Ratio (β)', required: true },
    safetyImpact: { label: 'Safety Impact', required: true },
    realibilityImpact: { label: 'Reliability Impact', required: true }
  };

  const validateAllRequiredFields = (tableData) => {
    const errors = [];

    tableData.forEach((row, rowIndex) => {
      const rowNumber = rowIndex + 1;
      const rowErrors = [];

      Object.entries(fieldConfig).forEach(([fieldKey, config]) => {
        if (config.required && (!row[fieldKey] || row[fieldKey].toString().trim() === '')) {
          rowErrors.push(config.label);
        }
      });

      if (rowErrors.length > 0) {
        if (rowErrors.length === 1) {
          errors.push(`Row ${rowNumber}: ${rowErrors[0]} is required`);
        } else {
          errors.push(`Row ${rowNumber}: ${rowErrors.join(', ')} are required`);
        }
      }
    });

    setValidationErrors(errors);
    setShowValidationModal(errors.length > 0);

    return errors.length === 0;
  };

  const validateSingleRow = (rowData, rowIndex) => {
    const errors = [];
    const rowNumber = rowIndex + 1;

    Object.entries(fieldConfig).forEach(([fieldKey, config]) => {
      if (config.required && (!rowData[fieldKey] || rowData[fieldKey].toString().trim() === '')) {
        errors.push(`Row ${rowNumber}: ${config.label} is required`);
      }
    });

    return errors;
  };

  const closeValidationModal = () => {
    setShowValidationModal(false);
    setValidationErrors([]);
  };

  return {
    validationErrors,
    showValidationModal,
    validateAllRequiredFields,
    validateSingleRow,
    closeValidationModal
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper: deep-compare two row objects (only the data fields, not tableData meta)
// ─────────────────────────────────────────────────────────────────────────────
const rowDataFields = [
  'operatingPhase', 'function', 'failureMode', 'failureModeRatioAlpha',
  'cause', 'subSystemEffect', 'systemEffect', 'endEffect', 'endEffectRatioBeta',
  'safetyImpact', 'referenceHazardId', 'realibilityImpact', 'serviceDisruptionTime',
  'frequency', 'severity', 'occurrence', 'detection', 'rpn', 'riskIndex', 'detectableMeansDuringOperation',
  'detectableMeansToMaintainer', 'BuiltInTest', 'designControl', 'maintenanceControl',
  'exportConstraints', 'immediteActionDuringOperationalPhase',
  'immediteActionDuringNonOperationalPhase',
  'userField1', 'userField2', 'userField3', 'userField4', 'userField5',
  'userField6', 'userField7', 'userField8', 'userField9', 'userField10',
];

const hasRowChanged = (newRow, oldRow) => {
  if (!oldRow) return true;
  return rowDataFields.some((field) => {
    const newVal = (newRow[field] ?? '').toString().trim();
    const oldVal = (oldRow[field] ?? '').toString().trim();
    return newVal !== oldVal;
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// SmartSelectCell — proper named React component so hooks are allowed inside.
// Receives all context it needs as props from createSmartSelectField.
// ─────────────────────────────────────────────────────────────────────────────
const SmartSelectCell = ({
  value,
  onChange,
  rowData,
  fieldName,
  label,
  required,
  rowDraftRef,
  markFieldChange,
  computeAndMarkRpn,
  allSepareteData,
  flattenedConnect,
  getConnectedValuesForField,
  isSourceField,
  getDestFieldNamesForSourceValue,
}) => {
  const rowId = rowData?.tableData?.id ?? "new";

  // ── Reset "new" row draft on mount; clear init flag on unmount ──
  // This ensures cancel → reopen always starts with a blank form.
  useEffect(() => {
    if (rowId === "new") {
      if (!rowDraftRef.current["__newRowInitialized"]) {
        rowDraftRef.current["new"] = {};
        rowDraftRef.current["__newRowInitialized"] = true;
      }
    }
    return () => {
      if (rowId === "new") {
        rowDraftRef.current["__newRowInitialized"] = false;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const draftValue = rowDraftRef.current[rowId]?.[fieldName];
  const displayValue = draftValue !== undefined ? draftValue : (value || "");

  const connectedValues = getConnectedValuesForField(fieldName, rowData);
  const separateFilteredData = allSepareteData?.filter(item => item?.sourceName === fieldName) || [];

  let options = connectedValues.length > 0
    ? connectedValues.map(item => ({ value: String(item.destValue), label: String(item.destValue), isConnected: true }))
    : [];

  separateFilteredData.forEach(item => {
    if (!options.some(opt => opt.value === item.sourceValue)) {
      options.push({ value: String(item.sourceValue), label: String(item.sourceValue), isConnected: false });
    }
  });

  const selectedOption = options.find(opt => opt.value === String(displayValue)) || (displayValue ? { label: String(displayValue), value: String(displayValue) } : null);
  const hasError = required && (!displayValue || String(displayValue)?.trim() === "");

  if (!options || options.length === 0) {
    return (
      <div style={{ position: "relative" }}>
        <input
          type="text"
          value={displayValue}
          onChange={(e) => {
            const newValue = e.target.value;
            rowDraftRef.current[rowId] = {
              ...(rowDraftRef.current[rowId] || {}),
              [fieldName]: newValue,
            };
            onChange(newValue);
            markFieldChange(rowId, fieldName, newValue);
            computeAndMarkRpn(rowId, fieldName, newValue, rowData);
          }}
          placeholder={label + (required ? " *" : "")}
          style={{ height: "40px", borderRadius: "4px", width: "100%", borderColor: hasError ? "#d32f2f" : "#ccc" }}
        />
        {hasError && (
          <div style={{ position: "absolute", top: "100%", left: 0, color: "#d32f2f", fontSize: "12px" }}>{label} is required</div>
        )}
      </div>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      <CreatableSelect
        name={fieldName}
        value={selectedOption}
        options={options}
        isClearable
        onChange={(option) => {
          const newValue = option?.value != null ? String(option.value) : "";
          const oldValue = displayValue ? String(displayValue) : "";

          if (isSourceField(fieldName) && oldValue && oldValue !== newValue) {
            const destFieldNames = getDestFieldNamesForSourceValue(fieldName, oldValue);
            if (destFieldNames.length > 0) {
              destFieldNames.forEach(destField => {
                rowDraftRef.current[rowId] = {
                  ...(rowDraftRef.current[rowId] || {}),
                  [destField]: "",
                };
                rowData[destField] = "";
                markFieldChange(rowId, destField, "");
              });
            }
          }

          rowDraftRef.current[rowId] = {
            ...(rowDraftRef.current[rowId] || {}),
            [fieldName]: newValue,
          };

          onChange(newValue);
          markFieldChange(rowId, fieldName, newValue);
          computeAndMarkRpn(rowId, fieldName, newValue, rowData);
        }}
        menuPortalTarget={document.body}
        styles={{
          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
          control: (base) => ({ ...base, borderColor: hasError ? "#d32f2f" : base.borderColor }),
          option: (base, state) => ({
            ...base,
            backgroundColor: state.data?.isConnected ? '#e8f4fd' : base.backgroundColor,
            fontWeight: state.data?.isConnected ? 'bold' : base.fontWeight,
          }),
        }}
      />
      {hasError && (
        <div style={{ position: "absolute", top: "100%", left: 0, color: "#d32f2f", fontSize: "12px" }}>{label} is required</div>
      )}
      {connectedValues.length > 0 && (
        <div style={{ position: "absolute", top: "-18px", right: "5px", fontSize: "10px", color: "#1976d2", background: "#e8f4fd", padding: "2px 5px", borderRadius: "3px" }}>
          Connected
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Custom Save button rendered inside MaterialTable's action bar.
// ─────────────────────────────────────────────────────────────────────────────
const SaveButton = ({ onClick, disabled, tooltip }) => (
  <Tooltip title={disabled ? "No changes to save" : (tooltip || "Save")}>
    <span>
      <button
        onClick={onClick}
        disabled={disabled}
        style={{
          background: 'none',
          border: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          padding: '6px',
          borderRadius: '50%',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.35 : 1,
          transition: 'opacity 0.2s',
        }}
        aria-label="Save row"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="20"
          viewBox="0 0 24 24"
          width="20"
          fill={disabled ? '#999' : '#1976d2'}
        >
          <path d="M0 0h24v24H0z" fill="none" />
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
        </svg>
      </button>
    </span>
  </Tooltip>
);

function Index(props) {
  const { user } = useAuth();
  const {
    validationErrors,
    showValidationModal,
    validateAllRequiredFields,
    closeValidationModal
  } = useTableValidation();

  const [initialProductID, setInitialProductID] = useState();
  const [initialTreeStructure, setInitialTreeStructure] = useState();
  const [exceldata, setExcelData] = useState(null);

  const productId = props?.location?.props?.data?.id
    ? props?.location?.props?.data?.id
    : props?.location?.state?.productId
      ? props?.location?.state?.productId
      : initialProductID;
  const treeStructure = props?.location?.props?.mainData?.id
    ? props?.location?.props?.mainData?.id
    : initialTreeStructure;
  const projectId = props?.location?.state?.projectId
    ? props?.location?.state?.projectId
    : props?.match?.params?.id;

  const [show, setShow] = useState(false);
  const [treeTableData, setTreeTabledata] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tableData, setTableData] = useState([]);
  const [productModal, setProductModal] = useState(false);
  const handleClose = () => setProductModal(false);
  const handleHide = () => setFailureModeRatioError(false);
  const [writePermission, setWritePermission] = useState(true);
  const [crData, setCrData] = useState(null);
  const history = useHistory();

  // ── Dirty-state tracking ──────────────────────────────────────────────────
  const [editingRows, setEditingRows] = useState({});

  // ── Row draft ref: rowId → { fieldName: value }
  const rowDraftRef = useRef({});

  // ── FIX: session ref to detect new add-row opens and clear stale drafts ──
  const newRowSessionRef = useRef(0);

  const isRowDirty = useCallback((rowId) => {
    const entry = editingRows[rowId];
    if (!entry) return false;
    return hasRowChanged(entry.current, entry.original);
  }, [editingRows]);

  const markFieldChange = useCallback((rowId, fieldName, value) => {
    setEditingRows(prev => {
      const entry = prev[rowId];
      if (!entry) return prev;
      return {
        ...prev,
        [rowId]: {
          ...entry,
          current: { ...entry.current, [fieldName]: value },
        },
      };
    });
  }, []);

  // ── RPN auto-compute: fires whenever severity / occurrence / detection changes ──
  const computeAndMarkRpn = useCallback((rowId, fieldName, value, rowData) => {
    if (!['severity', 'occurrence', 'detection'].includes(fieldName)) return;
    const draft = rowDraftRef.current[rowId] || {};
    const s = parseFloat(fieldName === 'severity'   ? value : (draft.severity   ?? rowData?.severity));
    const o = parseFloat(fieldName === 'occurrence' ? value : (draft.occurrence ?? rowData?.occurrence));
    const d = parseFloat(fieldName === 'detection'  ? value : (draft.detection  ?? rowData?.detection));
    const newRpn = (!isNaN(s) && !isNaN(o) && !isNaN(d)) ? String(s * o * d) : "";
    rowDraftRef.current[rowId] = { ...(rowDraftRef.current[rowId] || {}), rpn: newRpn };
    markFieldChange(rowId, 'rpn', newRpn);
  }, [markFieldChange]);

  const userId = user?._id;
  const [existingFailureAlpha, setExistingFailureAlpha] = useState(1);
  const [existingEndBeta, setExistingEndBeta] = useState(1);
  const [readPermission, setReadPermission] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [createdBy, setCreatedBy] = useState();
  const [operationPhase, setOperationPhase] = useState();
  const [colDefs, setColDefs] = useState();
  const [failureModeRatioError, setFailureModeRatioError] = useState(false);
  const [companyId, setCompanyId] = useState();
  const [selectedProductName, setSelectedProductName] = useState("");
  const [allSepareteData, setAllSepareteData] = useState([]);
  const [allConnectedData, setAllConnectedData] = useState([]);
  const [perviousColumnValues, setPerviousColumnValues] = useState([]);

  const [selectedSourceValues, setSelectedSourceValues] = useState({});
  const [rowConnections, setRowConnections] = useState({});
  const [selectedSourceField, setSelectedSourceField] = useState(null);

  const [data, setData] = useState({
    operatingPhase: "", function: "", failureMode: "", failureModeRatioAlpha: "",
    cause: "", subSystemEffect: "", systemEffect: "", endEffect: "",
    endEffectRatioBeta: "", safetyImpact: "", referenceHazardId: "",
    realibilityImpact: "", serviceDisruptionTime: "", frequency: "", severity: "",
    occurrence: "", detection: "", rpn: "",
    riskIndex: "", detectableMeansDuringOperation: "", detectableMeansToMaintainer: "",
    BuiltInTest: "", designControl: "", maintenanceControl: "", exportConstraints: "",
    immediteActionDuringOperationalPhase: "", immediteActionDuringNonOperationalPhase: "",
    userField1: "", userField2: "", userField3: "", userField4: "", userField5: "",
    userField6: "", userField7: "", userField8: "", userField9: "", userField10: "",
  });

  const handleInputChange = (selectedItems, name) => {
    setData((prevData) => ({
      ...prevData,
      [name]: selectedItems ? selectedItems.value : "",
    }));
  };
  const [mergedData, setMergedData] = useState([]);

  const getAllSeprateLibraryData = async () => {
    const companyId = user?.companyId;
    setCompanyId(companyId);
    Api.get("api/v1/library/get/all/separate/value", {
      params: { projectId },
    }).then((res) => {
      let filteredData = res?.data?.data.filter(item => item?.moduleName === "FMECA");
      if (filteredData.length === 0) {
        filteredData = res?.data?.data.filter(item => item?.moduleName === "SAFETY");
      }
      setAllSepareteData(filteredData);
      if (tableData) setMergedData([...tableData, ...filteredData]);
    });
  };

  const getCrData = (selectedProductId) => {
    const pid = selectedProductId || productId;
    if (!pid || !projectId) return;
    Api.post("api/v1/FMECA/totalcr", {
      productId: pid, projectId
    })
      .then((res) => {
        setCrData(res?.data?.data);
      })
      .catch((error) => {
        if (error?.response?.status === 401) logout();
        else console.error("Failed to fetch CR data", error);
      });
  };

  const getAllLibraryData = async () => {
    const companyId = user?.companyId;
    setCompanyId(companyId);
    Api.get("api/v1/library/get/all/data/value", {
      params: { projectId },
    }).then((res) => {
      let filteredData = res?.data?.data.filter(item => item?.moduleName === "FMECA");
      if (filteredData.length === 0) {
        filteredData = res?.data?.data.filter(item => item?.moduleName === "SAFETY");
      }
      setAllSepareteData(filteredData);
      if (tableData) setMergedData([...tableData, ...filteredData]);
    });
  };

  const getAllConnectedLibrary = async (fieldValue, fieldName) => {
    Api.get("api/v1/library/get/all/source/value", {
      params: { projectId, moduleName: "FMECA", sourceName: fieldName, sourceValue: fieldValue.value },
    }).then((res) => {
      const data = res?.data?.libraryData;
      setAllConnectedData(data ? data : perviousColumnValues);
      setPerviousColumnValues(data);
    });
  };

  const getAllConnectedLibraryAfterUpdate = async () => {
    Api.get("api/v1/library/get/all/source/value", {
      params: { projectId, moduleName: "FMECA" },
    }).then((res) => {
      const data = res?.data?.libraryData;
      setAllConnectedData(data ? data : perviousColumnValues);
      setPerviousColumnValues(data);
    });
  };

  useEffect(() => {
    getAllSeprateLibraryData();
    getAllLibraryData();
  }, []);

  const DownloadExcel = () => {
    const columnsToRemove = ["projectId", "companyId", "productId", "id"];
    const CompanyName = treeTableData[0]?.companyId?.companyName;
    const ProjectName = treeTableData[0]?.projectId?.projectName;
    const firstRow = tableData[0];
    const productName = firstRow?.productId?.productName;

    const modifiedTableData = tableData.map((row) => {
      const newRow = { ...row, CompanyName, ProjectName, productName };
      columnsToRemove.forEach((col) => delete newRow[col]);
      return newRow;
    });

    if (modifiedTableData.length > 0) {
      const workSheet = XLSX.utils.json_to_sheet(modifiedTableData, { skipHeader: false });
      const workBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workBook, workSheet, "FMECA Data");
      const buf = XLSX.write(workBook, { bookType: "xlsx", type: "buffer" });
      const blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "FMECA_Data.xlsx";
      link.click();
      URL.revokeObjectURL(url);
      toast.success("FMECA data exported successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    } else {
      toast.error("Export Failed !! No Data Found");
    }
  };

  const createFMECADataFromExcel = (values) => {
    const companyId = user?.companyId;
    setIsLoading(true);
    Api.post("api/v1/FMECA/bulk/create", {
      postData: values, projectId, companyId, productId, userId,
    }).then(() => {
      setIsLoading(false);
      getProductData();
      getCrData(productId);
    }).catch((error) => {
      setIsLoading(false);
      const errorMessage = error?.response?.data?.message || error?.response?.data?.error || "Something went wrong";
      toast.error(errorMessage);
    });
  };

  const importExcel = (e) => {
    const file = e.target.files[0];
    const fileName = file.name;
    const fileExtension = fileName.split(".").pop().toLowerCase();
    if (!["xlsx", "xls"].includes(fileExtension)) {
      toast.error("Please upload a valid Excel file (either .xlsx or .xls)!");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const bstr = event.target.result;
      const workBook = XLSX.read(bstr, { type: "binary" });
      const workSheet = workBook.Sheets[workBook.SheetNames[0]];
      const fileData = XLSX.utils.sheet_to_json(workSheet, { header: 1 });
      const headers = fileData[0];
      if (!headers.includes("failureModeRatioAlpha") || !headers.includes("endEffectRatioBeta")) {
        toast.error("Excel file must contain 'failureModeRatioAlpha' and 'endEffectRatioBeta' columns!");
        return;
      }
      setColDefs(headers.map((head) => ({ title: head, field: head })));
      fileData.splice(0, 1);
      const validationResult = convertToJson(headers, fileData);
      if (validationResult.isValid) setData(validationResult.rows);
      else e.target.value = '';
    };
    reader.readAsBinaryString(file);
  };

  const convertToJson = (headers, data) => {
    const rows = [];
    let alphaTotal = 0;
    let betaTotal = 0;
    const validationErrors = [];
    const isBulkUpload = data.length > 1;

    if (data.length === 0 || data[0].length === 0) {
      toast.error("No Data Found In Excel Sheet");
      return { isValid: false, rows: [] };
    }

    data.forEach((row, rowIndex) => {
      const rowNumber = rowIndex + 2;
      let rowData = {};
      row.forEach((element, index) => { rowData[headers[index]] = element; });

      const alphaValue = parseFloat(rowData.failureModeRatioAlpha);
      const betaValue = parseFloat(rowData.endEffectRatioBeta);

      if (isNaN(alphaValue)) validationErrors.push(`Row ${rowNumber}: failureModeRatioAlpha "${rowData.failureModeRatioAlpha}" is not a valid number`);
      else if (alphaValue > 1) validationErrors.push(`Row ${rowNumber}: failureModeRatioAlpha = ${alphaValue.toFixed(4)} (exceeds 1)`);
      else if (alphaValue < 0) validationErrors.push(`Row ${rowNumber}: failureModeRatioAlpha = ${alphaValue.toFixed(4)} (cannot be negative)`);

      if (isNaN(betaValue)) validationErrors.push(`Row ${rowNumber}: endEffectRatioBeta "${rowData.endEffectRatioBeta}" is not a valid number`);
      else if (betaValue > 1) validationErrors.push(`Row ${rowNumber}: endEffectRatioBeta = ${betaValue.toFixed(4)} (exceeds 1)`);
      else if (betaValue < 0) validationErrors.push(`Row ${rowNumber}: endEffectRatioBeta = ${betaValue.toFixed(4)} (cannot be negative)`);

      if (!isNaN(alphaValue) && !isNaN(betaValue)) {
        alphaTotal += alphaValue;
        betaTotal += betaValue;
        // Auto-compute RPN if severity, occurrence, detection are present in Excel
        const s = parseFloat(rowData.severity);
        const o = parseFloat(rowData.occurrence);
        const d = parseFloat(rowData.detection);
        if (!isNaN(s) && !isNaN(o) && !isNaN(d)) {
          rowData.rpn = s * o * d;
        }
        rows.push(rowData);
      }
    });

    if (isBulkUpload) {
      const EPS = 1e-9;
      if (betaTotal > 1 + EPS) validationErrors.push(`BULK UPLOAD FAILED: Total endEffectRatioBeta = ${betaTotal.toFixed(4)} (exceeds 1)`);
      if (alphaTotal > 1 + EPS) validationErrors.push(`BULK UPLOAD FAILED: Total failureModeRatioAlpha = ${alphaTotal.toFixed(4)} (exceeds 1)`);

      const alphaOnes = rows.filter(r => parseFloat(r.failureModeRatioAlpha) === 1).length;
      const betaOnes = rows.filter(r => parseFloat(r.endEffectRatioBeta) === 1).length;
      if (alphaOnes > 1) validationErrors.push(`BULK DATA ISSUE: ${alphaOnes} rows have failureModeRatioAlpha = 1 (only one row can have value 1)`);
      if (betaOnes > 1) validationErrors.push(`BULK DATA ISSUE: ${betaOnes} rows have endEffectRatioBeta = 1 (only one row can have value 1)`);

      if (rows.some(r => parseFloat(r.failureModeRatioAlpha) > 1)) validationErrors.push("BULK DATA ISSUE: A single row has failureModeRatioAlpha > 1 (not allowed)");
      if (rows.some(r => parseFloat(r.endEffectRatioBeta) > 1)) validationErrors.push("BULK DATA ISSUE: A single row has endEffectRatioBeta > 1 (not allowed)");
    }

    if (validationErrors.length > 0) {
      toast.error(validationErrors.length === 1
        ? `❌ Validation Error:\n\n${validationErrors[0]}`
        : `❌ Validation Errors:\n\n• ${validationErrors.join("\n• ")}`,
        { style: { whiteSpace: 'pre-line', maxWidth: '500px', textAlign: 'left' } }
      );
      return { isValid: false, rows: [] };
    }

    toast.success(
      `📊 Import Summary:\n• Total rows: ${rows.length}\n• failureModeRatioAlpha total: ${alphaTotal.toFixed(4)}\n• endEffectRatioBeta total: ${betaTotal.toFixed(4)}`,
      { style: { whiteSpace: 'pre-line', maxWidth: '500px', textAlign: 'left' } }
    );
    createFMECADataFromExcel(rows);
    return { isValid: true, rows };
  };

  useEffect(() => {
    getTreeData();
    getProductData();
    getCrData();

    if (productId) {
      getAllConnect();
    }
  }, [productId]);

  const logout = () => { localStorage.clear(history.push("/login")); window.location.reload(); };

  const projectSidebar = () => {
    Api.get(`/api/v1/projectCreation/${projectId}`, { headers: { userId } })
      .then((res) => { setIsOwner(res.data.data.isOwner); setCreatedBy(res.data.data.createdBy); });
  };

  const getProductData = () => {
    setIsLoading(true);
    Api.get("/api/v1/fmeca/product/list", { params: { projectId, productId, userId } })
      .then((res) => { setTableData(res?.data?.data); getProjectDetails(); })
      .catch((error) => { if (error?.response?.status === 401) logout(); })
      .finally(() => setIsLoading(false));
  };

  const getTreeData = () => {
    Api.get(`/api/v1/productTreeStructure/list`, { params: { projectId, userId } })
      .then((res) => {
        setTreeTabledata(res?.data?.data, projectId);
        setIsLoading(false);
        setInitialProductID(res?.data?.data[0]?.treeStructure?.id);
        setInitialTreeStructure(res?.data?.data[0]?.id);
      })
      .catch((error) => { if (error?.response?.status === 401) logout(); });
  };

  const getProjectPermission = () => {
    Api.get(`/api/v1/projectPermission/list`, {
      params: { authorizedPersonnel: userId, projectId, userId }
    })
      .then((res) => {
        const data = res?.data?.data;
        const modules = data?.modules || [];
        const moduleName = "FMECA";
        const module = modules.find(m => m.name === moduleName);
        setWritePermission(module?.write ?? false);
      })
      .catch((error) => {
        if (error?.response?.status === 401) logout();
      });
  };

  useEffect(() => { getProjectPermission(); projectSidebar(); getProjectDetails(); }, [projectId]);

  const tableTheme = createTheme({
    overrides: {
      MuiTableRow: {
        root: {
          "&:hover": { cursor: "pointer", backgroundColor: "rgba(224, 224, 224, 1) !important" },
        },
      },
    },
  });

  const getProjectDetails = () => {
    Api.get(`/api/v1/projectCreation/${projectId}`, { headers: { userId } })
      .then((response) => setOperationPhase(response.data?.data?.operationalPhase))
      .catch((error) => { if (error?.response?.status === 401) logout(); });
  };

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [flattenedConnect, setFlattenedConnect] = useState([]);
  const [modalInfo, setModalInfo] = useState({ title: "", message: "" });
  const [connectData, setConnectData] = useState([]);

  const [sourceModuleData, setSourceModuleData] = useState({});

  const moduleApiMap = {
    FMECA: "/api/v1/fmeca/product/list",
    SAFETY: "/api/v1/safety/product/list",
    MTTR: "/api/v1/mttrPrediction/details/mil472",
    PMMRA: "/api/v1/pmMra/details/updated"
  };

  const getSourceModuleData = (moduleNames) => {
    const uniqueModules = [...new Set(moduleNames)];

    uniqueModules.forEach((moduleName) => {
      const normalizedName = String(moduleName).toUpperCase();
      const apiEndpoint = moduleApiMap[normalizedName];
      if (!apiEndpoint) return;

      Api.get(apiEndpoint, {
        params: { projectId, productId, userId },
      })
        .then((res) => {
          const data = res?.data?.data || [];
          setSourceModuleData((prev) => ({ ...prev, [normalizedName]: data }));
        })
        .catch((error) => {
          console.log(`Error fetching ${normalizedName} data for connected library check:`, error);
        });
    });
  };

  const handleDropdownChange = (selectedValue) => {
    const selectedItem = treeTableData.find(item => item.productId === selectedValue);
    setSelectedProductName(selectedItem?.treeStructure?.productName || "");
    getCrData(selectedValue);
  };

  const getConnectedValuesForField = (fieldName, rowData) => {
    let connectedValues = [];
    Object.keys(rowData || {}).forEach(sourceField => {
      const sourceValue = rowData[sourceField];
      if (!sourceValue) return;
      const connections = flattenedConnect?.filter(
        item => item.fieldName === sourceField && String(item.fieldValue) === String(sourceValue) && item.destName === fieldName
      ) || [];
      connectedValues.push(...connections);
    });

    if (connectedValues.length === 0) {
      const allPossibleConnections = flattenedConnect?.filter(item => {
        if (item.destName !== fieldName) return false;
        const normSourceModule = String(item.sourceModuleName).toUpperCase();
        const moduleData = sourceModuleData[normSourceModule] || [];
        return moduleData.some(row => String(row[item.fieldName]) === String(item.fieldValue));
      }) || [];
      connectedValues = [...connectedValues, ...allPossibleConnections];
    }

    return connectedValues;
  };

  const handleSourceSelection = (fieldName, value, rowData) => {
    const rowId = rowData.fmecaId;
    if (!rowId) return;
    setSelectedSourceValues(prev => ({ ...prev, [rowId]: { ...prev[rowId], [fieldName]: String(value) } }));
  };

  const getAllConnect = () => {
    Api.get("api/v1/library/get/all/connect/value", { params: { projectId } })
      .then((res) => {
        setIsLoading(false);
        const filteredData = res.data.getData.filter(
          entry => entry?.libraryId?.moduleName === "FMECA" || entry?.destinationModuleName === "FMECA"
        );
        const flattened = filteredData.flatMap(item =>
          (item.destinationData || [])
            .filter(d => d.destinationModuleName === "FMECA")
            .map(d => ({
              fieldName: item.sourceName,
              fieldValue: item.sourceValue,
              destName: d.destinationName,
              destValue: d.destinationValue,
              destModule: d.destinationModuleName,
              sourceModuleName: item?.libraryId?.moduleName || "",
            }))
        );

        setFlattenedConnect(flattened);
        setConnectData(filteredData);

        const sourceModules = [...new Set(flattened.map(f => f.sourceModuleName).filter(Boolean))];
        if (sourceModules.length > 0) {
          getSourceModuleData(sourceModules);
        }
      });
  };

  const handleCustomDelete = (rowData) => { setRowToDelete(rowData); setDeleteModalOpen(true); };

  const confirmDelete = () => {
    const pId = rowToDelete?.productId?._id;
    if (!rowToDelete) return;
    setIsLoading(true);
    Api.delete(`api/v1/FMECA/${rowToDelete?.id}`, { headers: { userId } })
      .then(() => {
        getProductData();
        Modalopen();
        getCrData(pId);
      })
      .catch((error) => { if (error?.response?.status === 204) { getProductData(); Modalopen(); } })
      .finally(() => { setIsLoading(false); setDeleteModalOpen(false); setRowToDelete(null); });
  };

  const cancelDelete = () => { setDeleteModalOpen(false); setRowToDelete(null); };

  const validateField = (fieldName, value, isRequired) => {
    if (isRequired && (!value || value?.toString()?.trim() === '')) return `${fieldName} is required`;
    return null;
  };

  const ValidationModal = ({ isOpen, errors, onClose }) => {
    if (!isOpen) return null;
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', minWidth: '400px', maxWidth: '500px' }}>
          <h3 style={{ color: '#d32f2f', marginBottom: '15px' }}>Validation Errors</h3>
          <ul style={{ marginBottom: '20px' }}>
            {errors.map((error, index) => <li key={index} style={{ color: '#d32f2f', marginBottom: '5px' }}>{error}</li>)}
          </ul>
          <button onClick={onClose} style={{ backgroundColor: '#1976d2', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}>OK</button>
        </div>
      </div>
    );
  };

  const isSourceField = (fieldName) => flattenedConnect.some(item => item.fieldName === fieldName);
  const isDestinationField = (fieldName) => flattenedConnect.some(item => item.destName === fieldName);
  const getDestinationFieldsForSource = (sourceField, sourceValue) =>
    flattenedConnect?.filter(item => item.fieldName === sourceField && item.fieldValue === sourceValue)
      .map(item => ({ field: item.destName, value: item.destValue })) || [];

  const getDestFieldNamesForSourceValue = (sourceField, sourceValue) => {
    if (!sourceValue) return [];
    return [
      ...new Set(
        flattenedConnect
          ?.filter(
            item =>
              item.fieldName === sourceField &&
              String(item.fieldValue) === String(sourceValue)
          )
          .map(item => item.destName) || []
      ),
    ];
  };

  // ── editComponent factory ─────────────────────────────────────────────────
  const createEditComponent = (fieldName, title, isRequired = false) => ({
    title: isRequired ? `${title} *` : title,
    field: fieldName,
    validate: (rowData) => {
      const error = validateField(title, rowData[fieldName], isRequired);
      return error ? { isValid: false, helperText: error } : true;
    },
    editComponent: ({ value, onChange, rowData }) => {
      const rowId = rowData?.tableData?.id ?? 'new';
      return (
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            value={value || ''}
            onChange={(e) => {
              const newValue = e.target.value;
              if (
                (fieldName === 'failureModeRatioAlpha' || fieldName === 'endEffectRatioBeta') &&
                newValue !== '' && parseFloat(newValue) > 1
              ) return;
              onChange(newValue);
              markFieldChange(rowId, fieldName, newValue);
            }}
            placeholder={isRequired ? `${title} *` : title}
            style={{
              height: "40px", borderRadius: "4px", width: "100%",
              borderColor: isRequired && (!value || value?.toString().trim() === '') ? '#d32f2f' : '#ccc',
            }}
            title={title}
          />
          {isRequired && (!value || value?.toString()?.trim() === '') && (
            <div style={{ position: 'absolute', top: '100%', left: 0, color: '#d32f2f', fontSize: '12px', marginTop: '2px' }}>
              {title} is required!
            </div>
          )}
        </div>
      );
    },
  });

  // ─────────────────────────────────────────────────────────────────────────
  // ─────────────────────────────────────────────────────────────────────────
  // createSmartSelectField — delegates rendering to SmartSelectCell (a proper
  // named React component defined above Index) so hooks are valid inside it.
  // ─────────────────────────────────────────────────────────────────────────
  const createSmartSelectField = (fieldName, label, required = false) => ({
    ...createEditComponent(fieldName, label, required),
    editComponent: (props) => (
      <SmartSelectCell
        {...props}
        fieldName={fieldName}
        label={label}
        required={required}
        rowDraftRef={rowDraftRef}
        markFieldChange={markFieldChange}
        computeAndMarkRpn={computeAndMarkRpn}
        allSepareteData={allSepareteData}
        flattenedConnect={flattenedConnect}
        getConnectedValuesForField={getConnectedValuesForField}
        isSourceField={isSourceField}
        getDestFieldNamesForSourceValue={getDestFieldNamesForSourceValue}
      />
    ),
  });


  const fmecaIdColumn = {
    render: (rowData) => `${rowData?.tableData?.id + 1}`,
    title: "FMECA ID",
  };

  const cmColumn = {
    title: "CM",
    field: "cm",
    editable: "never",
    render: (rowData) => (
      <span style={{ display: "block", textAlign: "center" }}>
        {rowData?.cm != null && rowData?.cm !== "" ? rowData.cm : "—"}
      </span>
    ),
    cellStyle: {
      textAlign: "center",
      minWidth: 150,
      maxWidth: 200,
      backgroundColor: "#f5f5f5",
    },
    headerStyle: {
      textAlign: "center",
      minWidth: 150,
      maxWidth: 200,
    },
  };

  const sourceFields = ['function', 'operatingPhase', 'failureMode'];

  const columns = [
    fmecaIdColumn,
    createSmartSelectField("operatingPhase", "Operating Phases", true, sourceFields.includes('operatingPhase')),
    createSmartSelectField("function", "Function", true, sourceFields.includes('function')),
    createSmartSelectField("failureMode", "Failure Mode", true, sourceFields.includes('failureMode')),
    createSmartSelectField("failureModeRatioAlpha", "Failure Mode Ratio Alpha (must be equal to 1)", true),
    createSmartSelectField("cause", "Cause"),
    createSmartSelectField("subSystemEffect", "Sub System effect", true),
    createSmartSelectField("systemEffect", "System Effect", true),
    createSmartSelectField("endEffect", "End Effect", true),
    createSmartSelectField("endEffectRatioBeta", "End Effect ratio Beta (must be equal to 1)", true),
    createSmartSelectField("safetyImpact", "Safety Impact", true),
    createSmartSelectField("referenceHazardId", "Reference Hazard ID"),
    createSmartSelectField("realibilityImpact", "Reliability Impact", true),
    createSmartSelectField("serviceDisruptionTime", "Service Disruption Time (minutes)"),
    createSmartSelectField("frequency", "Frequency"),
    createSmartSelectField("severity", "Severity"),
    createSmartSelectField("occurrence", "Occurrence (1–10)"),
    createSmartSelectField("detection", "Detection (1–10)"),
    {
      title: "RPN (S×O×D)",
      field: "rpn",
      editable: "never",
      render: (rowData) => {
        const s = parseFloat(rowData?.severity);
        const o = parseFloat(rowData?.occurrence);
        const d = parseFloat(rowData?.detection);
        const rpn = (!isNaN(s) && !isNaN(o) && !isNaN(d)) ? s * o * d : null;
        return (
          <span style={{
            display: "block",
            textAlign: "center",
            fontWeight: "bold",
            color: rpn > 200 ? "#dc2626" : rpn > 100 ? "#f59e0b" : "#16a34a",
          }}>
            {rpn != null ? rpn : "—"}
          </span>
        );
      },
      cellStyle: { textAlign: "center", minWidth: 130, backgroundColor: "#fff8e1" },
      headerStyle: { textAlign: "center", minWidth: 130 },
    },
    createSmartSelectField("riskIndex", "Risk Index"),
    cmColumn,
    createSmartSelectField("detectableMeansDuringOperation", "Detectable Means during operation"),
    createSmartSelectField("detectableMeansToMaintainer", "Detectable Means to Maintainer"),
    createSmartSelectField("BuiltInTest", "Built-in Test"),
    createSmartSelectField("designControl", "Design Control"),
    createSmartSelectField("maintenanceControl", "Maintenance Control"),
    createSmartSelectField("exportConstraints", "Export constraints"),
    createSmartSelectField("immediteActionDuringOperationalPhase", "Immediate Action during operational Phases"),
    createSmartSelectField("immediteActionDuringNonOperationalPhase", "Immediate Action during Non-operational Phases"),
    createSmartSelectField("userField1", "User field 1"),
    createSmartSelectField("userField2", "User field 2"),
    createSmartSelectField("userField3", "User field 3"),
    createSmartSelectField("userField4", "User field 4"),
    createSmartSelectField("userField5", "User field 5"),
    createSmartSelectField("userField6", "User field 6"),
    createSmartSelectField("userField7", "User field 7"),
    createSmartSelectField("userField8", "User field 8"),
    createSmartSelectField("userField9", "User field 9"),
    createSmartSelectField("userField10", "User field 10"),
  ];

  // ── Validation helpers shared by create & update ──────────────────────────
  const runMandatoryValidation = (values) => {
    const mandatoryFields = [
      'operatingPhase', 'function', 'failureMode', 'failureModeRatioAlpha',
      'subSystemEffect', 'systemEffect', 'endEffect', 'endEffectRatioBeta',
      'safetyImpact', 'realibilityImpact',
    ];
    const fieldLabels = {
      operatingPhase: "Operating Phase", function: "Function", failureMode: "Failure Mode",
      failureModeRatioAlpha: "Failure Mode Ratio Alpha", subSystemEffect: "Sub System Effect",
      systemEffect: "System Effect", endEffect: "End Effect", endEffectRatioBeta: "End Effect Ratio Beta",
      safetyImpact: "Safety Impact", realibilityImpact: "Reliability Impact",
    };
    const missing = mandatoryFields.filter(f => !values[f] || values[f]?.toString()?.trim() === '');
    if (missing.length > 0) {
      const names = missing.map(f => fieldLabels[f]);
      toast.error(missing.length === 1 ? `${fieldLabels[missing[0]]} is required!` : `The following fields are required:\n• ${names.join("\n• ")}`,
        { style: { whiteSpace: 'pre-line', maxWidth: '500px', textAlign: 'left' } });
      return false;
    }
    const alpha = parseFloat(values.failureModeRatioAlpha);
    const beta = parseFloat(values.endEffectRatioBeta);
    if (isNaN(alpha)) { toast.error("Failure Mode Ratio Alpha must be a valid number"); return false; }
    if (alpha > 1) { toast.error("Failure Mode Ratio Alpha cannot exceed 1"); return false; }
    if (alpha < 0) { toast.error("Failure Mode Ratio Alpha cannot be negative"); return false; }
    if (isNaN(beta)) { toast.error("End Effect Ratio Beta must be a valid number"); return false; }
    if (beta > 1) { toast.error("End Effect Ratio Beta cannot exceed 1"); return false; }
    if (beta < 0) { toast.error("End Effect Ratio Beta cannot be negative"); return false; }
    return true;
  };

  const createFmeca = (values) => {
    if (!runMandatoryValidation(values)) return Promise.reject(new Error("Validation failed"));
    if (!productId) { setProductModal(true); return Promise.reject(new Error("No product selected")); }

    const companyId = user?.companyId;
    setIsLoading(true);
    return Api.post("api/v1/FMECA/", {
      ...values,
      failureModeRatioAlpha: values?.failureModeRatioAlpha || 1,
      endEffectRatioBeta: values?.endEffectRatioBeta || 1,
      projectId, companyId, productId, userId,
    }).then((response) => {
      toast.success("FMECA created successfully!");
      // Clean up draft for 'new' row after successful creation
      delete rowDraftRef.current['new'];
      rowDraftRef.current['__newRowInitialized'] = false;
      getProductData();
      getCrData(productId);
      return response;
    }).catch((error) => {
      const errorMessage = error?.response?.data?.message || error?.response?.data?.error || "Something went wrong";
      toast.error(errorMessage);
      throw error;
    }).finally(() => setIsLoading(false));
  };

  const updateFmeca = async (values, oldData) => {
    const pId = values?.productId?._id;

    if (!hasRowChanged(values, oldData)) {
      toast.info("No changes detected. Update skipped.", { position: "top-right", autoClose: 3000 });
      return Promise.resolve();
    }

    if (!runMandatoryValidation(values)) throw new Error("Validation failed");

    if (!values.operatingPhase || !values.function || !values.failureMode) {
      toast.error("Operating Phase, Function, and Failure Mode are required.");
      throw new Error("Validation failed");
    }

    const companyId = user?.companyId;
    const payload = {
      operatingPhase: values.operatingPhase, function: values.function,
      failureMode: values.failureMode, failureModeRatioAlpha: values?.failureModeRatioAlpha || 0,
      cause: values.cause, detectableMeansDuringOperation: values.detectableMeansDuringOperation,
      detectableMeansToMaintainer: values.detectableMeansToMaintainer, BuiltInTest: values.BuiltInTest,
      subSystemEffect: values.subSystemEffect, systemEffect: values.systemEffect,
      endEffect: values.endEffect, endEffectRatioBeta: values?.endEffectRatioBeta || 0,
      safetyImpact: values.safetyImpact, referenceHazardId: values.referenceHazardId,
      realibilityImpact: values.realibilityImpact, serviceDisruptionTime: values.serviceDisruptionTime,
      frequency: values.frequency, severity: values.severity,
      occurrence: values.occurrence ? Number(values.occurrence) : undefined,
      detection: values.detection ? Number(values.detection) : undefined,
      rpn: values.rpn ? Number(values.rpn) : undefined,
      riskIndex: values.riskIndex,
      designControl: values.designControl, maintenanceControl: values.maintenanceControl,
      exportConstraints: values.exportConstraints,
      immediteActionDuringOperationalPhase: values.immediteActionDuringOperationalPhase,
      immediteActionDuringNonOperationalPhase: values.immediteActionDuringNonOperationalPhase,
      userField1: values.userField1, userField2: values.userField2, userField3: values.userField3,
      userField4: values.userField4, userField5: values.userField5, userField6: values.userField6,
      userField7: values.userField7, userField8: values.userField8, userField9: values.userField9,
      userField10: values.userField10,
      treeStructureId: treeStructure, projectId, companyId, productId,
      fmecaId: values.id, userId, Alldata: tableData,
      isConnectedUpdate: true, updatedField: values.updatedField,
      oldValue: values.oldValue, newValue: values.newValue,
    };

    try {
      const response = await Api.patch("api/v1/FMECA/update", payload);
      if (response?.status === 200) {
        toast.success("FMECA updated successfully!");
        getProductData();
        getAllConnectedLibraryAfterUpdate();
        getCrData(pId);
      } else if (response?.status === 204) {
        toast.error("Failure Mode Ratio Alpha Must be Equal to One!");
      } else {
        toast.warning("Update request completed, but status not ideal.");
        getProductData();
        getAllConnectedLibraryAfterUpdate();
      }
    } catch (error) {
      const errorStatus = error?.response?.status;
      if (errorStatus === 401) logout();
      else toast.error(errorStatus === 422 ? "Failed to update FMECA. Please try again." : "Failure Mode Ratio Alpha must sum to exactly 1");
      throw error;
    } finally {
      setIsLoading(false);
      const rowId = values?.tableData?.id;
      if (rowId != null) {
        setEditingRows(prev => { const next = { ...prev }; delete next[rowId]; return next; });
        delete rowDraftRef.current[rowId];
      }
    }
  };

  const deleteFmecaData = (value) => {
    setIsLoading(true);
    Api.delete(`api/v1/FMECA/${value?.id}`, { headers: { userId } })
      .then(() => { getProductData(); Modalopen(); })
      .catch((error) => { if (error?.response?.status === 401) logout(); })
      .finally(() => setIsLoading(false));
  };

  const Modalopen = () => { setShow(true); setTimeout(() => setShow(false), 2000); };

  const role = user?.role;

  const handleDelete = (index) => {
    const row = tableData[index];
    setTableData(tableData.filter((_, i) => i !== index));
    deleteFmecaData(row);
  };

  const canWrite = writePermission === true || writePermission === "undefined" || role === "admin" || (isOwner === true && createdBy === userId);

  return (
    <div className="user-workspace-container fmeca-main">
      {isLoading ? (
        <Loader />
      ) : (
        <div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ width: "30%" }}>
              <Projectname projectId={projectId} />
            </div>
            <div style={{ width: "100%", marginRight: "20px", position: "relative", zIndex: 999 }}>
              <Dropdown value={projectId} productId={productId} data={treeTableData} onChange={handleDropdownChange} />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginTop: "8px", height: "40px", gap: "8px" }}>

              {/* ── Bulk Import ── */}
              <Tooltip placement="right" title="Bulk Import (Excel) — Upload .xlsx or .xls file">
                <div>
                  {canWrite ? (
                    <>
                      <label htmlFor="file-input" className="bulk-import-btn">
                        <FontAwesomeIcon icon={faFileArrowUp} />
                        Bulk Import
                      </label>
                      <input type="file" className="input-fields" id="file-input" onChange={importExcel} style={{ display: "none" }} />
                    </>
                  ) : (
                    <label className="bulk-import-btn disabled">
                      <FontAwesomeIcon icon={faFileArrowUp} />
                      Bulk Import
                    </label>
                  )}
                </div>
              </Tooltip>

              {/* ── Export ── */}
              <Tooltip placement="left" title="Export to Excel">
                <button
                  className="import-export-btn"
                  style={{ cursor: canWrite ? "pointer" : "not-allowed", opacity: canWrite ? 1 : 0.5 }}
                  onClick={canWrite ? () => DownloadExcel() : undefined}
                  disabled={!canWrite}
                >
                  <FontAwesomeIcon icon={faFileArrowDown} />
                </button>
              </Tooltip>

            </div>
          </div>

          <div>
            <div className="mt-5" style={{ bottom: "35px" }}>
              {crData?.cr != null && (
                <div style={{ marginLeft: "16px", fontWeight: "bold", whiteSpace: "nowrap" }}>
                  CR: {crData.cr.toFixed(4)}
                </div>
              )}
              <ThemeProvider theme={tableTheme}>
                <MaterialTable
                  title="FMECA"
                  icons={{
                    ...tableIcons,
                    Check: React.forwardRef(({ data, onClick, ...rest }, ref) => {
                      const rowId = data?.tableData?.id;
                      const originalRow = rowId != null ? tableData[rowId] : null;
                      const dirty = hasRowChanged(data, originalRow);
                      return (
                        <SaveButton
                          onClick={onClick}
                          disabled={!dirty}
                          tooltip={dirty ? "Save changes" : "No changes to save"}
                        />
                      );
                    }),
                  }}
                  data={tableData}
                  columns={columns}
                  editable={{
                    onRowAdd: canWrite
                      ? (newRow) => new Promise((resolve, reject) => {
                          // ── FIX: bump session counter so the next add-row open
                          //    resets the draft even if this was a cancel path ──
                          newRowSessionRef.current += 1;
                          createFmeca(newRow)
                            .then(() => resolve())
                            .catch((err) => reject(err));
                        })
                      : null,
                    onRowUpdate: canWrite
                      ? (newRow, oldData) => new Promise((resolve, reject) => {
                          updateFmeca(newRow, oldData)
                            .then(() => resolve())
                            .catch((err) => {
                              if (err === undefined) resolve();
                              else reject(err);
                            });
                        })
                      : null,
                  }}
                  actions={[
                    {
                      icon: () => <FontAwesomeIcon icon={faTrash} style={{ fontSize: "14px", color: "#ff4444" }} />,
                      tooltip: "Delete Row",
                      onClick: (event, rowData) => handleCustomDelete(rowData),
                      disabled: !canWrite,
                      position: "row",
                    },
                  ]}
                  options={{
                    cellStyle: {
                      border: "1px solid #eee", whiteSpace: "normal", wordBreak: "break-word",
                      minWidth: 300, maxWidth: 400, textAlign: "center",
                    },
                    addRowPosition: "first",
                    actionsColumnIndex: -1,
                    showEditIcon: false,
                    showDeleteIcon: false,
                    pageSize: 5,
                    pageSizeOptions: [5, 10, 20, 50],
                    headerStyle: {
                      backgroundColor: "#CCE6FF", fontWeight: "bold", whiteSpace: "nowrap",
                      minWidth: 200, maxWidth: 500, textAlign: "center",
                    },
                  }}
                  localization={{
                    toolbar: { function: "Placeholder" },
                    body: { addTooltip: "Add FMECA" },
                  }}
                />
              </ThemeProvider>
              <ValidationModal isOpen={showValidationModal} errors={validationErrors} onClose={closeValidationModal} />
            </div>
          </div>

          {/* ── Modals ───────────────────────────────────────────────────── */}
          <Modal show={show} centered>
            <div className="d-flex justify-content-center mt-5">
              <FontAwesomeIcon icon={faCircleCheck} fontSize={"40px"} color="#1D5460" />
            </div>
            <Modal.Footer className="d-flex justify-content-center success-message mt-3 mb-4">
              <div><h4 className="text-center">Row Deleted Successfully</h4></div>
            </Modal.Footer>
          </Modal>

          <Modal show={productModal} centered onHide={handleClose}>
            <div className="d-flex justify-content-center mt-5">
              <FaExclamationCircle size={45} color="#de2222b0" />
            </div>
            <Modal.Footer className="d-flex justify-content-center success-message mb-4">
              <div>
                <h5 className="text-center">
                  Please select product from <b>Dropdown</b> before adding a new row!
                </h5>
                <Button className="save-btn fw-bold fmeca-button mt-3" onClick={() => setProductModal(false)}>OK</Button>
              </div>
            </Modal.Footer>
          </Modal>

          <Modal show={deleteModalOpen} onHide={cancelDelete} centered>
            <Modal.Header closeButton><Modal.Title>Confirm Delete</Modal.Title></Modal.Header>
            <Modal.Body>Are you sure you want to delete this row?</Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={cancelDelete}>Cancel</Button>
              <Button variant="danger" onClick={confirmDelete}>Delete</Button>
            </Modal.Footer>
          </Modal>

          <Modal show={failureModeRatioError} centered onHide={handleHide}>
            <div className="d-flex justify-content-center mt-5">
              <FontAwesomeIcon icon={faCircleExclamation} size="2x" color="#de2222b0" />
            </div>
            <Modal.Footer className="d-flex justify-content-center success-message mb-4">
              <div>
                <h5 className="text-center">Sum of Failure Mode must be equal to <b>1</b></h5>
                <Button className="save-btn fw-bold fmeca-button mt-3" onClick={() => setFailureModeRatioError(false)}>OK</Button>
              </div>
            </Modal.Footer>
          </Modal>
        </div>
      )}
    </div>
  );
}

export default Index;