import { useMemo, useEffect, useState, useRef } from "react";
import {
  Col,
  Form,
  Row,
  Container,
  Button,
  Modal,
  Card,
} from "react-bootstrap";
import Label from "../LabelComponent";
import "../../css/MttrPrediction.scss";
import Select from "react-select";
import Environment from "../core/Environment";
import { ErrorMessage, Formik } from "formik";
import * as Yup from "yup";
import Api from "../../Api";
import Dropdown from "../Company/Dropdown";
import ResistorCalculation from "../Mil.jsx/ResistorCalculation.jsx";
import Loader from "../core/Loader";
import { Electronic, Mechanical } from "../core/partTypeCategory";
import Spinner from "react-bootstrap/esm/Spinner";
import Projectname from "../Company/projectname";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Checkbox from "@material-ui/core/Checkbox";
import {
  faCircleXmark,
} from "@fortawesome/free-solid-svg-icons";
import Switches from "../Mil.jsx/Switches";
import { useHistory } from "react-router-dom";
import FrUnit from "../core/FRUnit";
import { nprdPartTypes } from "./NprdPartTypes";
import { nprdFRP } from "./NprdFRP";
import { nprdPartDes } from "./NprdPartDes";
import MaterialTable from "material-table";
import { ThemeProvider } from "@material-ui/styles";
import { createTheme } from "@material-ui/core/styles";
import { tableIcons } from "../PBS/TableIcons";
import { toast } from "react-toastify";
import CapacitorCalculation from "../Mil.jsx/CapacitorCalculation.jsx";
import InductiveCalculation from "../Mil.jsx/InductiveCalculation.jsx";
import ConnectionCalculation from "../Mil.jsx/ConnectionCalculation.jsx";
import MicrocircuitsCalculation from "../Mil.jsx/Microcircuit/MicrocircuitsCalculation";
import Lamps from "../Mil.jsx/Lamps.jsx";
import Quartz from "../Mil.jsx/Quartz.jsx";
import ElectronicFilters from "../Mil.jsx/ElectronicFilters.jsx";
import Fuses from "../Mil.jsx/Fuses.jsx";
import Laser from "../Mil.jsx/Laser.jsx";
import Meters from "../Mil.jsx/Meters.jsx";
import Connectors from "../Mil.jsx/Connectors.jsx";
import Tubes from "../Mil.jsx/Tubes.jsx";
import Interconnection from "../Mil.jsx/Interconnection.jsx";
import Diode from "../Mil.jsx/Diode.jsx";
import MiscellaneousPartsCalculator from "../Mil.jsx/MiscellaneousPartsCalculator.jsx";
import RotatingDevice from "../Mil.jsx/RotatingDevice.jsx";
import Relay from "../Mil.jsx/Relay.jsx";
import { useAuth } from "../../context/AuthContext.js";

