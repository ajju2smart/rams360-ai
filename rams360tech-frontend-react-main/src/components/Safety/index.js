import React, { useEffect, useState, useRef } from "react";
import MaterialTable from "material-table";
import { Modal, Button, } from "react-bootstrap";
import "../../css/FMECA.scss";
import Api from "../../Api";
import { tableIcons } from "../core/TableIcons";
import { ThemeProvider } from "@material-ui/core/styles";
import { createTheme } from "@material-ui/core/styles";
import Dropdown from "../Company/Dropdown";
import CreatableSelect from "react-select/creatable";
import Loader from "../core/Loader";
import Projectname from "../Company/projectname";
import { FaExclamationCircle } from "react-icons/fa";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useHistory } from "react-router-dom";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import { Tooltip } from "@material-ui/core";
import {
  faFileArrowUp,
  faFileArrowDown,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../context/AuthContext";

function Index(props) {
  const { user } = useAuth();
  const [initialProductID, setInitialProductID] = useState();
  const [successModal, setSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const projectId = props?.location?.state?.projectId
    ? props?.location?.state?.projectId
    : props?.match?.params?.id;
  const productId = props?.location?.props?.data?.id
    ? props?.location?.props?.data?.id
    : props?.location?.state?.productId
      ? props?.location?.state?.productId
      : initialProductID;
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tableData, setTableData] = useState();
  const hasRowChangesRef = useRef(false);
  const originalRowData = useRef(null);
  const checkIconUpdaterRef = useRef(null);

  // ── NEW: tracks destination fields that must be cleared on next render ──
  const pendingClearsRef = useRef({});
  //const [treeData, setTreeData] = useState([]);
  const [productModal, setProductModal] = useState(false);
  const handleClose = () => setProductModal(true);
  const [writePermission, setWritePermission] = useState();
  const [treeTableData, setTreeTabledata] = useState([]);
  const userId = user?._id;
  const history = useHistory();
  const [isOwner, setIsOwner] = useState(false);
  const [createdBy, setCreatedBy] = useState();
  const [allSepareteData, setAllSepareteData] = useState([]);
  const role = user?.role;
  const [failureModeRatioError, setFailureModeRatioError] = useState(false);

  // State for connections
  const [flattenedConnect, setFlattenedConnect] = useState([]);
  // State for source module data
  const [sourceModuleData, setSourceModuleData] = useState({});

  // Module name to API endpoint mapping
  const moduleApiMap = {
    FMECA: "/api/v1/fmeca/product/list",
    SAFETY: "/api/v1/safety/product/list",
    MTTR: "/api/v1/mttrPrediction/details/mil472",
    PMMRA: "/api/v1/pmMra/details/updated",
  };

  const getSourceModuleData = (moduleNames) => {
    const uniqueModules = [...new Set(moduleNames)];

    uniqueModules.forEach((moduleName) => {
      const normalizedName = String(moduleName).toUpperCase();
      const apiEndpoint = moduleApiMap[normalizedName];
      if (!apiEndpoint) return;

      Api.get(apiEndpoint, {
        params: {
          projectId: projectId,
          productId: productId,
          userId: userId,
        },
      })
        .then((res) => {
          const data = res?.data?.data || [];
          setSourceModuleData((prev) => ({ ...prev, [normalizedName]: data }));
        })
        .catch((error) => {
          console.log(
            `Error fetching ${normalizedName} data for connected library check:`,
            error
          );
        });
    });
  };

  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setSuccessModal(true);
    setTimeout(() => {
      setSuccessModal(false);
    }, 2000);
  };

  const DownloadExcel = () => {
    if (!tableData || tableData.length === 0) {
      toast("Export Failed !! No Data Found", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        type: "error",
      });
      return;
    }

    const firstRow = tableData[0];
    const companyName = firstRow?.companyId?.companyName || "Unknown Company";
    const projectName = firstRow?.projectId?.projectName || "Unknown Project";
    const data = tableData[0];
    const productName = data?.productId?.productName || "Unknown Product";
    const columnsToRemove = [
      "projectId",
      "companyId",
      "productId",
      "id",
      "tableData",
    ];

    const modifiedTableData = tableData.map((row) => {
      const newRow = {
        Company: companyName,
        Project: projectName,
        Product: productName,
      };
      Object.keys(row).forEach((key) => {
        if (!columnsToRemove.includes(key)) {
          newRow[key] = row[key];
        }
      });
      return newRow;
    });

    if (modifiedTableData.length > 0) {
      const workSheet = XLSX.utils.json_to_sheet(modifiedTableData, {
        skipHeader: false,
      });
      const workBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workBook, workSheet, "Safety Data");
      XLSX.writeFile(workBook, "Safety_Data.xlsx");
      showSuccessMessage("Safety Data Exported Successfully");
    } else {
      toast("Export Failed !! No Data Found", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        type: "error",
      });
    }
  };

  const createsafetyDataFromExcel = (values) => {
    const companyId = user?.companyId;
    setIsLoading(true);
    Api.post("api/v1/safety/", {
      modeOfOperation: values.modeOfOperation,
      hazardCause: values.hazardCause,
      effectOfHazard: values.effectOfHazard,
      hazardClasification: values.hazardClasification,
      designAssuranceLevel: values.designAssuranceLevel
        ? values.designAssuranceLevel
        : 0,
      meansOfDetection: values.meansOfDetection,
      crewResponse: values.crewResponse,
      uniqueHazardIdentifier: values.uniqueHazardIdentifier,
      initialSeverity: values.initialSeverity,
      initialLikelihood: values.initialLikelihood,
      initialRiskLevel: values.initialRiskLevel,
      designMitigation: values.designMitigation ? values.designMitigation : 1,
      designMitigatonResbiity: values.designMitigatonResbiity,
      designMitigtonEvidence: values.designMitigtonEvidence,
      opernalMaintanMitigation: values.opernalMaintanMitigation,
      opernalMitigatonResbility: values.opernalMitigatonResbility,
      operatnalMitigationEvidence: values.operatnalMitigationEvidence,
      residualSeverity: values.residualSeverity,
      residualLikelihood: values.residualLikelihood,
      residualRiskLevel: values.residualRiskLevel,
      hazardStatus: values.hazardStatus,
      ftaNameId: values.ftaNameId,
      userField1: values.userField1,
      userField2: values.userField2,
      projectId: projectId,
      companyId: companyId,
      productId: productId,
      userId: userId,
      Alldata: tableData,
    }).then((response) => {
      setIsLoading(false);
      const status = response?.status;
      if (status === 204) {
        setFailureModeRatioError(true);
      } else {
        showSuccessMessage("Safety Data Imported Successfully");
      }
      getProductData();
      setIsLoading(false);
    });
  };

  const convertToJson = (headers, data) => {
    const rows = [];
    if (data.length > 0 && data[0].length > 1) {
      data.forEach((row) => {
        let rowData = {};
        row.forEach((element, index) => {
          rowData[headers[index]] = element;
        });
        rows.push(rowData);
        createsafetyDataFromExcel(rowData);
      });
      return rows;
    } else {
      toast.error("No Data Found In Excel Sheet", {
        position: "top-right",
      });
    }
  };

  const importExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileName = file.name;
    const validExtensions = ["xlsx", "xls"];
    const fileExtension = fileName.split(".").pop().toLowerCase();

    if (!validExtensions.includes(fileExtension)) {
      toast.error(
        "Please upload a valid Excel file (either .xlsx or .xls)!",
        { position: "top-right" }
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workBook = XLSX.read(data, { type: "array" });
      const workSheetName = workBook.SheetNames[0];
      const workSheet = workBook.Sheets[workSheetName];
      const fileData = XLSX.utils.sheet_to_json(workSheet, { header: 1 });
      const headers = fileData[0];
      fileData.splice(0, 1);
      convertToJson(headers, fileData);
    };
    reader.readAsArrayBuffer(file);
  };

  const [allConnectedData, setAllConnectedData] = useState([]);
  const [data, setData] = useState({
    modeOfOperation: "",
    hazardCause: "",
    effectOfHazard: "",
    designAssuranceLevel: "",
    hazardClasification: "",
    initialSeverity: "",
    initialLikelihood: "",
    initialRiskLevel: "",
    designMitigation: "",
    designMitigatonResbiity: "",
    designMitigtonEvidence: "",
    opernalMaintanMitigation: "",
    opernalMitigatonResbility: "",
    operatnalMitigationEvidence: "",
    residualSeverity: "",
    residualLikelihood: "",
    meansOfDetection: "",
    crewResponse: "",
    uniqueHazardIdentifier: "",
    residualRiskLevel: "",
    hazardStatus: "",
    ftaNameId: "",
    userField1: "",
    userField2: "",
  });

  const handleInputChange = (selectedItems, name) => {
    setData((prevData) => ({
      ...prevData,
      [name]: selectedItems ? selectedItems.value : "",
    }));
  };

  const getConnectedValuesForField = (fieldName, rowData) => {
    let connectedValues = [];
    Object.keys(rowData || {}).forEach((sourceField) => {
      const sourceValue = rowData[sourceField];
      if (!sourceValue) return;
      const connections = flattenedConnect.filter(
        (item) =>
          item.sourceName === sourceField &&
          String(item.sourceValue) === String(sourceValue) &&
          item.destinationName === fieldName
      );
      connectedValues.push(...connections);
    });

    if (connectedValues.length === 0) {
      const allPossibleConnections = flattenedConnect.filter((item) => {
        if (item.destinationName !== fieldName) return false;
        const normSourceModule = String(item.sourceModuleName).toUpperCase();
        const moduleData = sourceModuleData[normSourceModule] || [];
        return moduleData.some(
          (row) => String(row[item.sourceName]) === String(item.sourceValue)
        );
      });
      connectedValues.push(...allPossibleConnections);
    }

    return connectedValues;
  };

  const getDestinationFieldsForSource = (sourceField, sourceValue) => {
    return (
      flattenedConnect
        .filter(
          (item) =>
            item.sourceName === sourceField &&
            String(item.sourceValue) === String(sourceValue)
        )
        .map((item) => ({
          field: item.destinationName,
          value: item.destinationValue,
        })) || []
    );
  };

  const getAllSeprateLibraryData = async () => {
    Api.get("api/v1/library/get/all/separate/value", {
      params: { projectId: projectId },
    }).then((res) => {
      let filteredData = res?.data?.data.filter(
        (item) => item?.moduleName === "SAFETY"
      );
      if (filteredData.length === 0) {
        filteredData = res?.data?.data.filter(
          (item) => item?.moduleName === "SAFETY"
        );
      }
      setAllSepareteData(filteredData);
      //const merged = [...(tableData || []), ...filteredData];
      //setMergedData(merged);
    });
  };

  useEffect(() => {
    getAllSeprateLibraryData();
  }, []);

  const getProjectPermission = () => {
    Api.get(`/api/v1/projectPermission/list`, {
      params: {
        authorizedPersonnel: userId,
        projectId: projectId,
        userId: userId,
      },
    })
      .then((res) => {
        const data = res?.data?.data;
        const modules = data?.modules || [];

        const module = modules.find(m => m.name === "Safety"); // index 9

        setWritePermission(module?.write ?? false);
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) logout();
      });
  };

  const projectSidebar = () => {
    Api.get(`/api/v1/projectCreation/${projectId}`, {
      headers: { userId: userId },
    }).then((res) => {
      setIsOwner(res.data.data.isOwner);
      setCreatedBy(res.data.data.createdBy);
    });
  };

  const logout = () => {
    localStorage.clear(history.push("/login"));
    window.location.reload();
  };

  useEffect(() => {
    getProjectPermission();
    projectSidebar();
  }, [projectId]);

  useEffect(() => {
    getTreeData();
    getProductData();
    if (productId) {
      getAllConnect();
    }
  }, [productId]);

  const getProductData = () => {
    setIsLoading(true);
    Api.get("/api/v1/safety/product/list", {
      params: {
        projectId: projectId,
        productId: productId,
        userId: userId,
      },
    })
      .then((res) => {
        const data = res?.data?.data;
        setIsLoading(false);
        setTableData(data);
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) logout();
      });
  };

  const Modalopen = () => {
    setShow(true);
    setTimeout(() => {
      setShow(false);
    }, 2000);
  };

  const getTreeData = () => {
    Api.get(`/api/v1/productTreeStructure/list`, {
      params: { projectId: projectId, userId: userId },
    })
      .then((res) => {
        //const treeData = res?.data?.data;
        const initialProductID = res?.data?.data[0]?.treeStructure?.id;
        //setTreeData(treeData, projectId);
        setInitialProductID(initialProductID);
        setIsLoading(false);
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) logout();
      });
  };

  const tableTheme = createTheme({
    overrides: {
      MuiTableRow: {
        root: {
          "&:hover": {
            cursor: "pointer",
            backgroundColor: "rgba(224, 224, 224, 1) !important",
          },
        },
      },
    },
  });

  const getAllConnect = () => {
    setIsLoading(true);
    Api.get("api/v1/library/get/all/connect/value", {
      params: { projectId: projectId },
    }).then((res) => {
      setIsLoading(false);
      const filteredData = res.data.getData.filter(
        (entry) =>
          entry?.libraryId?.moduleName === "SAFETY" ||
          entry?.destinationModuleName === "SAFETY"
      );
      const flattened = filteredData.flatMap((item) =>
        (item.destinationData || [])
          .filter((d) => d.destinationModuleName === "SAFETY")
          .map((d) => ({
            sourceName: item.sourceName,
            sourceValue: String(item.sourceValue),
            sourceModuleName: item?.libraryId?.moduleName || "",
            destinationName: d.destinationName,
            destinationValue: String(d.destinationValue),
            destinationModule: d.destinationModuleName,
          }))
      );
      setFlattenedConnect(flattened);

      const sourceModules = [
        ...new Set(
          flattened.map((f) => f.sourceModuleName).filter(Boolean)
        ),
      ];
      if (sourceModules.length > 0) {
        getSourceModuleData(sourceModules);
      }
    });
  };

  const validateField = (fieldName, value, isRequired) => {
    if (isRequired && (!value || value?.toString()?.trim() === "")) {
      return `${fieldName} is required`;
    }
    return null;
  };

  const ValidationModal = ({ isOpen, errors, onClose }) => {
    if (!isOpen) return null;
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "8px",
            minWidth: "400px",
            maxWidth: "500px",
          }}
        >
          <h3 style={{ color: "#d32f2f", marginBottom: "15px" }}>
            Validation Errors
          </h3>
          <ul style={{ marginBottom: "20px" }}>
            {errors.map((error, index) => (
              <li
                key={index}
                style={{ color: "#d32f2f", marginBottom: "5px" }}
              >
                {error}
              </li>
            ))}
          </ul>
          <button
            onClick={onClose}
            style={{
              backgroundColor: "#1976d2",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            OK
          </button>
        </div>
      </div>
    );
  };

  const isSourceField = (fieldName) => {
    return flattenedConnect.some((item) => item.sourceName === fieldName);
  };

  const isDestinationField = (fieldName) => {
    return flattenedConnect.some((item) => item.destinationName === fieldName);
  };

  const detectChanges = (currentRowData) => {
    if (!originalRowData.current) return false;
    const original = originalRowData.current;
    return Object.keys(currentRowData).some(
      (key) => key !== "tableData" && currentRowData[key] !== original[key]
    );
  };

  const createEditComponent = (fieldName, title, isRequired = false) => {
    return {
      title: isRequired ? `${title} *` : title,
      field: fieldName,
      validate: (rowData) => {
        const error = validateField(title, rowData[fieldName], isRequired);
        return error ? { isValid: false, helperText: error } : true;
      },
      editComponent: ({ value, onChange, rowData }) => {
        if (!originalRowData.current && rowData?.id) {
          originalRowData.current = { ...rowData };
        }

        const handleChange = (newValue) => {
          onChange(newValue);
          if (originalRowData.current) {
            const origVal = originalRowData.current[fieldName];
            if (String(newValue ?? "") !== String(origVal ?? "")) {
              hasRowChangesRef.current = true;
            }
          } else {
            hasRowChangesRef.current = true;
          }
          checkIconUpdaterRef.current?.(hasRowChangesRef.current);
        };

        return (
          <div style={{ position: "relative" }}>
            <input
              type="text"
              value={value || ""}
              onChange={(e) => handleChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.stopPropagation();
              }}
              placeholder={isRequired ? `${title} *` : title}
              style={{
                height: "40px",
                borderRadius: "4px",
                width: "100%",
                borderColor:
                  isRequired && (!value || value?.toString().trim() === "")
                    ? "#d32f2f"
                    : "#ccc",
              }}
              title={title}
            />
            {isRequired && (!value || value?.toString()?.trim() === "") && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  color: "#d32f2f",
                  fontSize: "12px",
                  marginTop: "2px",
                }}
              >
                {title} is required!
              </div>
            )}
          </div>
        );
      },
    };
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // createSmartSelectField — with source-clears-destination fix
  // ─────────────────────────────────────────────────────────────────────────────
  const createSmartSelectField = (
    fieldName,
    label,
    required = false,
    isSourceFieldCheck = false
  ) => ({
    ...createEditComponent(fieldName, label, required),
    editComponent: ({ value, onChange, rowData }) => {
      // ── FIX: consume any pending clear written by a source field change ──
      if (pendingClearsRef.current[fieldName]) {
        delete pendingClearsRef.current[fieldName];
        // Defer so we're not calling onChange inside a render cycle
        if (value !== "" && value !== null && value !== undefined) {
          setTimeout(() => onChange(""), 0);
        }
      }

      // Snapshot original row data on first render of this edit session
      if (!originalRowData.current && rowData?.id) {
        originalRowData.current = { ...rowData };
      }

      const connectedValues = getConnectedValuesForField(fieldName, rowData);
      const separateFilteredData =
        allSepareteData?.filter((item) => item?.sourceName === fieldName) || [];

      let options = [];
      if (connectedValues.length > 0) {
        options = connectedValues.map((item) => ({
          value: String(item.destinationValue),
          label: String(item.destinationValue),
          isConnected: true,
        }));
      }
      separateFilteredData.forEach((item) => {
        if (!options.some((opt) => opt.value === item.sourceValue)) {
          options.push({
            value: String(item.sourceValue),
            label: String(item.sourceValue),
            isConnected: false,
          });
        }
      });

      const selectedOption =
        options.find((opt) => opt.value === String(value)) ||
        (value ? { label: String(value), value: String(value) } : null);

      const hasError = required && (!value || String(value)?.trim() === "");

      const handleChange = (newValue) => {
        // ── FIX: if this is a source field, mark linked destination fields
        //         for clearing when their editComponent next renders ─────────
        if (isSourceField(fieldName)) {
          const oldDestinations = getDestinationFieldsForSource(
            fieldName,
            value ?? ""
          );
          const newDestinations = getDestinationFieldsForSource(
            fieldName,
            newValue ?? ""
          );

          oldDestinations.forEach(({ field }) => {
            // Only clear if the destination is NOT also linked to the new value
            const stillLinked = newDestinations.some((d) => d.field === field);
            if (!stillLinked) {
              pendingClearsRef.current[field] = true;
            }
          });
        }

        onChange(newValue);

        if (originalRowData.current) {
          const origVal = originalRowData.current[fieldName];
          if (String(newValue ?? "") !== String(origVal ?? "")) {
            hasRowChangesRef.current = true;
          }
        } else {
          hasRowChangesRef.current = true;
        }
        checkIconUpdaterRef.current?.(hasRowChangesRef.current);
      };

      if (options.length === 0) {
        return (
          <div style={{ position: "relative" }}>
            <input
              type="text"
              value={value || ""}
              onChange={(e) => handleChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.stopPropagation();
              }}
              placeholder={label + (required ? " *" : "")}
              style={{
                height: "40px",
                borderRadius: "4px",
                width: "100%",
                border: `1px solid ${hasError ? "#d32f2f" : "#ccc"}`,
                padding: "8px 12px",
                boxSizing: "border-box",
              }}
            />
            {hasError && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  color: "#d32f2f",
                  fontSize: "12px",
                  marginTop: "2px",
                }}
              >
                {label} is required
              </div>
            )}
          </div>
        );
      } else {
        return (
          <div style={{ position: "relative" }}>
            <CreatableSelect
              name={fieldName}
              value={selectedOption}
              options={options}
              isClearable
              onChange={(option) => {
                const newValue = option?.value ? String(option.value) : "";
                handleChange(newValue);
              }}
              onCreateOption={(inputValue) => handleChange(inputValue)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.target.value) {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
              menuPortalTarget={document.body}
              styles={{
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                control: (base) => ({
                  ...base,
                  borderColor: hasError ? "#d32f2f" : base.borderColor,
                  minHeight: "40px",
                  "&:hover": {
                    borderColor: hasError ? "#d32f2f" : base.borderColor,
                  },
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.data?.isConnected
                    ? "#e8f4fd"
                    : base.backgroundColor,
                  fontWeight: state.data?.isConnected
                    ? "bold"
                    : base.fontWeight,
                }),
              }}
            />
            {hasError && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  color: "#d32f2f",
                  fontSize: "12px",
                  marginTop: "2px",
                }}
              >
                {label} is required
              </div>
            )}
            {connectedValues.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "-18px",
                  right: "5px",
                  fontSize: "10px",
                  color: "#1976d2",
                  background: "#e8f4fd",
                  padding: "2px 5px",
                  borderRadius: "3px",
                }}
              >
                Connected
              </div>
            )}
          </div>
        );
      }
    },
  });

  const safetySourceFields = ["modeOfOperation", "hazardCause", "effectOfHazard"];

  const columns = [
    {
      render: (rowData) => `${rowData?.tableData?.id + 1}`,
      title: "Hazard*",
      cellStyle: { minWidth: "140px", textAlign: "center" },
      headerStyle: { minWidth: "140px", textAlign: "center" },
    },
    createSmartSelectField(
      "modeOfOperation",
      "Mode of Operation",
      true,
      safetySourceFields.includes("modeOfOperation")
    ),
    createSmartSelectField(
      "hazardCause",
      "Hazard Cause",
      true,
      safetySourceFields.includes("hazardCause")
    ),
    createSmartSelectField(
      "effectOfHazard",
      "Effect of the Hazard",
      true,
      safetySourceFields.includes("effectOfHazard")
    ),
    createSmartSelectField("hazardClasification", "Hazard Classification", true),
    createSmartSelectField(
      "designAssuranceLevel",
      "Design Assurance Level (DAL) associated with the hazard"
    ),
    createSmartSelectField("meansOfDetection", "Means of detection", true),
    createSmartSelectField("crewResponse", "Crew response", true),
    createSmartSelectField(
      "uniqueHazardIdentifier",
      "Unique Hazard Identifiers",
      true
    ),
    createSmartSelectField("initialSeverity", "Initial Severity ((impact))"),
    createSmartSelectField(
      "initialLikelihood",
      "Initial likelihood (probability)"
    ),
    createSmartSelectField("initialRiskLevel", "Initial Risk level"),
    createSmartSelectField("designMitigation", "Design Mitigation"),
    createSmartSelectField(
      "designMitigatonResbiity",
      "Design Mitigation Responsibility"
    ),
    createSmartSelectField(
      "designMitigtonEvidence",
      "Design Mitigation Evidence"
    ),
    createSmartSelectField(
      "opernalMaintanMitigation",
      "Operational/Maintenance mitigation"
    ),
    createSmartSelectField(
      "opernalMitigatonResbility",
      "Opernational Mitigation Responsibility"
    ),
    createSmartSelectField(
      "operatnalMitigationEvidence",
      "Operational Mitigation Evidence"
    ),
    createSmartSelectField("residualSeverity", "Residual Severity ((impact))"),
    createSmartSelectField(
      "residualLikelihood",
      "Residual likelihood (probability)"
    ),
    createSmartSelectField("residualRiskLevel", "Residual Risk Level"),
    createSmartSelectField("hazardStatus", "Hazard Status"),
    createSmartSelectField("ftaNameId", "FTA Name/ID"),
    createSmartSelectField("userField1", "User field 1"),
    createSmartSelectField("userField2", "User field 2"),
  ];

  const submit = (values) => {
    if (productId) {
      const companyId = user?.companyId;
      setIsLoading(true);
      Api.post("api/v1/safety/", {
        modeOfOperation: values.modeOfOperation || data.modeOfOperation,
        hazardCause: values.hazardCause || data.hazardCause,
        effectOfHazard: values.effectOfHazard || data.effectOfHazard,
        hazardClasification:
          values.hazardClasification || data.hazardClasification,
        designAssuranceLevel: values.designAssuranceLevel,
        meansOfDetection: values.meansOfDetection || data.meansOfDetection,
        crewResponse: values.crewResponse || data.crewResponse,
        uniqueHazardIdentifier:
          values.uniqueHazardIdentifier || data.uniqueHazardIdentifier,
        initialSeverity: values.initialSeverity || data.initialSeverity,
        initialLikelihood: values.initialLikelihood || data.initialLikelihood,
        initialRiskLevel: values.initialRiskLevel || data.initialRiskLevel,
        designMitigation: values.designMitigation || 1,
        designMitigatonResbiity:
          values.designMitigatonResbiity || data.designMitigatonResbiity,
        designMitigtonEvidence:
          values.designMitigtonEvidence || data.designMitigtonEvidence,
        opernalMaintanMitigation:
          values.opernalMaintanMitigation || data.opernalMaintanMitigation,
        opernalMitigatonResbility:
          values.opernalMitigatonResbility || data.opernalMitigatonResbility,
        operatnalMitigationEvidence:
          values.operatnalMitigationEvidence ||
          data.operatnalMitigationEvidence,
        residualSeverity: values.residualSeverity || data.residualSeverity,
        residualLikelihood:
          values.residualLikelihood || data.residualLikelihood,
        residualRiskLevel: values.residualRiskLevel || data.residualRiskLevel,
        hazardStatus: values.hazardStatus || data.hazardStatus,
        ftaNameId: values.ftaNameId || data.ftaNameId,
        userField1: values.userField1 || data.userField1,
        userField2: values.userField2 || data.userField2,
        projectId: projectId,
        companyId: companyId,
        productId: productId,
        userId: userId,
      })
        .then((response) => {
          getProductData();
          setIsLoading(false);
          showSuccessMessage("Safety Added Successfully");
        })
        .catch((error) => {
          setIsLoading(false);
          const errorStatus = error?.response?.status;
          if (errorStatus === 401) {
            logout();
          } else {
            toast.error("Failed to add Safety record. Please try again.", {
              position: "top-right",
              autoClose: 5000,
            });
          }
        });
    } else {
      setProductModal(true);
    }
  };

  const updateSafety = (values) => {
    const companyId = user?.companyId;
    setIsLoading(true);
    Api.patch("api/v1/safety/update", {
      modeOfOperation: values.modeOfOperation,
      hazardCause: values.hazardCause,
      effectOfHazard: values.effectOfHazard,
      hazardClasification: values.hazardClasification,
      designAssuranceLevel: values.designAssuranceLevel,
      meansOfDetection: values.meansOfDetection,
      crewResponse: values.crewResponse,
      uniqueHazardIdentifier: values.uniqueHazardIdentifier,
      initialSeverity: values.initialSeverity,
      initialLikelihood: values.initialLikelihood,
      initialRiskLevel: values.initialRiskLevel,
      designMitigation: values.designMitigation,
      designMitigatonResbiity: values.designMitigatonResbiity,
      designMitigtonEvidence: values.designMitigtonEvidence,
      opernalMaintanMitigation: values.opernalMaintanMitigation,
      opernalMitigatonResbility: values.opernalMitigatonResbility,
      operatnalMitigationEvidence: values.operatnalMitigationEvidence,
      residualSeverity: values.residualSeverity,
      residualLikelihood: values.residualLikelihood,
      residualRiskLevel: values.residualRiskLevel,
      hazardStatus: values.hazardStatus,
      ftaNameId: values.ftaNameId,
      userField1: values.userField1,
      userField2: values.userField2,
      projectId: projectId,
      companyId: companyId,
      productId: productId,
      safetyId: values?.id,
      userId: userId,
    })
      .then((response) => {
        getProductData();
        setIsLoading(false);
        hasRowChangesRef.current = false;
        originalRowData.current = null;
        // ── FIX: also reset pending clears on save ──
        pendingClearsRef.current = {};
        showSuccessMessage("Safety Updated Successfully");
      })
      .catch((error) => {
        setIsLoading(false);
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        } else {
          const errorMsg =
            error?.response?.data?.message ||
            "Failed to update Safety record. Please try again.";
          toast.error(errorMsg, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }
      });
  };

  const deleteSafetyData = (value) => {
    setIsLoading(true);
    const rowId = value?.id;
    Api.delete(`api/v1/safety/${rowId}`, { headers: { userId: userId } })
      .then((res) => {
        getProductData();
        setShow(true);
        getTreeData();
        Modalopen();
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        } else {
          toast.error("Failed to delete Safety record. Please try again.", {
            position: "top-right",
            autoClose: 5000,
          });
        }
      });
  };

  const hasWriteAccess =
    writePermission === true ||
    writePermission === "undefined" ||
    role === "admin" ||
    (isOwner === true && createdBy === userId);

  return (
    <div className="user-workspace-container">
      {isLoading ? (
        <Loader />
      ) : (
        <div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ width: "30%", marginRight: "20px" }}>
              <Projectname projectId={projectId} />
            </div>

            <div
              style={{
                width: "100%",
                marginRight: "20px",
                position: "relative",
                zIndex: 999,
              }}
            >
              <Dropdown
                value={projectId}
                productId={productId}
                data={treeTableData}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "8px", marginTop: "8px", height: "40px" }}>
              {/* Import */}
              <Tooltip placement="right" title={hasWriteAccess ? "Bulk Import Excel" : "Import disabled"}>
                <div>
                  {hasWriteAccess ? (
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
              {/* Export */}
              <Tooltip placement="left" title={hasWriteAccess ? "Export Excel" : "Export disabled"}>
                <button
                  className="import-export-btn"
                  onClick={hasWriteAccess ? () => DownloadExcel() : undefined}
                  disabled={!hasWriteAccess}
                >
                  <FontAwesomeIcon icon={faFileArrowDown} />
                </button>
              </Tooltip>
            </div>
          </div>

          {/* Material Table */}
          <div className="mt-5" style={{ bottom: "35px" }}>
            <ThemeProvider theme={tableTheme}>
              <MaterialTable
                editable={{
                  onRowAdd: hasWriteAccess
                    ? (newRow) =>
                      new Promise((resolve, reject) => {
                        submit(newRow);
                        hasRowChangesRef.current = false;
                        originalRowData.current = null;
                        // ── FIX: reset pending clears on add ──
                        pendingClearsRef.current = {};
                        resolve();
                      })
                    : null,
                  onRowUpdate: hasWriteAccess
                    ? (newRow, oldData) =>
                      new Promise((resolve, reject) => {
                        const hasChanges =
                          hasRowChangesRef.current ||
                          Object.keys(newRow).some(
                            (key) =>
                              key !== "tableData" &&
                              newRow[key] !== oldData[key]
                          );
                        hasRowChangesRef.current = false;
                        originalRowData.current = null;
                        // ── FIX: reset pending clears on update ──
                        pendingClearsRef.current = {};
                        if (!hasChanges) {
                          resolve();
                          return;
                        }
                        updateSafety(newRow);
                        resolve();
                      })
                    : null,
                  onRowDelete: hasWriteAccess
                    ? (selectedRow) =>
                      new Promise((resolve, reject) => {
                        deleteSafetyData(selectedRow);
                        resolve();
                      })
                    : null,
                  onRowUpdateCancelled: () => {
                    hasRowChangesRef.current = false;
                    originalRowData.current = null;
                    // ── FIX: reset pending clears on cancel ──
                    pendingClearsRef.current = {};
                  },
                }}
                title="Safety"
                icons={{
                  ...tableIcons,
                  Edit: React.forwardRef((props, ref) => {
                    const OriginalEdit = tableIcons.Edit;
                    return (
                      <OriginalEdit
                        {...props}
                        ref={ref}
                        onClick={(e) => {
                          hasRowChangesRef.current = false;
                          originalRowData.current = null;
                          // ── FIX: reset pending clears when starting a new edit ──
                          pendingClearsRef.current = {};
                          checkIconUpdaterRef.current?.(false);
                          if (props.onClick) props.onClick(e);
                        }}
                      />
                    );
                  }),
                  Check: React.forwardRef((props, ref) => {
                    const [changed, setChanged] = React.useState(false);

                    React.useEffect(() => {
                      checkIconUpdaterRef.current = setChanged;
                      const isNewRow = !originalRowData.current;
                      setChanged(isNewRow || hasRowChangesRef.current);
                      return () => {
                        checkIconUpdaterRef.current = null;
                      };
                    }, []);

                    const OriginalCheck = tableIcons.Check;

                    const handleClick = (e) => {
                      if (
                        !hasRowChangesRef.current &&
                        originalRowData.current
                      ) {
                        e.preventDefault();
                        e.stopPropagation();
                        return;
                      }
                      if (props.onClick) props.onClick(e);
                    };

                    return (
                      <Tooltip
                        title={
                          changed ? "Save changes" : "No changes to save"
                        }
                      >
                        <span
                          style={{ display: "inline-flex" }}
                          onClick={handleClick}
                        >
                          <OriginalCheck
                            {...props}
                            ref={ref}
                            onClick={handleClick}
                            style={{
                              color: changed ? "#388e3c" : "#bdbdbd",
                              cursor: changed ? "pointer" : "not-allowed",
                              pointerEvents: "auto",
                              fontSize: "20px",
                            }}
                          />
                        </span>
                      </Tooltip>
                    );
                  }),
                }}
                columns={columns}
                data={tableData}
                options={{
                  cellStyle: {
                    border: "1px solid #eee",
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                    minWidth: 300,
                    maxWidth: 400,
                    textAlign: "center",
                  },
                  addRowPosition: "first",
                  actionsColumnIndex: -1,
                  showEditIcon: false,
                  showDeleteIcon: false,
                  pageSize: 5,
                  pageSizeOptions: [5, 10, 20, 50],
                  headerStyle: {
                    backgroundColor: "#CCE6FF",
                    fontWeight: "bold",
                    whiteSpace: "nowrap",
                    minWidth: 200,
                    maxWidth: 500,
                    textAlign: "center",
                  },
                }}
                localization={{
                  body: {
                    addTooltip: "Add Safety",
                  },
                }}
              />
            </ThemeProvider>
          </div>

          {/* Delete success modal */}
          <Modal show={show} centered>
            <div className="d-flex justify-content-center mt-5">
              <FontAwesomeIcon
                icon={faCircleCheck}
                fontSize={"40px"}
                color="#1D5460"
              />
            </div>
            <Modal.Footer className="d-flex justify-content-center success-message mt-3 mb-4">
              <div>
                <h4 className="text-center">Row Deleted Successfully</h4>
              </div>
            </Modal.Footer>
          </Modal>

          {/* Generic success modal (add / update / export) */}
          <Modal show={successModal} centered>
            <div className="d-flex justify-content-center mt-5">
              <FontAwesomeIcon
                icon={faCircleCheck}
                fontSize={"40px"}
                color="#1D5460"
              />
            </div>
            <Modal.Footer className="d-flex justify-content-center success-message mt-3 mb-4">
              <div>
                <h4 className="text-center">{successMessage}</h4>
              </div>
            </Modal.Footer>
          </Modal>

          {/* No-product-selected modal */}
          <Modal show={productModal} centered onHide={handleClose}>
            <div className="d-flex justify-content-center mt-5">
              <FaExclamationCircle size={45} color="#de2222b0" />
            </div>
            <Modal.Footer className="d-flex justify-content-center success-message mb-4">
              {writePermission === true || writePermission === undefined ? (
                <div>
                  <h5 className="text-center">
                    Please select product from <b>Dropdown </b>before adding a
                    new row!
                  </h5>
                  <Button
                    className="save-btn fw-bold fmeca-button mt-3"
                    onClick={() => setProductModal(false)}
                  >
                    OK
                  </Button>
                </div>
              ) : (
                <div>
                  <h5 className="fmeca-button">
                    Not
                    <br />
                    Allowed
                  </h5>
                  <Button
                    className="save-btn fw-bold ok-buttons"
                    onClick={() => setFailureModeRatioError(false)}
                  >
                    OK
                  </Button>
                </div>
              )}
            </Modal.Footer>
          </Modal>
        </div>
      )}
    </div>
  );
}

export default Index;