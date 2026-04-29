import React, { useEffect, useState } from "react";
import { Button, Col, Form, Row, Card, Modal } from "react-bootstrap";
import Label from "../LabelComponent";
import "../../css/MttrPrediction.scss";
import Select from "react-select";
import { ErrorMessage, Formik } from "formik";
import "../../css/FMECA.scss";
import * as Yup from "yup";
import Api from "../../Api";
import Dropdown from "../Company/Dropdown";
import Spinner from "react-bootstrap/esm/Spinner";
import Loader from "../core/Loader";
import Projectname from "../Company/projectname";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { customStyles } from "../core/select";
import { useHistory } from "react-router-dom";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import { Tooltip } from "@material-ui/core";
import {
  faFileDownload,
  faFileUpload,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../context/AuthContext";


function Index(props) {
  const { user } = useAuth();
  const projectId = props?.location?.state?.projectId
    ? props?.location?.state?.projectId
    : props?.match?.params?.id;

  const treeStructureId = props?.location?.state?.parentId;
  const [treeId, setTreeId] = useState(null);
  const [show, setShow] = useState(false);
  const [treeTableData, setTreeTabledata] = useState([]);
  const [spare, setSpare] = useState("");
  const [warrantySpare, setWarrantySpare] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [prefillData, setPrefillData] = useState([]);
  const [spareId, setspareId] = useState();
  const [writePermission, setWritePermission] = useState();
  const role = user?.role;
  const [initialProductID, setInitialProductID] = useState();
  const productId = props?.location?.props?.data?.id
    ? props?.location?.props?.data?.id
    : props?.location?.state?.productId
      ? props?.location?.state?.productId
      : initialProductID;
  const history = useHistory();
  const userId = user?._id;
  const [isOwner, setIsOwner] = useState(false);
  const [createdBy, setCreatedBy] = useState();
  const [recommendedSpareQuantity, setRecommendedSpareQuantity] = useState();
  const [calculatedSpareQuantity, setCalculatedSpareQuantity] = useState();
  const [hasImportedData, setHasImportedData] = useState(false);
  const [productName, setProductName] = useState();
  const [importExcelData, setImportExcelData] = useState({});
  const [shouldReload, setShouldReload] = useState(false);

  const loginSchema = Yup.object().shape({
    spare: Yup.object().required("Spare is required"),
    warrantySpare: Yup.object().required("Warranty is required"),
    recommendedSpare: Yup.object().required("Recommended is required"),
    deliveryTimeDays: Yup.number().required("Delivery time required"),
    annualPrice: Yup.string()
      .nullable()
      .notRequired()
      .matches(
        /^(100(\.0+)?|(\d{1,2}(\.\d+)?))%$/,
        "Enter a valid percentage (e.g. 25%, 50.5%, 99.99%)"
      ),
  });

  const importExcel = (e) => {
    const file = e.target.files[0];

    const fileName = file.name;
    const validExtensions = ["xlsx", "xls"];
    const fileExtension = fileName.split(".").pop().toLowerCase();

    if (!validExtensions.includes(fileExtension)) {
      toast.error("Please upload a valid Excel file (either .xlsx or .xls)!", {
        position: "top-right",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const bstr = event.target.result;
      const workBook = XLSX.read(bstr, { type: "binary" });

      const workSheetName = workBook.SheetNames[0];
      const workSheet = workBook.Sheets[workSheetName];

      const excelData = XLSX.utils.sheet_to_json(workSheet, { header: 1 });
      if (excelData.length > 1) {
        const headers = excelData[0];
        const rows = excelData.slice(1);
        const parsedData = rows.map((row) => {
          const rowData = {};
          headers.forEach((header, index) => {
            rowData[header] = row[index];
          });
          return rowData;
        });

        setHasImportedData(true);
        setImportExcelData(parsedData[0]);
      } else {
        toast.error("No Data Found In Excel Sheet", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      }
    };
    if (file) {
      reader.readAsBinaryString(file);
    }
  };

  const createSpareAnalysisDataFromExcel = (values) => {
    setIsLoading(true);

    const companyId = user?.companyId;

    Api.patch("api/v1/sparePartsAnalysis/update", {
      spare: spare,
      warrantySpare: warrantySpare,
      deliveryTimeDays: values.deliveryTimeDays,
      afterSerialProductionPrice1: values.afterSerialProductionPrice1,
      price1MOQ: values.moq_1Price,
      afterSerialProductionPrice2: values.afterSerialProductionPrice2,
      price2MOQ: values.moq_2Price,
      afterSerialProductionPrice3: values.afterSerialProductionPrice3,
      price3MOQ: values.moq_3Price,
      annualPriceEscalationPercentage: formatPercentage(values.annualPrice),
      lccPriceValidity: values.lccPriceValidity,
      recommendedSpareQuantity: values.recommendedSpareQuantity,
      calculatedSpareQuantity: values.calculatedSpareQuantity,
      projectId: projectId,
      companyId: companyId,
      productId: productId,
      spareId: spareId,
      userId: userId,
    }).then((response) => {
      setIsLoading(false);
      const status = response?.status;
      if (status === 204) {
        // handle 204 if needed
      }
      setIsLoading(false);
    });
  };

  const exportToExcel = (value) => {
    const originalData = {
      CompanyName: treeTableData[0]?.companyId?.companyName,
      ProjectName: treeTableData[0]?.projectId?.projectName,
      productName: value.productName,
      Delivery_Days: value.deliveryTimeDays,
      Serial_Production_Price1: value.afterSerialProductionPrice1,
      Moq_Price_1: value.moq_1Price,
      Moq_Price_3: value.moq_3Price,
      Serial_Production_Price3: value.afterSerialProductionPrice3,
      Serial_Production_Price2: value.afterSerialProductionPrice2,
      Annual_Price: value.annualPrice,
      Moq_Price_2: value.moq_2Price,
      Lcc_Price_Validity: value.lccPriceValidity,
      Recomm_Spare_Quantity: value.recommendedSpareQuantity,
      Calc_Spare_Qty: value.calculatedSpareQuantity,
      warrantySpare: value.warrantySpare?.value || value.warrantySpare || "",
      Spare: value.spare?.value || value.spare || "",
      recommendedSpare:
        value.recommendedSpare?.value || value.recommendedSpare || "",
    };

    const hasData = Object.values(originalData).some(
      (val) => val !== null && val !== undefined && val.toString().trim() !== ""
    );

    if (hasData) {
      const dataArray = [];
      dataArray.push(originalData);
      const ws = XLSX?.utils?.json_to_sheet(dataArray);
      const wb = XLSX.utils?.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "FormData");

      XLSX.writeFile(wb, `${productName}_Spare_Parts_Input.xlsx`);

      toast.success("File exported successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } else {
      toast.error("Export Failed !! No Data Found", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  useEffect(() => {
    if (productId) {
      setIsLoading(true);
      getTreedata();
      productTreeData();
    }
  }, [productId]);

  const logout = () => {
    localStorage.clear(history.push("/login"));
    window.location.reload();
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

  const handleCancelClick = () => {
    const shouldReloadPage = true;

    if (shouldReloadPage) {
      setShouldReload(true);
    } else {
      //setOpen(false);
    }
  };

  if (shouldReload) {
    window.location.reload();
  }

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

        const module = modules.find(m => m.name === "Spare Part Analysis"); // index 9

        setWritePermission(module?.write);
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };

  useEffect(() => {
    getProjectPermission();
    projectSidebar();
  }, [projectId]);

  const productTreeData = () => {
    Api.get("/api/v1/productTreeStructure/get/tree/product/list", {
      params: {
        projectId: projectId,
        treeStructureId: productId,
        userId: userId,
      },
    })
      .then((res) => {
        const data = res?.data?.data;
        setProductName(data.productName);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };

  const getTreedata = () => {
    Api.get(`/api/v1/productTreeStructure/list`, {
      params: {
        projectId: projectId,
        userId: userId,
      },
    })
      .then((res) => {
        const treeData = res?.data?.data;
        const treeStructureId = res?.data?.data[0]?.id;
        setIsLoading(false);
        setTreeId(treeStructureId);
        setTreeTabledata(treeData);
        setInitialProductID(res?.data?.data[0]?.treeStructure?.id);
        getProductDatas(treeStructureId);
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };

  // Returns a promise so callers can await it
  const getProductDatas = (currentTreeId) => {
    const companyId = user?.companyId;

    return Api.get("/api/v1/sparePartsAnalysis/details", {
      params: {
        projectId: projectId,
        productId: productId,
        companyId: companyId,
        treeStructureId: treeStructureId ? treeStructureId : currentTreeId,
        userId: userId,
      },
    })
      .then((res) => {
        const data = res?.data?.data;

        setRecommendedSpareQuantity(
          data?.recommendedSpareQuantity ? data?.recommendedSpareQuantity : ""
        );
        setCalculatedSpareQuantity(
          res?.data?.CalculatedSpareQuantity !== null &&
            res?.data?.CalculatedSpareQuantity !== undefined
            ? res?.data?.CalculatedSpareQuantity
            : ""
        );
        setPrefillData(data ? data : "");
        setspareId(data?.id);

        // After a save/update, clear imported data so form
        // re-renders from the fresh server response
        setHasImportedData(false);
        setImportExcelData({});
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };

  const SparePartsAnalysisUpdate = async (values) => {
    const companyId = user?.companyId;

    const response = await Api.patch("api/v1/sparePartsAnalysis/update", {
      spare: values?.spare?.value,
      recommendedSpare: values?.recommendedSpare?.value,
      warrantySpare: values?.warrantySpare?.value,
      deliveryTimeDays: values.deliveryTimeDays,
      afterSerialProductionPrice1: values.afterSerialProductionPrice1,
      price1MOQ: values.moq_1Price,
      afterSerialProductionPrice2: values.afterSerialProductionPrice2,
      price2MOQ: values.moq_2Price,
      afterSerialProductionPrice3: values.afterSerialProductionPrice3,
      price3MOQ: values.moq_3Price,
      annualPriceEscalationPercentage: formatPercentage(values.annualPrice),
      lccPriceValidity: values.lccPriceValidity,
      recommendedSpareQuantity: values.recommendedSpareQuantity,
      calculatedSpareQuantity: values.calculatedSpareQuantity,
      projectId,
      companyId,
      productId,
      spareId,
      userId,
    });

    console.log("Updated Data:", response?.data?.editDetail);
    toast.success("Updated Successfully");

    // Refresh form state with latest data from server
    await getProductDatas(treeId);
  };

  const submitForm = async (values) => {
    const companyId = user?.companyId;

    const response = await Api.post("api/v1/sparePartsAnalysis", {
      companyId,
      projectId,
      productId,
      spare: values?.spare?.value,
      recommendedSpare: values?.recommendedSpare?.value,
      warrantySpare: values?.warrantySpare?.value,
      deliveryTimeDays: values.deliveryTimeDays,
      afterSerialProductionPrice1: values.afterSerialProductionPrice1,
      afterSerialProductionPrice2: values.afterSerialProductionPrice2,
      afterSerialProductionPrice3: values.afterSerialProductionPrice3,
      price1MOQ: values.moq_1Price,
      price2MOQ: values.moq_2Price,
      price3MOQ: values.moq_3Price,
      annualPriceEscalationPercentage: formatPercentage(values.annualPrice),
      lccPriceValidity: values.lccPriceValidity,
      recommendedSpareQuantity: values.recommendedSpareQuantity,
      calculatedSpareQuantity: values.calculatedSpareQuantity,
      userId,
    });

    console.log("Created Data:", response?.data?.data?.createData);
    toast.success("Saved Successfully");

    // Refresh form state with latest data from server
    await getProductDatas(treeId);
  };



  const formatPercentage = (value) => {
    if (value === null || value === undefined || value === "") return "";

    if (typeof value === "string" && value.trim().endsWith("%")) {
      return value.trim();
    }

    const num = Number(value);

    // Excel percentage case: 0.23 → 23%
    if (!isNaN(num) && num > 0 && num <= 1) {
      return `${(num * 100).toString()}%`;
    }

    // Normal number case: 23 → 23%
    if (!isNaN(num)) {
      return `${num}%`;
    }

    return "";
  };

  return (
    <div className=" mx-4" style={{ marginTop: "90px" }}>
      {isLoading ? (
        <Loader />
      ) : (
        <Formik
          enableReinitialize={true}
          initialValues={{
            productName: productName,
            spare:
              hasImportedData && importExcelData?.Spare
                ? { label: importExcelData?.Spare, value: importExcelData?.Spare }
                : prefillData?.spare
                  ? { label: prefillData?.spare, value: prefillData?.spare }
                  : "",

            warrantySpare:
              hasImportedData && importExcelData?.warrantySpare
                ? { label: importExcelData?.warrantySpare, value: importExcelData?.warrantySpare }
                : prefillData?.warrantySpare
                  ? { label: prefillData?.warrantySpare, value: prefillData?.warrantySpare }
                  : "",

            recommendedSpare:
              hasImportedData && importExcelData?.recommendedSpare
                ? { label: importExcelData?.recommendedSpare, value: importExcelData?.recommendedSpare }
                : prefillData?.recommendedSpare
                  ? { label: prefillData?.recommendedSpare, value: prefillData?.recommendedSpare }
                  : "",

            deliveryTimeDays: hasImportedData
              ? importExcelData?.Delivery_Days || ""
              : prefillData?.deliveryTimeDays || "",

            lccPriceValidity: hasImportedData
              ? importExcelData?.Lcc_Price_Validity || ""
              : prefillData?.lccPriceValidity || "",

            afterSerialProductionPrice1: hasImportedData
              ? importExcelData?.Serial_Production_Price1 || ""
              : prefillData?.afterSerialProductionPrice1 || "",

            afterSerialProductionPrice2: hasImportedData
              ? importExcelData?.Serial_Production_Price2 || ""
              : prefillData?.afterSerialProductionPrice2 || "",

            afterSerialProductionPrice3: hasImportedData
              ? importExcelData?.Serial_Production_Price3 || ""
              : prefillData?.afterSerialProductionPrice3 || "",

            moq_1Price: hasImportedData
              ? importExcelData?.Moq_Price_1 || ""
              : prefillData?.price1MOQ || "",

            moq_2Price: hasImportedData
              ? importExcelData?.Moq_Price_2 || ""
              : prefillData?.price2MOQ || "",

            moq_3Price: hasImportedData
              ? importExcelData?.Moq_Price_3 || ""
              : prefillData?.price3MOQ || "",

            annualPrice: hasImportedData
              ? formatPercentage(importExcelData?.Annual_Price)
              : formatPercentage(prefillData?.annualPriceEscalationPercentage),

            calculatedSpareQuantity: hasImportedData
              ? importExcelData?.Calc_Spare_Qty || ""
              : calculatedSpareQuantity !== null &&
                calculatedSpareQuantity !== undefined
                ? calculatedSpareQuantity
                : "",

            recommendedSpareQuantity: hasImportedData
              ? importExcelData?.Recomm_Spare_Quantity || ""
              : recommendedSpareQuantity || "",
          }}
          validationSchema={loginSchema}
          onSubmit={async (values, actions) => {
            setIsLoading(true);
            actions.setSubmitting(true);

            try {
              if (spareId) {
                await SparePartsAnalysisUpdate(values);
              } else {
                await submitForm(values);
              }
            } catch (error) {
              toast.error("Something went wrong");
            } finally {
              // Loading turns off only after getProductDatas has completed
              setIsLoading(false);
              actions.setSubmitting(false);
            }
          }}
        >
          {(formik) => {
            const {
              values,
              handleChange,
              handleSubmit,
              handleBlur,
              isValid,
              submitForm,
              setFieldValue,
            } = formik;
            return (
              <div>
                <Form onSubmit={handleSubmit}>
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

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          alignItems: "center",
                          marginTop: "8px",
                          height: "40px",
                        }}
                      >
                        <Tooltip placement="right" title="Import">
                          <div style={{ marginRight: "8px" }}>
                            <label
                              htmlFor="file-input"
                              className="import-export-btn"
                              style={{
                                cursor:
                                  writePermission === false
                                    ? "not-allowed"
                                    : "pointer",
                                opacity: writePermission === false ? 0.5 : 1,
                              }}
                            >
                              <FontAwesomeIcon icon={faFileDownload} />
                            </label>
                            <input
                              type="file"
                              className="input-fields"
                              id="file-input"
                              onChange={importExcel}
                              style={{ display: "none" }}
                              disabled={writePermission === false}
                            />
                          </div>
                        </Tooltip>
                        <Tooltip placement="left" title="Export">
                          <label
                            className="import-export-btn"
                            style={{
                              cursor:
                                writePermission === false
                                  ? "not-allowed"
                                  : "pointer",
                              opacity: writePermission === false ? 0.5 : 1,
                            }}
                            onClick={() => {
                              if (writePermission !== false) {
                                exportToExcel(values);
                              }
                            }}
                            disabled={writePermission === false}
                          >
                            <FontAwesomeIcon
                              icon={faFileUpload}
                              style={{ width: "15px" }}
                            />
                          </label>
                        </Tooltip>
                      </div>
                    </div>

                    <Row className="d-flex mt-2">
                      <div className="mttr-sec">
                        <p className=" mb-0 para-tag">Spare Parts Analysis</p>
                      </div>
                      <Card className="mt-2 p-4 mttr-card">
                        <Row>
                          <Col>
                            <Form.Group>
                              <Label notify={true}>Spare?</Label>
                              <Select
                                className="mt-1"
                                styles={customStyles}
                                name="spare"
                                type="select"
                                value={values.spare}
                                onBlur={handleBlur}
                                isDisabled={
                                  writePermission === true ||
                                    writePermission === "undefined" ||
                                    role === "admin" ||
                                    (isOwner === true && createdBy === userId)
                                    ? null
                                    : "disabled"
                                }
                                onChange={(e) => {
                                  setFieldValue("spare", e);
                                }}
                                options={[
                                  { value: "Yes", label: "Yes" },
                                  { value: "No", label: "No" },
                                ]}
                              />
                              <ErrorMessage
                                className="error text-danger"
                                component="span"
                                name="spare"
                              />
                            </Form.Group>
                          </Col>
                          <Col>
                            <Form.Group>
                              <Label notify={true}>Warranty Spare?</Label>
                              <Select
                                className="mt-1"
                                name="warrantySpare"
                                styles={customStyles}
                                type="select"
                                isDisabled={
                                  writePermission === true ||
                                    writePermission === "undefined" ||
                                    role === "admin" ||
                                    (isOwner === true && createdBy === userId)
                                    ? null
                                    : "disabled"
                                }
                                value={values.warrantySpare}
                                onBlur={handleBlur}
                                onChange={(e) => {
                                  setFieldValue("warrantySpare", e);
                                }}
                                options={[
                                  { value: "Yes", label: "Yes" },
                                  { value: "No", label: "No" },
                                ]}
                              />
                              <ErrorMessage
                                className="error text-danger"
                                component="span"
                                name="warrantySpare"
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                        <Row>
                          <Col>
                            <Form.Group className="mt-3">
                              <Label notify={true}>Recommended Spare?</Label>
                              <Select
                                className="mt-1"
                                name="recommendedSpare"
                                styles={customStyles}
                                type="select"
                                isDisabled={
                                  writePermission === true ||
                                    writePermission === "undefined" ||
                                    role === "admin" ||
                                    (isOwner === true && createdBy === userId)
                                    ? null
                                    : "disabled"
                                }
                                value={values.recommendedSpare}
                                onBlur={handleBlur}
                                onChange={(e) => {
                                  setFieldValue("recommendedSpare", e);
                                }}
                                options={[
                                  { value: "Yes", label: "Yes" },
                                  { value: "No", label: "No" },
                                ]}
                              />
                              <ErrorMessage
                                className="error text-danger"
                                component="span"
                                name="reCommendedSpare"
                              />
                            </Form.Group>
                          </Col>
                          <Col>
                            <Form.Group className="mt-3">
                              <Label notify="true">Delivery time Days</Label>
                              <Form.Control
                                className="mt-1"
                                name="deliveryTimeDays"
                                type="Number"
                                min="0"
                                step="any"
                                value={values.deliveryTimeDays}
                                onBlur={handleBlur}
                                onChange={handleChange}
                              />
                              <ErrorMessage
                                className="error text-danger"
                                component="span"
                                name="deliveryTimeDays"
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                      </Card>

                      <div className="mttr-sec mt-4">
                        <p className=" mb-0 para-tag">
                          Serial Production Price
                        </p>
                      </div>
                      <Card className="mt-2 p-4 mttr-card">
                        <Row>
                          <Col>
                            <Form.Group>
                              <Label>After serial production price 1</Label>
                              <Form.Control
                                className="mt-1 "
                                name="afterSerialProductionPrice1"
                                type="number"
                                value={values.afterSerialProductionPrice1}
                                onBlur={handleBlur}
                                onChange={handleChange}
                              />
                            </Form.Group>
                          </Col>
                          <Col>
                            <Form.Group>
                              <Label>After serial production price 3</Label>
                              <Form.Control
                                className="mt-1 "
                                name="afterSerialProductionPrice3"
                                type="number"
                                value={values.afterSerialProductionPrice3}
                                onBlur={handleBlur}
                                onChange={handleChange}
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                        <Row>
                          <Col>
                            <Form.Group className="mt-3">
                              <Label>Price1 MOQ</Label>
                              <Form.Control
                                className="mt-1 "
                                name="moq_1Price"
                                type="number"
                                value={values.moq_1Price}
                                onBlur={handleBlur}
                                onChange={handleChange}
                              />
                            </Form.Group>
                          </Col>
                          <Col>
                            <Form.Group className="mt-3">
                              <Label>Price3 MOQ</Label>
                              <Form.Control
                                className="mt-1 "
                                name="moq_3Price"
                                type="number"
                                value={values.moq_3Price}
                                onBlur={handleBlur}
                                onChange={handleChange}
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                        <Row>
                          <Col>
                            <Form.Group className="mt-3">
                              <Label>After serial production price 2</Label>
                              <Form.Control
                                className="mt-1 "
                                name="afterSerialProductionPrice2"
                                type="number"
                                value={values.afterSerialProductionPrice2}
                                onBlur={handleBlur}
                                onChange={handleChange}
                              />
                            </Form.Group>
                          </Col>
                          <Col>
                            <Form.Group className="mt-3">
                              <Label>Annual price escalation percentage</Label>
                              <Form.Control
                                className="mt-1"
                                name="annualPrice"
                                type="text"
                                value={values.annualPrice}
                                onBlur={handleBlur}
                                onChange={handleChange}
                              />
                              <ErrorMessage
                                className="error text-danger"
                                component="span"
                                name="annualPrice"
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                        <Row>
                          <Col>
                            <Form.Group className="mt-3">
                              <Label>Price2 MOQ</Label>
                              <Form.Control
                                className="mt-1 "
                                name="moq_2Price"
                                type="number"
                                value={values.moq_2Price}
                                onBlur={handleBlur}
                                onChange={handleChange}
                              />
                            </Form.Group>
                          </Col>
                          <Col>
                            <Form.Group className="mt-3">
                              <Label>LCC - Price validity to be included</Label>
                              <Form.Control
                                className="mt-1"
                                name="lccPriceValidity"
                                type="text"
                                value={values.lccPriceValidity}
                                onBlur={handleBlur}
                                onChange={handleChange}
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                        <Row>
                          <Col>
                            <Form.Group className="mt-3">
                              <Label>Recommended Spare Quantity</Label>
                              <Form.Control
                                className="mt-1 "
                                name="recommendedSpareQuantity"
                                type="number"
                                min="0"
                                step="any"
                                value={values.recommendedSpareQuantity}
                                onBlur={handleBlur}
                                onChange={handleChange}
                              />
                            </Form.Group>
                          </Col>
                          <Col>
                            <Form.Group className="mt-3">
                              <Label>Calculated Spare Quantity</Label>
                              <Form.Control
                                className="mt-1 "
                                name="calculatedSpareQuantity"
                                type="number"
                                min="0"
                                step="any"
                                value={values.calculatedSpareQuantity}
                                onBlur={handleBlur}
                                disabled={true}
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                      </Card>

                      <div className="d-flex flex-direction-row justify-content-end mt-4 mb-5">
                        <Button
                          className="delete-cancel-btn me-2"
                          variant="outline-secondary"
                          type="reset"
                          onClick={handleCancelClick}
                        >
                          CANCEL
                        </Button>

                        <Button
                          className="save-btn"
                          type="submit"
                          disabled={!productId || formik.isSubmitting || !formik.dirty}
                        >
                          {formik.isSubmitting ? (
                            <>
                              <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                                className="me-2"
                              />
                              Saving...
                            </>
                          ) : (
                            "SAVE CHANGES"
                          )}
                        </Button>

                        <div>
                          <Modal
                            show={show}
                            centered
                            onHide={() => setShow(!show)}
                          >
                            <div className="d-flex justify-content-center mt-5">
                              <div>
                                <FontAwesomeIcon
                                  icon={faCircleCheck}
                                  fontSize={"40px"}
                                  color="#1D5460"
                                />
                              </div>
                            </div>
                          </Modal>
                        </div>
                      </div>
                    </Row>
                  </fieldset>
                </Form>
              </div>
            );
          }}
        </Formik>
      )}
    </div>
  );
}

export default Index;