function Index(props) {
  const { user } = useAuth();
  const projectId = props?.location?.state?.projectId
    ? props?.location?.state?.projectId
    : props?.match?.params?.id;
  const [currentComponent, setCurrentComponent] = useState({
    type: "Capacitor",
  });
  const [category, setCategory] = useState("");
  const [environment, setEnvironment] = useState("");
  const [show, setShow] = useState(false);
  const [treeTableData, setTreeTabledata] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSpinning, setIsSpinning] = useState(true);
  const [reference, setReference] = useState();
  const [name, setName] = useState();
  const [partNumber, setPartNumber] = useState();
  const [temperature, setTemperature] = useState();
  const [quantity, setQuantity] = useState();
  const [partType, setPartType] = useState();
  const [successMessage, setSuccessMessage] = useState();
  const [initialProductID, setInitialProductID] = useState();
  const [initialTreeStructure, setInitialTreeStructure] = useState();
  const [showModal, setShowModal] = useState(false);
  const [showMil, setShowMil] = useState(false);
  const [nprdModel, setNprdModel] = useState(false);
  const [nprd2016Model, setNprd2016Model] = useState(false);
  const [partTypeNprd, setPartTypeNprd] = useState();
  const [partTypeDescr, setPartTypeDescr] = useState();
  const [partTypeQuality, setPartTypeQuality] = useState();
  const [partType2016Nprd, setPartType2016Nprd] = useState();
  const [partType2016Descr, setPartType2016Descr] = useState();
  const [partType2016Quality, setPartType2016Quality] = useState();
  const [selectedNprdFR, setSelectedNprdFR] = useState([]);
  const [rowClicked, setRowClicked] = useState(false);
  const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);
  const [partTypeNprd2016Data, setPartTypeNprd2016Data] = useState([]);
  const [partTypeNprdDesc2016Data, setPartTypeNprdDesc2016Data] = useState([]);
  const [permission, setPermission] = useState();
  const [predicted, setPredicted] = useState();
  const [frUnit, setFrUnit] = useState(null);
  const [standard, setStandard] = useState(null)
  const [mtbfResult, setMtbfResult] = useState(null);

  // ── Dirty tracking for out-of-Formik state ──────────────────────────────────
  const serverSnapshot = useRef(null);

  const isExternalStateDirty = () => {
    if (!serverSnapshot.current) return false;
    const snap = serverSnapshot.current;

    if (String(predicted ?? "") !== String(snap.predicted ?? "")) return true;
    if (String(dutyCycle ?? "") !== String(snap.dutyCycle ?? "")) return true;
    if (String(frOffset ?? "") !== String(snap.frOffset ?? "")) return true;
    if (String(allocated ?? "") !== String(snap.allocated ?? "")) return true;
    if (String(otherFr ?? "") !== String(snap.otherFr ?? "")) return true;
    if (String(frRemarks ?? "") !== String(snap.frRemarks ?? "")) return true;

    const toVal = (opt) => (opt ? (opt.value ?? opt) : "");
    if (toVal(standard) !== toVal(snap.standard)) return true;
    if (toVal(frUnit) !== toVal(snap.frUnit)) return true;
    if (toVal(frOffsetOperand) !== toVal(snap.frOffsetOperand)) return true;
    if (toVal(frDistribution) !== toVal(snap.frDistribution)) return true;
    if (toVal(source) !== toVal(snap.source)) return true;

    return false;
  };
  // ────────────────────────────────────────────────────────────────────────────

  //mtbf helpers
  function toPerHour(value, unit) {
    const v = Number(value);
    if (!Number.isFinite(v)) return NaN;
    switch (unit) {
      case "Failure Per Hour":
      case "per_hour":
        return v;
      case "FIT":
        return v / 1e9;
      case "Failure Per Million Operating Hours":
      case "per_million_hours":
        return v / 1e6;
      default:
        return NaN;
    }
  }

  function applyOffset(baseHr, operand, offsetHr) {
    if (!operand) return baseHr;
    if (!Number.isFinite(offsetHr)) return baseHr;
    let out = baseHr;
    if (operand === "+") out = baseHr + offsetHr;
    if (operand === "-") out = baseHr - offsetHr;
    if (operand === "*") out = baseHr * offsetHr;
    if (operand === "/") out = offsetHr === 0 ? NaN : baseHr / offsetHr;
    return Math.max(0, out);
  }

  function calcItemMtbf({ predicted, frUnit, offsetOperand, offsetValue, dutyCycle, quantity }) {
    const baseHr = toPerHour(predicted, frUnit);
    const offHr = toPerHour(offsetValue ?? 0, frUnit);
    const lambdaHr = applyOffset(baseHr, offsetOperand, offHr);

    const Q = Number(quantity);
    const D = Number(dutyCycle);

    if (!Number.isFinite(lambdaHr)) return { error: "Invalid predicted value or unit" };
    if (!Number.isFinite(Q) || Q < 0) return { error: "Invalid quantity" };
    if (!Number.isFinite(D) || D < 0 || D > 1) return { error: "Duty cycle must be between 0 and 1" };

    const lambdaItem = lambdaHr * Q * D;
    const mtbfHours = lambdaItem === 0 ? null : 1 / lambdaItem;
    setMtbfResult(mtbfHours);

    return { lambdaHr, lambdaItem, mtbfHours };
  }

  const handleChange = (rowData) => {
    if (selectedCheckboxes.includes(rowData)) {
      setSelectedCheckboxes(
        selectedCheckboxes.filter((item) => item !== rowData)
      );
      setSelectedNprdFR(null);
    } else {
      setSelectedCheckboxes([rowData]);
      setSelectedNprdFR(rowData);
    }
  };

  const nprdPartType = nprdPartTypes;
  const [nprdFR, setNprdFR] = useState(
    partTypeNprd?.value &&
      partTypeDescr?.value &&
      partTypeQuality?.label &&
      environment?.label
      ? nprdFRP.find((item) => {
        return (
          item?.PartTypeId === partTypeNprd?.value &&
          item?.Quality === partTypeQuality?.label &&
          item?.Environment === environment?.label &&
          item?.PartDescrId === partTypeDescr?.value
        );
      })?.FR
      : ""
  );

  const nprd2016Schema = Yup.object().shape({
    partTypeNprd: Yup.object()
      .nullable()
      .required("Part Type is required"),
    partTypeDescr: Yup.object()
      .nullable()
      .required("Part Type Description is required"),
    quality2016: Yup.string()
      .required("Quality is required"),
    FR: Yup.number()
      .nullable()
      .typeError("FR must be a number")
      .min(0, "FR must be >= 0"),
  });

  const [FR, setFR] = useState();

  useEffect(() => {
    if (partTypeNprd?.value && partTypeDescr?.value && environment?.label) {
      const filteredData = nprdFRP.filter(
        (item) =>
          item?.PartTypeId === partTypeNprd?.value &&
          item?.PartDescrId === partTypeDescr?.value &&
          item?.Environment === environment?.label
      );
      setData(filteredData || []);
    }

    if (standard?.value === "MIL" && !frUnit) {
      const MIL_FR_UNIT = {
        value: "Failure Per Million Operating Hours",
        label: "Failure Per Million Operating Hours",
      };
      setFrUnit(MIL_FR_UNIT);
    }
  }, [
    partTypeNprd?.value,
    partTypeDescr?.value,
    environment?.label,
    standard?.value,
    frUnit,
  ]);

  const productId = props?.location?.props?.data?.id
    ? props?.location?.props?.data?.id
    : props?.location?.state?.productId
      ? props?.location?.state?.productId
      : initialProductID;
  const treeStructure = props?.location?.state?.parentId
    ? props?.location?.state?.parentId
    : initialTreeStructure;
  const [field, setField] = useState();

  const [dutyCycle, setDutyCycle] = useState('');
  const [frDistribution, setFrDistribution] = useState();
  const [allocated, setAllocated] = useState('');
  const [otherFr, setOtherFr] = useState('');
  const [frRemarks, setFrRemarks] = useState('');

  const [frOffset, setFrOffSet] = useState();
  const [operand, setOperand] = useState();
  const [frOffsetOperand, setOffSetOperand] = useState();
  const [permissionsChecked, setPermissionsChecked] = useState(false);
  const [frpId, setFrpId] = useState();
  const [source, setSource] = useState({
    value: "Predicted",
    label: "Predicted",
  });
  const role = user?.role;
  const [writePermission, setWritePermission] = useState();
  const history = useHistory();

  const [isOwner, setIsOwner] = useState(false);
  const [createdBy, setCreatedBy] = useState();
  const columns = [
    {
      title: "S.No",
      field: "s.no",
      render: (rowData) => data?.indexOf(rowData) + 1,
    },
    {
      title: "Environment",
      field: "Environment",
      cellStyle: { minWidth: "300px" },
    },
    { title: "Quality", field: "Quality" },
    {
      title: "FR",
      field: "FR",
      cellStyle: { minWidth: "144px" },
    },
    {
      title: "Checkbox",
      render: (rowData) => (
        <Checkbox
          checked={selectedCheckboxes.includes(rowData)}
          onChange={() => handleChange(rowData)}
        />
      ),
    },
  ];

  const tableTheme = createTheme({
    overrides: {
      MuiTableRow: {
        root: {
          "&:hover": {
            cursor: "pointer",
            backgroundColor: "rgba(224, 224, 224, 1) !important",
            color: "rgba(0, 0, 0, 1) !important",
          },
        },
      },
    },
  });

  const [data, setData] = useState([]);

  const rowStyle = (rowData) => {
    const lastProductId = localStorage.getItem("lastCreatedProductId");
    if (rowData.id === lastProductId) {
      return {
        backgroundColor: "#1d5460",
        color: "white",
      };
    }
    return {};
  };

  let baseMultiplier = 4.5e-9;
  let temperatureMultiplier = 12;
  let stressDivider = 0.5;
  let temperatureBase = 273;
  let T = 25;
  let S = 0.00031;
  T = T + 273;
  let lambdaB =
    baseMultiplier *
    Math.exp((temperatureMultiplier * T) / 343) *
    Math.exp(S / stressDivider) *
    (T / temperatureBase);
  let [baseFailureRate, setBaseFailureRate] = useState(1e-6);
  const [isSaving, setIsSaving] = useState(false);
  let [resistanceFactor, setResistanceFactor] = useState(1);
  let [qualityFactor, setQualityFactor] = useState(0.03);
  let [enviromentFactor, setEnviromentFactor] = useState(5);
  let [failures, setFailures] = useState(500);
  let predictedValue =
    lambdaB * resistanceFactor * qualityFactor * enviromentFactor;
  let valueInDecimal = predictedValue.toFixed(6);
  const constant = 4.5e-9;
  const exponent1 = (343 / 12) * (298 / 273);
  const exponent2 = (6 * 273 * 1000) / (0.00031 * 298 * 1000);
  const exp1 = Math.exp(exponent1);
  const exp2 = Math.exp(exponent2);
  const result = constant * exp1 * exp2;

  const getMTB = () => {
    setShowModal(false);
  };

  const getTreedata = () => {
    Api.get(`/api/v1/productTreeStructure/list`, {
      params: {
        projectId: projectId,
        userId: userId,
      },
    })
      .then((res) => {
        const initialProductID = res?.data?.data[0]?.treeStructure?.id;
        const treeData = res?.data?.data;
        setInitialProductID(initialProductID);
        setInitialTreeStructure(res?.data?.data[0]?.id);
        setIsLoading(false);
        setTreeTabledata(treeData);
        setIsLoading(false);
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };

  const customStyles = {
    control: (provided) => ({
      ...provided,
      minHeight: "38px",
      height: "38px",
    }),
    valueContainer: (provided) => ({
      ...provided,
      height: "38px",
      padding: "0 6px",
    }),
    input: (provided) => ({
      ...provided,
      margin: "0px",
    }),
    indicatorsContainer: (provided) => ({
      ...provided,
      height: "38px",
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
    }),
  };

  const projectSidebar = () => {
    Api.get(`/api/v1/projectCreation/${projectId}`, {
      headers: {
        userId: userId,
      },
    }).then((res) => {
      setIsOwner(res.data.data.isOwner);
      setCreatedBy(res.data.data.createdBy);
    });
  };

  const userId = user?._id;

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
        const moduleName = "Failure Rate Prediction";
        const module = modules.find(m => m.name === moduleName);
        setWritePermission(module?.write ?? false);
        setPermission(module ?? null);
        setPermissionsChecked(true);
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
        setPermissionsChecked(true);
      });
  };

  const logout = () => {
    localStorage.clear(history.push("/login"));
    window.location.reload();
  };

  const getNprd2016Datas = () => {
    Api.get("/api/v1/failureRatePrediction/get/nprd/2016").then((res) => {
      const data = res?.data?.data;
      setPartTypeNprd2016Data(data?.getPartTypeData);
    });
  };

  useEffect(() => {
    productTreeData();
    getProjectPermission();
    projectSidebar();
    getNprd2016Datas();
    getTreedata();
    getProductFRPData();
  }, [projectId, productId]);

  const productTreeData = () => {
    setIsSpinning(true);
    Api.get("/api/v1/productTreeStructure/get/tree/product/list", {
      params: {
        projectId: projectId,
        treeStructureId: productId,
        userId: userId,
      },
    })
      .then((res) => {
        const data = res?.data?.data;
        setCategory(
          data?.category ? { label: data?.category, value: data?.category } : ""
        );
        setQuantity(data?.quantity);
        setReference(data?.reference);
        setName(data?.productName);
        setPartNumber(data?.partNumber);
        setEnvironment(
          data?.environment
            ? { label: data?.environment, value: data?.environment }
            : ""
        );
        setTemperature(data?.temperature);
        setPartType(
          data?.partType ? { label: data?.partType, value: data?.partType } : ""
        );
        setIsSpinning(false);
        setIsLoading(false);
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };

  const getProductFRPData = () => {
    const companyId = user?.companyId;
    return Api.get(`/api/v1/failureRatePrediction/details`, {
      params: {
        projectId: projectId,
        companyId: companyId,
        productId: productId,
        userId: userId,
      },
    })
      .then((res) => {
        const data = res?.data?.frpData;

        const resolvedField = data?.field ?? "";
        const resolvedAllocated = data?.allocated ?? "";
        const resolvedDutyCycle = data?.dutyCycle ?? "";
        const resolvedFrOffset = data?.failureRateOffset ?? "";
        const resolvedPredicted = data?.predicted ?? (nprdFR ?? "");
        const resolvedOtherFr = data?.otherFr ?? "";
        const resolvedFrRemarks = data?.frRemarks ?? "";

        const resolvedFrDistribution = data?.frDistribution
          ? { label: data.frDistribution, value: data.frDistribution }
          : "";
        const resolvedStandard = data?.standard
          ? { label: data.standard, value: data.standard }
          : "";
        const resolvedFrOffsetOperand = data?.frOffsetOperand
          ? { label: data.frOffsetOperand, value: data.frOffsetOperand }
          : "";
        const resolvedFrUnit = data?.frUnit
          ? { label: data.frUnit, value: data.frUnit }
          : "";
        const resolvedSource = data?.source
          ? { label: data.source, value: data.source }
          : { label: "Predicted", value: "Predicted" };

        serverSnapshot.current = {
          field: resolvedField,
          allocated: resolvedAllocated,
          dutyCycle: resolvedDutyCycle,
          frOffset: resolvedFrOffset,
          predicted: resolvedPredicted?.FR ? resolvedPredicted.FR : resolvedPredicted,
          otherFr: resolvedOtherFr,
          frRemarks: resolvedFrRemarks,
          frDistribution: resolvedFrDistribution,
          standard: resolvedStandard,
          frOffsetOperand: resolvedFrOffsetOperand,
          frUnit: resolvedFrUnit,
          source: resolvedSource,
        };

        setFrpId(data?.id);
        setField(resolvedField);
        setAllocated(resolvedAllocated);
        setDutyCycle(resolvedDutyCycle);
        setFrOffSet(resolvedFrOffset);
        setPredicted(resolvedPredicted);
        setFrDistribution(resolvedFrDistribution);
        setOtherFr(resolvedOtherFr);
        setFrRemarks(resolvedFrRemarks);
        setStandard(resolvedStandard);
        setOffSetOperand(resolvedFrOffsetOperand);
        setFrUnit(resolvedFrUnit);
        setSource(resolvedSource);
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };

  const loginSchema = Yup.object().shape({
    category: Yup.object().required("Category is  required"),
    name: Yup.string().required("Name is required"),
    partNumber: Yup.string().required("Part Number is  required"),
    quantity: Yup.string().required("Quantity is  required"),
    dutyCycle: Yup.string().required("Duty Cycle is  required"),
    partType: Yup.object().required("Part Type is required"),
    temperature: Yup.string().required("Temperature is  required"),
    frDistribution: Yup.object().required("FR Distribution is  required"),
    frRemarks: Yup.string().min(3, 'Minimum 3 characters required')
      .max(200, 'Maximum 200 characters allowed'),
    field:
      source.value === "Field"
        ? Yup.string().required("Field is Required")
        : Yup.object().nullable(),
    predicted:
      source.value === "Predicted"
        ? Yup.string().required("Predicted is Required")
        : Yup.object().nullable(),
    allocated:
      source.value === "Allocated"
        ? Yup.string().required("Allocated is Required")
        : Yup.object().nullable(),
    otherFr:
      source.value === "otherFr"
        ? Yup.string().required("OtherFr is Required")
        : Yup.object().nullable(),
  });

  const nprdSchema = Yup.object().shape({
    quality: Yup.string().required("Quality is required"),
    partTypeNprd: Yup.object().required(" Part type is required"),
    partTypeDescr: Yup.object().required("PartTypeDescr is required"),
    FR: Yup.string(),
  });

  const getFRPValue = (values) => {
    if (values.value == "Null") {
      const nprdFRPFiltered = nprdFRP.filter((item) => {
        return (
          item?.PartTypeId === partTypeNprd.value &&
          item?.PartDescrId === partTypeDescr.value
        );
      });
      setNprdFR(nprdFRPFiltered);
      setData(nprdFRPFiltered);
    } else {
      const nprdFRPFiltered = nprdFRP.filter((item) => {
        return (
          item?.PartTypeId === partTypeNprd.value &&
          item?.Quality === values.value &&
          item?.PartDescrId === partTypeDescr.value
        );
      });
      setNprdFR(nprdFRPFiltered);
      setData(nprdFRPFiltered);
    }
  };

  const getPartTypeNprdDesc2016Data = (values) => {
    Api.get("/api/v1/failureRatePrediction/get/nprd/2016/desc", {
      params: {
        partTypeId: values?.value,
      },
    }).then((res) => {
      setPartTypeNprdDesc2016Data(res?.data?.data);
    });
  };

  const getFRP2016Value = (values) => {
    if (values.value == "Null") {
      Api.get("/api/v1/failureRatePrediction/get/nprd/2016/value", {
        params: {
          partType2016Nprd: partType2016Nprd?.value,
          partDescrId: partType2016Descr?.value,
        },
      }).then((res) => {
        setNprdFR(res.data.data);
        setData(res.data.data);
      });
    } else {
      Api.get("/api/v1/failureRatePrediction/get/nprd/2016/value", {
        params: {
          partType2016Nprd: partType2016Nprd?.value,
          quality: values?.value,
          partDescrId: partType2016Descr?.value,
        },
      }).then((res) => {
        setNprdFR(res.data.data);
        setData(res.data.data);
      });
    }
  };

  const qualityOptions = [
    { value: "Unknown", label: "Unknown" },
    { value: "Commercial", label: "Commercial" },
    { value: "Military", label: "Military" },
    { value: "Industrial", label: "Industrial" },
    { value: "Null", label: "Null" },
  ];

  const updateFrpData = (values) => {
    setIsSaving(true);
    const companyId = user?.companyId;
    Api.patch("/api/v1/failureRatePrediction/update", {
      predicted: values.predicted,
      field: values.field,
      dutyCycle: values.dutyCycle,
      otherFr: values.otherFr,
      frDistribution: values.frDistribution.value,
      allocated: values.allocated,
      frRemarks: values.frRemarks,
      failureRateOffset: values.failureRate,
      frOffsetOperand: values.operand.value,
      standard: values.standard.value,
      quantity: values.quantity,
      frUnit: values.frUnit?.value ?? "",
      mtbfHours: mtbfResult ? mtbfResult : null,
      productId: productId,
      projectId: projectId,
      companyId: companyId,
      treeStructureId: treeStructure,
      frpId: frpId,
      userId: userId,
      source: values.source.value,
    })
      .then((response) => {
        setSuccessMessage(response.data.message);
        getProductFRPData().then(() => {
          NextPage();
          toast.success("FR Updated Successfully");
          setIsSaving(false);
        });
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
        setIsSaving(false);
      });
  };

  const submitForm = (values) => {
    setIsSaving(true);
    const companyId = user?.companyId;
    const standard = values?.standard?.value;
    Api.post("/api/v1/failureRatePrediction/", {
      predicted: values.predicted ? values.predicted : predicted,
      field: values.field,
      dutyCycle: values.dutyCycle,
      otherFr: values.otherFr,
      frDistribution: values.frDistribution.value,
      allocated: values.allocated,
      frRemarks: values.frRemarks,
      failureRateOffset: values.failureRate,
      frOffsetOperand: values.operand.value,
      standard: standard,
      quantity: values.quantity,
      productId: productId,
      projectId: projectId,
      companyId: companyId,
      mtbfHours: mtbfResult ? mtbfResult : null,
      treeStructureId: treeStructure,
      userId: userId,
      frUnit: values.frUnit?.value ?? "",
      source: values.source.value,
    })
      .then((response) => {
        setFrpId(response?.data?.data?.createFailureRatePrediction?.id);
        setSuccessMessage(response.data.message);
        getProductFRPData().then(() => {
          NextPage();
          toast.success("FR Created Successfully");
          setIsSaving(false);
        });
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
        setIsSaving(false);
      });
  };

  const NextPage = () => {
    setShow(true);
    setTimeout(() => {
      setShow(false);
    }, 2000);
  };

  const MIL_FR_UNIT = {
    value: "Failure Per Million Operating Hours",
    label: "Failure Per Million Operating Hours",
  };

  // ── FIX 1: When standard is MIL, lock FR unit to "Failure Per Million
  //           Operating Hours" and clear the Failure Rate Offset (since the
  //           unit is changing, any existing offset value would be mismatched).
  const handleStandardChange = (e, setFieldValue, values) => {
    if (e.value === "MIL") {
      setShowModal(true);
      setShowMil(true);
      setFieldValue("frUnit", MIL_FR_UNIT);
      setFrUnit(MIL_FR_UNIT);
    } else if (e.value === "NPRD11") {
      setNprdModel(true);
    } else if (e.value === "NPRD16") {
      setNprd2016Model(true);
    }
    setStandard(e);
    setPartTypeNprdDesc2016Data();
  };

  return (
    <Container className="mttr-main-div mx-1" style={{ marginTop: "90px" }}>
      {isLoading || !permissionsChecked ? (
        <Loader />
      ) : permission?.read === true ||
        permission?.read === undefined ||
        role === "admin" ||
        (isOwner === true && createdBy === userId) ? (
        <div>
          <Formik
            enableReinitialize={true}
            initialValues={{
              name: name,
              reference: reference,
              partNumber: partNumber,
              category: category,
              quantity: quantity,
              partType: partType,
              environment: environment,
              dutyCycle: dutyCycle,
              frDistribution: frDistribution,
              temperature: temperature,
              field: field,
              predicted: predicted?.FR ? predicted?.FR : predicted,
              otherFr: otherFr,
              allocated: allocated,
              frRemarks: frRemarks,
              standard: standard,
              failureRate: frOffset,
              operand: frOffsetOperand,
              frUnit: frUnit,
              source: source,
            }}
            validationSchema={loginSchema}
            onSubmit={(values) => {
              frpId ? updateFrpData(values) : submitForm(values);
            }}
          >
            {(formik) => {
              const {
                values,
                handleChange,
                handleSubmit,
                handleBlur,
                submitForm,
                setFieldValue,
                dirty: formikDirty,
              } = formik;

              const hasChanges = formikDirty || isExternalStateDirty();

              // ── FIX 1 (continued): derive disabled state for FR unit Select
              const isMilStandard = values.standard?.value === "MIL";

              return (
                <div>
                  <Form onSubmit={handleSubmit}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <div style={{ width: "30%", marginRight: "20px" }}>
                        <Projectname projectId={projectId} />
                      </div>
                      <div style={{ width: "100%", marginRight: "20px" }}>
                        <Dropdown
                          value={projectId}
                          productId={productId}
                          data={treeTableData}
                        />
                      </div>
                    </div>
                    <fieldset
                      disabled={
                        writePermission === true ||
                          writePermission === "undefined" ||
                          role === "admin" ||
                          (isOwner === true && createdBy === userId)
                          ? null
                          : "disabled"
                      }
                    >
                      <Row className="d-flex  mt-4">
                        <Col>
                          <div className="mttr-sec ">
                            <p className=" mb-0 para-tag">
                              General Information
                            </p>
                          </div>
                          <Card className="mt-2 px-4 py-4 mttr-card">
                            {isSpinning ? (
                              <Spinner
                                className="spinner"
                                animation="border"
                                variant="secondary"
                                centered
                              />
                            ) : (
                              <div>
                                <Row>
                                  <Col>
                                    <Label>Name</Label>
                                    <Form.Group>
                                      <Form.Control
                                        type="text"
                                        name="name"
                                        className="mt-1"
                                        placeholder="Name"
                                        value={values.name}
                                        disabled
                                        onBlur={handleBlur}
                                      />
                                      <ErrorMessage
                                        className="error text-danger"
                                        component="span"
                                        name="name"
                                      />
                                    </Form.Group>
                                  </Col>
                                  <Col>
                                    <Label notify={true}>Part Number</Label>
                                    <Form.Group>
                                      <Form.Control
                                        className="mt-1"
                                        type="tel"
                                        maxLength={10}
                                        name="partNumber"
                                        disabled
                                        placeholder="Part Number"
                                        onBlur={handleBlur}
                                        value={partNumber}
                                      />
                                      <ErrorMessage
                                        className="error text-danger"
                                        component="span"
                                        name="partNumber"
                                      />
                                    </Form.Group>
                                  </Col>
                                </Row>
                                <Row className="mt-3">
                                  <Col>
                                    <Label notify={true}>Quantity</Label>
                                    <Form.Group>
                                      <Form.Control
                                        className="mt-1"
                                        type="number"
                                        step="any"
                                        disabled
                                        min="0"
                                        name="quantity"
                                        placeholder="Quantity"
                                        value={quantity}
                                        onBlur={handleBlur}
                                      />
                                      <ErrorMessage
                                        className="error text-danger"
                                        component="span"
                                        name="quantity"
                                      />
                                    </Form.Group>
                                  </Col>
                                  <Col>
                                    <Label>Reference or Position</Label>
                                    <Form.Group>
                                      <Form.Control
                                        className="mt-1"
                                        type="text"
                                        disabled
                                        placeholder="Reference or Position"
                                        value={reference}
                                        name="reference"
                                        onBlur={handleBlur}
                                      />
                                      <ErrorMessage
                                        className="error text-danger"
                                        component="span"
                                        name="reference"
                                      />
                                    </Form.Group>
                                  </Col>
                                </Row>
                                <Row>
                                  <Col>
                                    <Form.Group className="mt-3">
                                      <Label notify="true">Category</Label>
                                      <Select
                                        styles={customStyles}
                                        type="select"
                                        value={values.category}
                                        placeholder="Select"
                                        name="category"
                                        isDisabled
                                        onBlur={handleBlur}
                                        className="mt-1"
                                        options={[
                                          {
                                            value: "Electronic",
                                            label: "Electronic",
                                          },
                                          {
                                            value: "Mechanical",
                                            label: "Mechanical",
                                          },
                                          {
                                            value: "Assembly",
                                            label: "Assembly",
                                          },
                                        ]}
                                      />
                                      <ErrorMessage
                                        className="error text-danger"
                                        component="span"
                                        name="category"
                                      />
                                    </Form.Group>
                                  </Col>
                                  <Col>
                                    {values.category?.value === "Mechanical" ||
                                      values.category?.value === "Electronic" ? (
                                      <div>
                                        <Form.Group className="mt-3">
                                          <Label notify={true}>Part Type</Label>
                                          <Select
                                            styles={customStyles}
                                            type="select"
                                            isDisabled
                                            value={values.partType}
                                            placeholder="Select Part Type"
                                            name="partType"
                                            onBlur={handleBlur}
                                            className="mt-1"
                                            options={[
                                              values.category?.value ===
                                                "Electronic"
                                                ? {
                                                  options: Electronic.map(
                                                    (list) => ({
                                                      value: list.value,
                                                      label: list.label,
                                                    })
                                                  ),
                                                }
                                                : {
                                                  options: Mechanical.map(
                                                    (list) => ({
                                                      value: list.value,
                                                      label: list.label,
                                                    })
                                                  ),
                                                },
                                            ]}
                                          />
                                          <ErrorMessage
                                            className="error text-danger"
                                            component="span"
                                            name="partType"
                                          />
                                        </Form.Group>
                                      </div>
                                    ) : null}
                                  </Col>
                                </Row>
                              </div>
                            )}
                          </Card>
                          <div className="mttr-sec mt-4 ">
                            <p className=" mb-0 para-tag">
                              Environment Profile and Temperature
                            </p>
                          </div>
                          <Card className=" mttr-card">
                            {isSpinning ? (
                              <Spinner
                                className="spinner_2"
                                animation="border"
                                variant="secondary"
                                centered
                              />
                            ) : (
                              <Row className="mx-3 my-4">
                                <Col>
                                  <Label notify={true}>Environment</Label>
                                  <Form.Group>
                                    <Select
                                      className="mt-1"
                                      name="environment"
                                      isDisabled
                                      styles={customStyles}
                                      placeholder="Select"
                                      options={[
                                        { value: null, label: "None" },
                                        {
                                          options: Environment.map((list) => ({
                                            value: list.value,
                                            label: list.label,
                                          })),
                                        },
                                      ]}
                                      type="select"
                                      value={environment}
                                      onBlur={handleBlur}
                                    />
                                    <ErrorMessage
                                      className="error text-danger"
                                      component="span"
                                      name="environment"
                                    />
                                  </Form.Group>
                                </Col>
                                <Col>
                                  <Label notify="true">Temperature</Label>
                                  <Form.Group>
                                    <Form.Control
                                      className="mt-1"
                                      type="number"
                                      min="0"
                                      step="any"
                                      disabled
                                      name="temperature"
                                      placeholder="Temperature"
                                      value={temperature}
                                      onBlur={handleBlur}
                                    />
                                    <ErrorMessage
                                      className="error text-danger"
                                      component="span"
                                      name="temperature"
                                    />
                                  </Form.Group>
                                </Col>
                              </Row>
                            )}
                          </Card>
                          <Row className="d-flex">
                            <Col>
                              <div className="mttr-sec mt-3 ">
                                <p className=" mb-0 para-tag">Failure Rate</p>
                              </div>
                              <Card className="mt-2 mttr-card p-4">
                                <Row className="mt-3">
                                  <Col className="mt-3">
                                    <Label notify="true">Source</Label>
                                    <Select
                                      type="select"
                                      className="mt-1"
                                      value={values.source}
                                      styles={customStyles}
                                      name="source"
                                      placeholder="Select"
                                      onBlur={handleBlur}
                                      onChange={(e) => {
                                        setFieldValue("source", e);
                                        setSource(e);
                                      }}
                                      options={[
                                        { value: "Predicted", label: "Predicted" },
                                        { value: "Field", label: "Field" },
                                        { value: "Allocated", label: "Allocated" },
                                        { value: "otherFr", label: "Other FR" },
                                      ]}
                                    />
                                  </Col>
                                  <Col className="mt-3">
                                    {values?.source?.value === "Field" ? (
                                      <div>
                                        <Label notify="true">Field</Label>
                                        <Form.Group>
                                          <Form.Control
                                            className="mt-1"
                                            name="field"
                                            type="number"
                                            min="0"
                                            step="any"
                                            placeholder="Field"
                                            onBlur={handleBlur}
                                            onChange={(e) => {
                                              setField(e.target.value);
                                              setFieldValue("field", e.target.value);
                                            }}
                                            value={values.field}
                                          />
                                          <ErrorMessage
                                            className="error text-danger"
                                            component="span"
                                            name="field"
                                          />
                                        </Form.Group>
                                      </div>
                                    ) : values?.source?.value === "Predicted" ? (
                                      <div>
                                        <Label notify="true">Predicted</Label>
                                        <Form.Group>
                                          <Form.Control
                                            className="mt-1"
                                            name="predicted"
                                            type="number"
                                            min="0"
                                            step="any"
                                            placeholder="Predicted"
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            value={values.predicted}
                                            disabled={true}
                                          />
                                          <ErrorMessage
                                            className="error text-danger"
                                            component="span"
                                            name="predicted"
                                          />
                                        </Form.Group>
                                      </div>
                                    ) : values?.source?.value === "Allocated" ? (
                                      <div>
                                        <Label notify="true">Allocated</Label>
                                        <Form.Group>
                                          <Form.Control
                                            className="mt-1"
                                            type="number"
                                            min="0"
                                            step="any"
                                            name="allocated"
                                            placeholder="Allocated"
                                            onBlur={handleBlur}
                                            onChange={(e) => {
                                              setAllocated(e.target.value);
                                              setFieldValue("allocated", e.target.value);
                                            }}
                                            value={values.allocated}
                                          />
                                          <ErrorMessage
                                            className="error text-danger"
                                            component="span"
                                            name="allocated"
                                          />
                                        </Form.Group>
                                      </div>
                                    ) : values?.source?.value === "otherFr" ? (
                                      <div>
                                        <Label notify="true">Other FR</Label>
                                        <Form.Group>
                                          <Form.Control
                                            className="mt-1"
                                            name="otherFr"
                                            type="number"
                                            step="any"
                                            min="0"
                                            placeholder="Other FR"
                                            value={values.otherFr}
                                            onBlur={handleBlur}
                                            onChange={(e) => {
                                              setOtherFr(e.target.value);
                                              setFieldValue("otherFr", e.target.value);
                                            }}
                                          />
                                          <ErrorMessage
                                            className="error text-danger"
                                            component="span"
                                            name="otherFr"
                                          />
                                        </Form.Group>
                                      </div>
                                    ) : null}
                                  </Col>
                                </Row>
                                <Row className="mt-3">
                                  <Col>
                                    <Label notify="true">Duty Cycle</Label>
                                    <Form.Group>
                                      <Form.Control
                                        className="mt-1"
                                        type="text"
                                        name="dutyCycle"
                                        placeholder="Duty Cycle"
                                        value={values.dutyCycle}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          const num = parseFloat(value);
                                          if (isNaN(num) || num < 0 || num > 1) {
                                            alert("Enter a value between 0 and 1");
                                            setDutyCycle('');
                                            setFieldValue("dutyCycle", '');
                                          } else {
                                            setDutyCycle(value);
                                            setFieldValue("dutyCycle", value);
                                          }
                                        }}
                                        onBlur={handleBlur}
                                      />
                                      <ErrorMessage
                                        className="error text-danger"
                                        component="span"
                                        name="dutyCycle"
                                      />
                                    </Form.Group>
                                  </Col>
                                  <Col>
                                    <Label notify="true">FR Distribution</Label>
                                    <Form.Group>
                                      <Select
                                        className="mt-1"
                                        type="select"
                                        name="frDistribution"
                                        styles={customStyles}
                                        placeholder="FR Distribution"
                                        onBlur={handleBlur}
                                        isDisabled={
                                          writePermission === true ||
                                            writePermission === "undefined" ||
                                            role === "admin" ||
                                            (isOwner === true && createdBy === userId)
                                            ? null
                                            : "disabled"
                                        }
                                        value={values.frDistribution}
                                        onChange={(e) => {
                                          setFrDistribution(e);
                                          setFieldValue("frDistribution", e);
                                        }}
                                        options={[
                                          { value: "Normal", label: "Normal" },
                                          { value: "Exponential", label: "Exponential" },
                                        ]}
                                      />
                                      <ErrorMessage
                                        className="error text-danger"
                                        component="span"
                                        name="frDistribution"
                                      />
                                    </Form.Group>
                                  </Col>
                                </Row>
                                <Row className="mt-3">
                                  <Col>
                                    <Label>FR Remarks</Label>
                                    <Form.Group>
                                      <Form.Control
                                        className="mt-1"
                                        type="text"
                                        name="frRemarks"
                                        placeholder="FR Remarks"
                                        onBlur={handleBlur}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          if (value.length <= 200) {
                                            setFrRemarks(value);
                                            setFieldValue("frRemarks", value);
                                          }
                                        }}
                                        value={values.frRemarks}
                                      />
                                      {values.frRemarks?.length > 200 && (
                                        <span className="text-danger">Maximum 200 characters allowed</span>
                                      )}
                                      <ErrorMessage className="error text-danger" component="span" name="frRemarks" />
                                    </Form.Group>
                                  </Col>
                                  <Col>
                                    <Label notify={true}>Standard</Label>
                                    <Form.Group>
                                      <Select
                                        className="mt-1"
                                        styles={customStyles}
                                        name="standard"
                                        type="select"
                                        placeholder="Select"
                                        isDisabled={
                                          writePermission === true ||
                                            writePermission === "undefined" ||
                                            role === "admin" ||
                                            (isOwner === true && createdBy === userId)
                                            ? null
                                            : "disabled"
                                        }
                                        value={standard}
                                        onBlur={handleBlur}
                                        onChange={(e) => handleStandardChange(e, setFieldValue, values)}
                                        options={[
                                          { value: "Select", label: "Select" },
                                          { value: "MIL", label: "MIL-HDBK-217F" },
                                          { value: "NPRD11", label: "NPRD 2011" },
                                          { value: "NPRD16", label: "NPRD 2016" },
                                        ]}
                                      />
                                    </Form.Group>
                                  </Col>
                                </Row>

                                <Row className="mt-3">
                                  <Col>
                                    <Label>FR Offset Operand</Label>
                                    <Form.Group>
                                      <Select
                                        className="mt-1"
                                        type="select"
                                        name="operand"
                                        styles={customStyles}
                                        isDisabled={
                                          writePermission === true ||
                                            writePermission === "undefined" ||
                                            role === "admin" ||
                                            (isOwner === true && createdBy === userId)
                                            ? null
                                            : "disabled"
                                        }
                                        placeholder="Select"
                                        onBlur={handleBlur}
                                        onChange={(e) => {
                                          setFieldValue("operand", e);
                                          setOffSetOperand(e);
                                        }}
                                        options={[
                                          { value: "+", label: "+" },
                                          { value: "-", label: "-" },
                                          { value: "*", label: "*" },
                                          { value: "/", label: "/" },
                                        ]}
                                        value={values.operand}
                                      />
                                    </Form.Group>
                                  </Col>
                                  <Col>
                                    <Label>Failure Rate Offset</Label>
                                    <Form.Group>
                                      <Form.Control
                                        className="mt-1"
                                        type="number"
                                        min="0"
                                        step="any"
                                        name="failureRate"
                                        placeholder="Failure Rate Offset"
                                        onBlur={handleBlur}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          // Keep React state in sync with every keystroke so that
                                          // Formik's enableReinitialize never reverts this field.
                                          // frOffset state feeds initialValues.failureRate; if it
                                          // lags behind what the user typed, any state change in
                                          // another field (dutyCycle, frDistribution, source …)
                                          // will trigger a reinitialize and wipe this input.
                                          setFrOffSet(value);
                                          setFieldValue("failureRate", value);
                                        }}
                                        value={values.failureRate}
                                      />
                                    </Form.Group>
                                  </Col>
                                </Row>

                                {/* ── Calculated (Read-only) ── */}
                                {(() => {
                                  const calc = calcItemMtbf({
                                    predicted: values.predicted,
                                    frUnit: values.frUnit?.value,
                                    offsetOperand: values.operand?.value,
                                    offsetValue: values.failureRate,
                                    dutyCycle: values.dutyCycle,
                                    quantity: values.quantity,
                                  });

                                  return (
                                    <Row className="mt-3">
                                      <Col md={12}>
                                        <div
                                          style={{
                                            padding: "14px 18px",
                                            border: "1px solid #b8daff",
                                            borderRadius: "8px",
                                            backgroundColor: "#f0f7ff",
                                          }}
                                        >
                                          <h6 style={{ marginBottom: "10px", fontWeight: 600, color: "#003d7a" }}>
                                            Calculated&nbsp;<span style={{ fontWeight: 400, fontSize: "0.8rem", color: "#666" }}>(Read-only)</span>
                                          </h6>

                                          {calc.error ? (
                                            <p style={{ color: "crimson", margin: 0, fontSize: "0.85rem" }}>
                                              {calc.error}
                                            </p>
                                          ) : (
                                            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "4px 16px", fontSize: "0.9rem" }}>
                                              <span style={{ color: "#555" }}>Final λ/hr:</span>
                                              <strong>
                                                {Number.isFinite(calc.lambdaHr)
                                                  ? calc.lambdaHr.toExponential(4)
                                                  : "—"}
                                              </strong>

                                              <span style={{ color: "#555" }}>Item λ (λ × Q × D):</span>
                                              <strong>
                                                {Number.isFinite(calc.lambdaItem)
                                                  ? calc.lambdaItem.toExponential(4)
                                                  : "—"}
                                              </strong>

                                              <span style={{ color: "#555" }}>Item MTBF:</span>
                                              <strong>
                                                {calc.mtbfHours == null
                                                  ? "—"
                                                  : `${Math.round(calc.mtbfHours).toLocaleString()} hours`}
                                              </strong>
                                            </div>
                                          )}
                                        </div>
                                      </Col>
                                    </Row>
                                  );
                                })()}

                                <Row>
                                  <Col>
                                    <Form.Group className="mt-3">
                                      <Label>FR unit</Label>
                                      {/* ── FIX 1: Disable FR unit selection when standard is MIL-HDBK-217F.
                                              The unit is locked to "Failure Per Million Operating Hours"
                                              in that case and must not be changed by the user.        ── */}
                                      <Select
                                        id="frUnit"
                                        name="frUnit"
                                        styles={customStyles}
                                        value={values.frUnit}
                                        // Locked when MIL standard is active
                                        isDisabled={isMilStandard}
                                        onChange={(event) => {
                                          setFieldValue("frUnit", event);
                                          setFrUnit(event);
                                        }}
                                        onBlur={handleBlur}
                                        options={FrUnit}
                                      />
                                      {/* Optional hint shown when the field is locked */}
                                      {isMilStandard && (
                                        <small className="text-muted">
                                          FR unit is fixed to "Failure Per Million Operating Hours" for MIL-HDBK-217F
                                        </small>
                                      )}
                                    </Form.Group>
                                  </Col>
                                  <Col></Col>
                                </Row>
                              </Card>

                              <div className="d-flex flex-direction-row justify-content-end  mt-4 mb-5">
                                <Button
                                  className="delete-cancel-btn  me-2"
                                  variant="outline-secondary"
                                  type="reset"
                                >
                                  CANCEL
                                </Button>
                                <Button
                                  className="save-btn "
                                  type="submit"
                                  disabled={!productId || isSaving || !hasChanges}
                                >
                                  {isSaving ? (
                                    <>
                                      <Spinner
                                        animation="border"
                                        size="sm"
                                        className="me-2"
                                      />
                                      UPDATING...
                                    </>
                                  ) : (
                                    "SAVE CHANGES"
                                  )}
                                </Button>

                                {/* ── NPRD 2011 Modal ── */}
                                <div>
                                  <Modal
                                    show={nprdModel}
                                    centered
                                    onHide={() => setNprdModel(!nprdModel)}
                                    size="xxl"
                                  >
                                    <Formik
                                      enableReinitialize
                                      initialValues={{
                                        partTypeNprd: partTypeNprd || "",
                                        quality: partTypeQuality || "",
                                        partTypeDescr: partTypeDescr || "",
                                        FR: FR || "",
                                      }}
                                      validationSchema={nprdSchema}
                                      onSubmit={(values, { resetForm }) => {
                                        if (partTypeNprd && partTypeDescr) {
                                          setNprdModel(false);
                                          toast.success("FR Selected");

                                          if (selectedNprdFR?.FR) {
                                            const roundedValue = parseFloat(selectedNprdFR.FR.toFixed(6));
                                            setPredicted(roundedValue);
                                            formik.setFieldValue("predicted", roundedValue);
                                          }
                                        }

                                        setPartTypeNprd();
                                        setPartTypeDescr();
                                        setPartTypeQuality();
                                        setFR();
                                        setRowClicked();
                                        setNprdModel(!nprdModel);
                                      }}
                                    >
                                      {(formik) => {
                                        const {
                                          values,
                                          handleChange,
                                          handleSubmit,
                                          handleBlur,
                                          isSubmitting,
                                          isValid,
                                          setFieldValue,
                                        } = formik;

                                        return (
                                          <form onSubmit={handleSubmit}
                                            className="d-flex justify-content-center align-items-center"
                                          >
                                            <div className="nprdmodal">
                                              <div className="d-flex justify-content-end m-1">
                                                <Modal.Header
                                                  closeButton
                                                  className="nprd-modal-header"
                                                  style={{
                                                    borderBottom: 0,
                                                    width: '90%',
                                                    padding: '1.5rem 2rem'
                                                  }}
                                                  onClick={() => {
                                                    setNprdModel(false);
                                                    setPartTypeNprd();
                                                    setPartTypeDescr();
                                                    setPartTypeQuality();
                                                    setFR();
                                                    setRowClicked();
                                                    setData();
                                                  }}
                                                />
                                              </div>
                                              <div className="mttr-sec1 mt-3">
                                                <p className="mb-0 para-tag">NPRD 2011</p>
                                              </div>
                                              <Card className="modal-card m-2">
                                                {isSpinning ? (
                                                  <Spinner
                                                    className="spinner_2"
                                                    animation="border"
                                                    variant="secondary"
                                                    centered
                                                  />
                                                ) : (
                                                  <div>
                                                    <Row className="mx-3 my-4">
                                                      <Col>
                                                        <Label notify={true}>Part Type</Label>
                                                        <Form.Group>
                                                          <Select
                                                            className="mt-1"
                                                            name="partTypeNprd"
                                                            type="select"
                                                            isSearchable={true}
                                                            placeholder="Select"
                                                            isDisabled={writePermission === true || writePermission === "undefined" || role === "admin" || (isOwner === true && createdBy === userId) ? null : "disabled"}
                                                            value={values.partTypeNprd}
                                                            onBlur={handleBlur}
                                                            onChange={(e) => {
                                                              setFieldValue("partTypeNprd", e);
                                                              setPartTypeNprd(e);
                                                              setPartTypeDescr();
                                                            }}
                                                            options={nprdPartType.map((list) => ({
                                                              value: list.PartTypeId,
                                                              label: list.PartType,
                                                            }))}
                                                          />
                                                          <ErrorMessage
                                                            className="error text-danger"
                                                            component="span"
                                                            name="partTypeNprd"
                                                          />
                                                        </Form.Group>
                                                      </Col>
                                                      {partTypeNprd ? (
                                                        <Col>
                                                          <Label notify={true}>Part Type Description</Label>
                                                          <Form.Group>
                                                            <Select
                                                              className="mt-1"
                                                              name="partTypeDescr"
                                                              type="select"
                                                              isSearchable={true}
                                                              placeholder="Select"
                                                              isDisabled={writePermission === true || writePermission === "undefined" || role === "admin" || (isOwner === true && createdBy === userId) ? null : "disabled"}
                                                              value={values.partTypeDescr}
                                                              onBlur={handleBlur}
                                                              onChange={(e) => {
                                                                setFieldValue("partTypeDescr", e);
                                                                setPartTypeDescr(e);
                                                              }}
                                                              options={nprdPartDes
                                                                .filter((item) => item?.PartTypeId === partTypeNprd?.value)
                                                                .map((item) => ({
                                                                  label: item?.PartDescrFull,
                                                                  value: item?.PartDescrId,
                                                                }))}
                                                            />
                                                            <ErrorMessage
                                                              className="error text-danger"
                                                              component="span"
                                                              name="partTypeDescr"
                                                            />
                                                          </Form.Group>
                                                        </Col>
                                                      ) : null}
                                                    </Row>
                                                    <Row className="mx-3 my-4">
                                                      <Col>
                                                        <Label notify="true">Quality</Label>
                                                        <Form.Group>
                                                          <Select
                                                            className="mt-1"
                                                            name="quality"
                                                            type="select"
                                                            placeholder="Select"
                                                            styles={customStyles}
                                                            value={
                                                              partTypeQuality
                                                                ? { label: partTypeQuality, value: partTypeQuality }
                                                                : values.quality
                                                            }
                                                            onBlur={handleBlur}
                                                            onChange={(e) => {
                                                              setFieldValue("quality", e.value);
                                                              setPartTypeQuality(e.value);
                                                              getFRPValue(e);
                                                            }}
                                                            options={qualityOptions}
                                                          />
                                                          <ErrorMessage
                                                            className="error text-danger"
                                                            component="span"
                                                            name="quality"
                                                          />
                                                        </Form.Group>
                                                      </Col>
                                                    </Row>
                                                    {partTypeNprd?.value && partTypeDescr?.value && !rowClicked ? (
                                                      <div className="mt-3 p-2">
                                                        <ThemeProvider theme={tableTheme}>
                                                          <MaterialTable
                                                            title="Manual Library Records"
                                                            columns={columns}
                                                            data={data}
                                                            icons={tableIcons}
                                                            options={{
                                                              actionsColumnIndex: -1,
                                                              addRowPosition: "last",
                                                              headerStyle: {
                                                                backgroundColor: "#cce6ff",
                                                                fontWeight: "bold",
                                                                zIndex: 0,
                                                              },
                                                              defaultExpanded: true,
                                                              rowStyle,
                                                            }}
                                                            onRowClick={(event, rowData) => {
                                                              setPredicted(rowData?.FR);
                                                              setSelectedNprdFR(rowData);
                                                              setPartTypeQuality(rowData?.Quality);
                                                              setPartTypeNprd({ label: rowData?.PartTypeTxt, value: rowData?.PartTypeId });
                                                              setPartTypeDescr({ label: rowData?.PartDescrFull, value: rowData?.PartDescrId });
                                                              setFR(rowData?.FR);
                                                            }}
                                                            localization={{
                                                              body: {
                                                                emptyDataSourceMessage:
                                                                  "No records to display for this partType and Environment Please Select Anyother partType",
                                                              },
                                                            }}
                                                          />
                                                        </ThemeProvider>
                                                      </div>
                                                    ) : null}
                                                  </div>
                                                )}
                                              </Card>
                                              <div className="d-flex flex-direction-row justify-content-end m-2">
                                                <Button
                                                  className="delete-cancel-btn me-2"
                                                  variant="outline-secondary"
                                                  type="button"
                                                  onClick={() => {
                                                    setPartTypeNprd();
                                                    setPartTypeDescr();
                                                    setPartTypeQuality();
                                                    setFR();
                                                    setRowClicked(false);
                                                    setData([]);
                                                    setSelectedCheckboxes([]);
                                                    setSelectedNprdFR(null);
                                                    setFieldValue("partTypeNprd", "");
                                                    setFieldValue("quality", "");
                                                    setFieldValue("partTypeDescr", "");
                                                    setFieldValue("FR", "");
                                                    setPredicted("");
                                                  }}
                                                >
                                                  CANCEL
                                                </Button>
                                                <Button
                                                  className="save-btn"
                                                  type="submit"
                                                  disabled={!isValid || selectedCheckboxes.length === 0 || isSubmitting}
                                                >
                                                  CALCULATE FR
                                                </Button>
                                              </div>
                                            </div>
                                          </form>
                                        );
                                      }}
                                    </Formik>
                                  </Modal>
                                </div>

                                {/* ── NPRD 2016 Modal ── */}
                                <div>
                                  <Modal
                                    show={nprd2016Model}
                                    centered
                                    onHide={() => setNprd2016Model(!nprd2016Model)}
                                    dialogClassName="custom-modal-width"
                                    size="xl"
                                  >
                                    <Formik
                                      enableReinitialize={true}
                                      initialValues={{
                                        partTypeNprd: partType2016Nprd || "",
                                        quality2016: partType2016Quality || "",
                                        partTypeDescr: partType2016Descr || "",
                                        FR: FR || "",
                                      }}
                                      validationSchema={nprd2016Schema}
                                      onSubmit={(values) => {
                                        if (values.partTypeNprd && values.partTypeDescr) {
                                          setNprd2016Model(false);
                                          toast.success("FR Selected");
                                        }
                                        setPartType2016Nprd();
                                        setPartType2016Descr();
                                        setPartType2016Quality();
                                        setFR();
                                        setRowClicked();
                                        setNprd2016Model(!nprd2016Model);
                                      }}
                                    >
                                      {(formik) => {
                                        const {
                                          values,
                                          handleChange,
                                          handleSubmit,
                                          handleBlur,
                                          isValid,
                                          setFieldValue,
                                        } = formik;
                                        return (
                                          <form
                                            onSubmit={handleSubmit}
                                            className="d-flex justify-content-center align-items-center"
                                          >
                                            <div className="nprdmodal">
                                              <div className="d-flex justify-content-end m-1">
                                                <Modal.Header
                                                  closeButton
                                                  style={{ borderBottom: 0 }}
                                                  onClick={() => {
                                                    setNprd2016Model(false);
                                                    setPartType2016Nprd();
                                                    setPartType2016Descr();
                                                    setPartType2016Quality();
                                                    setFR();
                                                    setRowClicked();
                                                    setData();
                                                  }}
                                                />
                                              </div>
                                              <div className="mttr-sec1 mt-3 ">
                                                <p className=" mb-0 para-tag">NPRD 2016</p>
                                              </div>
                                              <Card className="modal-card m-2">
                                                {isSpinning ? (
                                                  <Spinner
                                                    className="spinner_2"
                                                    animation="border"
                                                    variant="secondary"
                                                    centered
                                                  />
                                                ) : (
                                                  <div>
                                                    <Row className="mx-3 my-4">
                                                      <Col>
                                                        <Label notify={true}>Part Type</Label>
                                                        <Form.Group>
                                                          <Select
                                                            className="mt-1"
                                                            name="partTypeNprd"
                                                            type="select"
                                                            isSearchable={true}
                                                            placeholder="Select"
                                                            isDisabled={writePermission === true || writePermission === "undefined" || role === "admin" || (isOwner === true && createdBy === userId) ? null : "disabled"}
                                                            value={values.partTypeNprd}
                                                            onBlur={handleBlur}
                                                            onChange={(e) => {
                                                              setFieldValue("partTypeNprd", e);
                                                              setPartType2016Nprd(e);
                                                              setPartType2016Descr();
                                                              setPartTypeNprdDesc2016Data();
                                                              getPartTypeNprdDesc2016Data(e);
                                                            }}
                                                            options={partTypeNprd2016Data.map((list) => ({
                                                              value: list.PartTypeId,
                                                              label: list.PartType,
                                                            }))}
                                                          />
                                                          <ErrorMessage
                                                            name="partTypeNprd"
                                                            component="span"
                                                            className="error text-danger"
                                                          />
                                                        </Form.Group>
                                                      </Col>
                                                      {partType2016Nprd ? (
                                                        <Col>
                                                          <Label notify={true}>Part Type Description</Label>
                                                          <Form.Group>
                                                            <Select
                                                              className="mt-1"
                                                              name="partTypeDescr"
                                                              type="select"
                                                              isSearchable={true}
                                                              placeholder="Select"
                                                              isDisabled={writePermission === true || writePermission === "undefined" || role === "admin" || (isOwner === true && createdBy === userId) ? null : "disabled"}
                                                              value={values.partTypeDescr}
                                                              onBlur={handleBlur}
                                                              onChange={(e) => {
                                                                setFieldValue("partTypeDescr", e);
                                                                setPartType2016Descr(e);
                                                              }}
                                                              options={partTypeNprdDesc2016Data
                                                                ?.filter((item) => item?.PartTypeId === partType2016Nprd?.value)
                                                                .map((item) => ({
                                                                  label: item?.PartDescrFull,
                                                                  value: item?.PartDescrId,
                                                                }))}
                                                            />
                                                            <ErrorMessage
                                                              className="error text-danger"
                                                              component="span"
                                                              name="partTypeDescr"
                                                            />
                                                          </Form.Group>
                                                        </Col>
                                                      ) : null}
                                                    </Row>
                                                    <Row className="mx-3 my-4">
                                                      <Col>
                                                        <Label notify="true">Quality</Label>
                                                        <Form.Group>
                                                          <Select
                                                            className="mt-1"
                                                            name="quality2016"
                                                            type="select"
                                                            placeholder="Select"
                                                            styles={customStyles}
                                                            value={
                                                              partType2016Quality
                                                                ? { label: partType2016Quality, value: partType2016Quality }
                                                                : values.quality2016
                                                            }
                                                            onBlur={handleBlur}
                                                            onChange={(e) => {
                                                              setFieldValue("quality2016", e.value);
                                                              setPartType2016Quality(e.value);
                                                              getFRP2016Value(e);
                                                            }}
                                                            options={qualityOptions}
                                                          />
                                                          <ErrorMessage
                                                            className="error text-danger"
                                                            component="span"
                                                            name="quality2016"
                                                          />
                                                        </Form.Group>
                                                      </Col>
                                                    </Row>
                                                    {partType2016Nprd?.value && partType2016Descr?.value && !rowClicked ? (
                                                      <div className="mt-3 p-2">
                                                        <ThemeProvider theme={tableTheme}>
                                                          <MaterialTable
                                                            title="Manual Library Records"
                                                            columns={columns}
                                                            data={data}
                                                            icons={tableIcons}
                                                            options={{
                                                              actionsColumnIndex: -1,
                                                              addRowPosition: "last",
                                                              headerStyle: {
                                                                backgroundColor: "#cce6ff",
                                                                fontWeight: "bold",
                                                                zIndex: 0,
                                                              },
                                                              defaultExpanded: true,
                                                              rowStyle,
                                                            }}
                                                            onRowClick={(event, rowData) => {
                                                              setPredicted(rowData?.FR);
                                                              setSelectedNprdFR(rowData);
                                                              setPartType2016Quality(rowData?.Quality);
                                                              setPartType2016Nprd({ label: rowData?.PartTypeTxt, value: rowData?.PartTypeId });
                                                              setPartType2016Descr({ label: rowData?.PartDescrFull, value: rowData?.PartDescrId });
                                                              setFR(rowData?.FR);
                                                            }}
                                                            localization={{
                                                              body: {
                                                                emptyDataSourceMessage:
                                                                  "No records to display for this partType and Environment Please Select Anyother partType",
                                                              },
                                                            }}
                                                          />
                                                        </ThemeProvider>
                                                      </div>
                                                    ) : null}
                                                  </div>
                                                )}
                                              </Card>
                                              <div className="d-flex flex-direction-row justify-content-end m-2">
                                                <Button
                                                  className="delete-cancel-btn me-2"
                                                  variant="outline-secondary"
                                                  type="button"
                                                  onClick={() => {
                                                    setPartType2016Nprd();
                                                    setPartType2016Descr();
                                                    setPartType2016Quality();
                                                    setFR();
                                                    setRowClicked(false);
                                                    setData([]);
                                                    setSelectedCheckboxes([]);
                                                    setSelectedNprdFR(null);
                                                    setFieldValue("partTypeNprd", "");
                                                    setFieldValue("quality2016", "");
                                                    setFieldValue("partTypeDescr", "");
                                                    setFieldValue("FR", "");
                                                    setPredicted("");
                                                  }}
                                                >
                                                  CANCEL
                                                </Button>
                                                <Button
                                                  className="save-btn"
                                                  type="submit"
                                                  disabled={!isValid || selectedCheckboxes.length === 0}
                                                >
                                                  CALCULATE FR
                                                </Button>
                                              </div>
                                            </div>
                                          </form>
                                        );
                                      }}
                                    </Formik>
                                  </Modal>

                                  {/* ── MIL-HDBK-217F Modal ── */}
                                  <Modal
                                    show={showModal}
                                    onHide={() => setShowModal(false)}
                                    centered
                                    size="xl"
                                    dialogClassName="extra-wide-modal"
                                    backdrop="static"
                                    style={{ maxWidth: "none" }}
                                  >
                                    <Modal.Body className="p-0">
                                      <div className="modal-content" style={{ width: "100%", maxWidth: "1200px" }}>
                                        <div className="text-center mt-1">
                                          <h3 className="modal-title ">
                                            <strong>MIL-HDBK-217F</strong>
                                          </h3>
                                          <FontAwesomeIcon
                                            icon={faCircleXmark}
                                            fontSize={"40px"}
                                            color="#1D5460"
                                            onClick={() => {
                                              const savedResult = localStorage.getItem("milValue");
                                              if (savedResult) {
                                                let result = JSON.parse(savedResult);
                                                result = Math.floor(result * 1000000) / 1000000;
                                                setPredicted(result);
                                                formik.setFieldValue("predicted", result);
                                              }
                                              setShowModal(false);
                                            }}
                                            className="close-icon"
                                          />
                                        </div>

                                        <div className="classical-group mb-2">
                                          <div className="form-group">
                                            <label>
                                              <strong>Component Type:</strong>
                                            </label>
                                            <Select
                                              styles={{
                                                ...customStyles,
                                                control: (base) => ({
                                                  ...base,
                                                  minHeight: "50px",
                                                  fontSize: "1rem",
                                                }),
                                              }}
                                              name="type"
                                              placeholder="Select component type..."
                                              value={
                                                currentComponent.type
                                                  ? { value: currentComponent.type, label: currentComponent.type }
                                                  : null
                                              }
                                              onChange={(selectedOption) => {
                                                localStorage.removeItem("milValue");
                                                setCurrentComponent({ ...currentComponent, type: selectedOption.value });
                                              }}
                                              options={[
                                                { value: "Capacitor", label: "Capacitor" },
                                                { value: "Connections", label: "Connections" },
                                                { value: "Connectors", label: "Connectors" },
                                                { value: "Discrete Semiconductor", label: "Discrete Semiconductor" },
                                                { value: "Electronic Filters", label: "Electronic Filters" },
                                                { value: "Fuses", label: "Fuses" },
                                                { value: "Interconnection", label: "Interconnection" },
                                                { value: "Inductive", label: "Inductive" },
                                                { value: "Lamps", label: "Lamps" },
                                                { value: "Laser", label: "Laser" },
                                                { value: "Meters", label: "Meters" },
                                                { value: "Microcircuits", label: "Microcircuits" },
                                                { value: "Miscellaneous", label: "Miscellaneous" },
                                                { value: "Quartz", label: "Quartz" },
                                                { value: "Resistor", label: "Resistor" },
                                                { value: "Relay", label: "Relay" },
                                                { value: "Rotating Device", label: "Rotating Device" },
                                                { value: "Switches", label: "Switches" },
                                                { value: "Tubes", label: "Tubes" },
                                              ]}
                                              className="mt-2"
                                            />
                                          </div>

                                          <div className="component-container mt-4">
                                            {currentComponent.type === "Microcircuits" && (
                                              <MicrocircuitsCalculation
                                                onCalculate={(value) => {
                                                  const numberValue = parseFloat(value);
                                                  const roundedValue = !isNaN(numberValue) ? parseFloat(numberValue.toFixed(6)) : 0;
                                                  setPredicted(roundedValue);
                                                  formik.setFieldValue("predicted", roundedValue);
                                                }}
                                              />
                                            )}
                                            {currentComponent.type === "Relay" && (
                                              <Relay
                                                onCalculate={(value) => {
                                                  const roundedValue = Math.floor(value * 1000000) / 1000000;
                                                  setPredicted(roundedValue);
                                                  formik.setFieldValue("predicted", roundedValue);
                                                }}
                                              />
                                            )}
                                            {currentComponent.type === "Rotating Device" && (
                                              <RotatingDevice
                                                onCalculate={(value) => {
                                                  const roundedValue = Math.floor(value * 1000000) / 1000000;
                                                  setPredicted(roundedValue);
                                                  formik.setFieldValue("predicted", roundedValue);
                                                }}
                                              />
                                            )}
                                            {currentComponent.type === "Switches" && (
                                              <Switches
                                                onCalculate={(value) => {
                                                  const roundedValue = Math.floor(value * 1000000) / 1000000;
                                                  setPredicted(roundedValue);
                                                  formik.setFieldValue("predicted", roundedValue);
                                                }}
                                              />
                                            )}
                                            {currentComponent.type === "Resistor" && <ResistorCalculation />}
                                            {currentComponent.type === "Capacitor" && (
                                              <CapacitorCalculation
                                                onCalculate={(failureRate) => {
                                                  const roundedValue = parseFloat(failureRate.toFixed(6));
                                                  setPredicted(roundedValue);
                                                  formik.setFieldValue("predicted", roundedValue);
                                                }}
                                              />
                                            )}
                                            {currentComponent.type === "Inductive" && (
                                              <InductiveCalculation
                                                onCalculate={(value) => {
                                                  const roundedValue = Math.floor(value * 1000000) / 1000000;
                                                  setPredicted(roundedValue);
                                                  formik.setFieldValue("predicted", roundedValue);
                                                }}
                                              />
                                            )}
                                            {currentComponent.type === "Connections" && (
                                              <ConnectionCalculation
                                                onCalculate={(failureRate) => {
                                                  const roundedValue = parseFloat(failureRate.toFixed(6));
                                                  setPredicted(roundedValue);
                                                  formik.setFieldValue("predicted", roundedValue);
                                                }}
                                              />
                                            )}
                                            {currentComponent.type === "Lamps" && (
                                              <Lamps
                                                onCalculate={(failureRate) => {
                                                  if (failureRate !== null) {
                                                    const roundedValue = Math.floor(failureRate * 1000000) / 1000000;
                                                    setPredicted(roundedValue);
                                                    formik.setFieldValue("predicted", roundedValue);
                                                  }
                                                }}
                                              />
                                            )}
                                            {currentComponent.type === "Quartz" && (
                                              <Quartz
                                                onCalculate={(value) => {
                                                  if (value !== null) {
                                                    const roundedValue = Math.floor(value * 1000000) / 1000000;
                                                    setPredicted(roundedValue);
                                                    formik.setFieldValue("predicted", roundedValue);
                                                  }
                                                }}
                                              />
                                            )}
                                            {currentComponent.type === "Laser" && (
                                              <Laser
                                                onCalculate={(value) => {
                                                  const roundedValue = Math.floor(value * 1000000) / 1000000;
                                                  setPredicted(roundedValue);
                                                  formik.setFieldValue("predicted", roundedValue);
                                                }}
                                              />
                                            )}
                                            {currentComponent.type === "Electronic Filters" && (
                                              <ElectronicFilters
                                                onCalculate={(value) => {
                                                  const roundedValue = Math.floor(value * 1000000) / 1000000;
                                                  setPredicted(roundedValue);
                                                  formik.setFieldValue("predicted", roundedValue);
                                                }}
                                              />
                                            )}
                                            {currentComponent.type === "Fuses" && (
                                              <Fuses
                                                onCalculate={(failureRate) => {
                                                  if (failureRate !== null) {
                                                    const roundedValue = Math.floor(failureRate * 1000000) / 1000000;
                                                    setPredicted(roundedValue);
                                                    formik.setFieldValue("predicted", roundedValue);
                                                  }
                                                }}
                                              />
                                            )}
                                            {currentComponent.type === "Meters" && (
                                              <Meters
                                                onCalculate={(value) => {
                                                  if (value !== null) {
                                                    const roundedValue = Math.floor(value * 1000000) / 1000000;
                                                    setPredicted(roundedValue);
                                                    formik.setFieldValue("predicted", roundedValue);
                                                  }
                                                }}
                                              />
                                            )}
                                            {currentComponent.type === "Connectors" && (
                                              <Connectors
                                                onCalculate={(value) => {
                                                  const roundedValue = parseFloat(value.toFixed(6));
                                                  setPredicted(roundedValue);
                                                  formik.setFieldValue("predicted", roundedValue);
                                                }}
                                              />
                                            )}
                                            {currentComponent.type === "Discrete Semiconductor" && (
                                              <Diode
                                                onCalculate={(value) => {
                                                  const roundedValue = parseFloat(value.toFixed(6));
                                                  setPredicted(roundedValue);
                                                  formik.setFieldValue("predicted", roundedValue);
                                                }}
                                              />
                                            )}
                                            {currentComponent.type === "Tubes" && (
                                              <Tubes
                                                onCalculate={(value) => {
                                                  const roundedValue = parseFloat(value.toFixed(6));
                                                  setPredicted(roundedValue);
                                                  formik.setFieldValue("predicted", roundedValue);
                                                }}
                                              />
                                            )}
                                            {currentComponent.type === "Interconnection" && (
                                              <Interconnection
                                                onCalculate={(value) => {
                                                  const roundedValue = parseFloat(value.toFixed(6));
                                                  setPredicted(roundedValue);
                                                  formik.setFieldValue("predicted", roundedValue);
                                                }}
                                              />
                                            )}
                                            {currentComponent.type === "Miscellaneous" && (
                                              <MiscellaneousPartsCalculator
                                                onCalculate={(value) => {
                                                  const roundedValue = parseFloat(value.toFixed(6));
                                                  setPredicted(roundedValue);
                                                  formik.setFieldValue("predicted", roundedValue);
                                                }}
                                              />
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </Modal.Body>
                                  </Modal>
                                </div>
                              </div>
                            </Col>
                          </Row>
                        </Col>
                      </Row>
                    </fieldset>
                  </Form>
                </div>
              );
            }}
          </Formik>
        </div>
      ) : (
        <div>
          <Card>
            <Card.Body>
              <Card.Title className="text-center">Access Denied</Card.Title>
              <Card.Text>
                <p className="text-center">
                  You dont have permission to access these sections
                  <br />
                  Contact admin to get permission or go back to project list page
                </p>
              </Card.Text>
              <Button
                variant="primary"
                className="save-btn fw-bold pbs-button-1"
                onClick={history.goBack}
              >
                Go Back
              </Button>
            </Card.Body>
          </Card>
        </div>
      )}
    </Container>
  );
}

export default Index;