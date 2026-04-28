import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Col, Form, Row, Card, Button } from "react-bootstrap";
import Label from "../LabelComponent";
import "../../css/Reports.scss";
import { Formik, ErrorMessage } from "formik";
import Api from "../../Api";
import { useHistory } from "react-router-dom";
import Select from "react-select";
import PBSReport from "./PbsReport.js";
import RAReport from "./ReliabilityAnalysis.js";
import MaintabilityReport from "./MainTainabilityReport.js";
import FMECAreport from "./FMECAreport.js";
import SafetyReport from "./SafetyReport.js";
import SpareAnalysis from "./SpareAnalysis.js";
import PreventiveManitenance from "./PreventiveManitenance.js";
import * as Yup from "yup";
import PBS_ComponentType from "./ComponentTypes/PBS_ComponentType";
import RA_ComponentType from "./ComponentTypes/RA_ComponentType";
import MA_ComponentType from "./ComponentTypes/MA_ComponentType";
import PM_ComponentType from "./ComponentTypes/PM_ComponentType";
import SA_ComponentType from "./ComponentTypes/SA_ComponentType";
import FMECA_ComponentType from "./ComponentTypes/FMECA_ComponentType";
import Safety_ComponentType from "./ComponentTypes/Safety_ComponentType";
import { useAuth } from "../../context/AuthContext";

function Reports(props) {
  const { user } = useAuth();
  const projectId = props?.location?.state?.projectId;
  const [isLoading, setIsLoading] = useState(true);
  const [projectData, setProjectData] = useState(null);
  const [selectModule, setSelectModule] = useState("");
  const [selectModuleFieldValue, setSelectModuleFieldValue] = useState("");
  const [showReport, setShowReport] = useState(false);
  const history = useHistory();
  const [permission, setPermission] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [createdBy, setCreatedBy] = useState();
  const [selectedReportType, setSelectedReportType] = useState(null);
  const [selectHeirarchyLevel, setSelectHeirarchyLevel] = useState(null);
  const [reportTypeOptions, setReportTypeOptions] = useState([]);
  const role = user?.role;
  const userId = user?._id;
  const { id } = useParams();

  const reportSchema = Yup.object().shape({
    Module: Yup.object()
      .required({
        label: Yup.string().required("Module is required"),
        value: Yup.string().required("Module is required"),
      })
      .nullable()
      .required("Module is required"),
    Field: Yup.object()
      .required({
        label: Yup.string().required("Field is required"),
        value: Yup.string().required("Field is required"),
      })
      .nullable()
      .required("Field is required"),
  });

  const getReportTypeOptions = () => [
    { value: "0", label: "Rams360 Standard" },
    { value: "1", label: "Hierarchy levels" },
    { value: "2", label: "Assembly" },
    { value: "3", label: "Electronics" },
    { value: "4", label: "Mechanical" },
    { value: "5", label: "Component type" },
  ];

  const logout = useCallback(() => {
    localStorage.clear();
    history.push("/login");
    window.location.reload();
  }, [history]);

  // Single combined init fetch — avoids two independent loaders racing
  const initPage = useCallback(async () => {
    if (!id || !userId) return;
    setIsLoading(true);
    try {
      const [projectRes, permissionRes] = await Promise.all([
        Api.get(`/api/v1/projectCreation/${id}`),
        Api.get(`/api/v1/projectPermission/list`, {
          params: { authorizedPersonnel: userId, projectId: id, userId },
        }),
      ]);
      setProjectData(projectRes.data.data);
      const modules = permissionRes?.data?.data?.modules || [];
      const module = modules.find(m => m.name === "Reports"); // index 12
      setPermission(module ?? null);
    } catch (error) {
      if (error?.response?.status === 401) logout();
      console.error("Error loading reports page:", error);
    } finally {
      setIsLoading(false);
    }
  }, [id, userId, logout]);

  useEffect(() => {
    initPage();
  }, [initPage]);

  const handleReset = (resetForm) => {
    resetForm();
  };

  const generateReport = (values) => {
    setSelectModule(values.Module.value);
    setShowReport(true);
  };

  const handleModuleChange = (e, formikProps) => {
    setSelectModuleFieldValue("");
    setSelectedReportType(null);
    setSelectHeirarchyLevel(null);
    setShowReport(false);
    formikProps.setFieldValue("Field", "");
    formikProps.setFieldValue("HierarchyLevel", "");
    formikProps.setFieldValue("Module", { label: e.label, value: e.value });
    setReportTypeOptions(getReportTypeOptions());
  };

  const handleReportTypeChange = (e, formikProps) => {
    setSelectedReportType(e.value);
    setSelectModuleFieldValue(e.value);
    formikProps.setFieldValue("Field", { label: e.label, value: e.value });
  };

  const canView =
    permission?.read === true ||
    permission?.read === undefined ||
    role === "admin" ||
    (isOwner === true && createdBy === userId);

  const renderReport = () => {
    if (!showReport) return null;

    const commonProps = {
      projectId: id,
      selectModuleFieldValue,
      selectModule,
    };
    const withHierarchy = { ...commonProps, hierarchyType: selectHeirarchyLevel };

    if (selectModule === "PBS") {
      return selectedReportType == 5
        ? <PBS_ComponentType {...commonProps} />
        : <PBSReport {...withHierarchy} />;
    }
    if (selectModule === "RA") {
      return selectedReportType == 5
        ? <RA_ComponentType {...commonProps} />
        : <RAReport {...withHierarchy} />;
    }
    if (selectModule === "MA") {
      return selectedReportType == 5
        ? <MA_ComponentType {...commonProps} />
        : <MaintabilityReport {...withHierarchy} />;
    }
    if (selectModule === "PM") {
      return selectedReportType == 5
        ? <PM_ComponentType {...commonProps} />
        : <PreventiveManitenance {...withHierarchy} />;
    }
    if (selectModule === "SA") {
      return selectedReportType == 5
        ? <SA_ComponentType {...commonProps} />
        : <SpareAnalysis {...withHierarchy} />;
    }
    if (selectModule === "FMECA") {
      return selectedReportType == 5
        ? <FMECA_ComponentType {...commonProps} />
        : <FMECAreport {...withHierarchy} />;
    }
    if (selectModule === "SAFETY") {
      return selectedReportType == 5
        ? <Safety_ComponentType {...withHierarchy} />
        : <SafetyReport {...withHierarchy} />;
    }
    return null;
  };

  return (
    <div>
      <div className="mt-5">
        <div>
          <div className="mttr-sec mt-0">
            <p className="mb-0 para-tag d-flex justify-content-center">Report</p>
          </div>

          {isLoading ? (
            <div className="text-center mt-5">
              <p>Loading...</p>
            </div>
          ) : canView ? (
            <div>
              <Formik
                initialValues={{
                  Module: selectModule ? { label: selectModule, value: selectModule } : "",
                  Field: selectModuleFieldValue
                    ? { label: selectModuleFieldValue, value: selectModuleFieldValue }
                    : "",
                  Value: "",
                }}
                validationSchema={reportSchema}
                onSubmit={(values) => generateReport(values)}
              >
                {(formikProps) => (
                  <Form onSubmit={formikProps.handleSubmit} onReset={handleReset}>
                    <Card className="mt-4 mttr-card p-4">
                      <Row>
                        <Col>
                          <Label notify={true}>Report</Label>
                          <Form.Group>
                            <Select
                              value={formikProps.values.Module}
                              onChange={(e) => handleModuleChange(e, formikProps)}
                              placeholder="Select Module"
                              name="Module"
                              options={[
                                { value: "PBS", label: "PBS" },
                                { value: "RA", label: "Reliability Analysis" },
                                { value: "MA", label: "Maintainability analysis" },
                                { value: "PM", label: "Preventive maintenance" },
                                { value: "SA", label: "Spares analysis" },
                                { value: "FMECA", label: "FMECA" },
                                { value: "SAFETY", label: "SAFETY" },
                              ]}
                            />
                            <ErrorMessage component="span" name="Module" className="error text-danger" />
                          </Form.Group>
                        </Col>
                        <Col>
                          <Label notify={true}>Report Type</Label>
                          <Form.Group>
                            <Select
                              value={formikProps.values.Field}
                              onChange={(e) => handleReportTypeChange(e, formikProps)}
                              placeholder="Select Field"
                              name="Field"
                              options={getReportTypeOptions()}
                              isDisabled={!formikProps.values.Module}
                            />
                            <ErrorMessage component="span" name="Field" className="error text-danger" />
                          </Form.Group>
                        </Col>
                        {selectedReportType === "1" && (
                          <Col>
                            <Label notify={true}>Hierarchy Level</Label>
                            <Form.Group>
                              <Select
                                value={formikProps.values.HierarchyLevel}
                                onChange={(e) => {
                                  setSelectHeirarchyLevel(e.value);
                                  formikProps.setFieldValue("HierarchyLevel", {
                                    label: e.label,
                                    value: e.value,
                                  });
                                }}
                                placeholder="Select Hierarchy Level"
                                name="HierarchyLevel"
                                options={Array.from({ length: 10 }, (_, i) => ({
                                  value: String(i + 1),
                                  label: String(i + 1),
                                }))}
                              />
                              <ErrorMessage component="span" name="HierarchyLevel" className="error text-danger" />
                            </Form.Group>
                          </Col>
                        )}
                      </Row>
                      <div className="d-flex flex-direction-row justify-content-end mt-4 mb-2">
                        <Button className="save-btn mx-3" type="submit">
                          GET REPORT
                        </Button>
                        <Button
                          className="delete-cancel-btn"
                          variant="outline-secondary"
                          onClick={() => {
                            formikProps.resetForm();
                            setSelectedReportType(null);
                            setShowReport(false);
                            setSelectModule("");
                            setSelectModuleFieldValue("");
                            setSelectHeirarchyLevel(null);
                            setReportTypeOptions([]);
                          }}
                        >
                          RESET
                        </Button>
                      </div>
                    </Card>
                    {renderReport()}
                  </Form>
                )}
              </Formik>
            </div>
          ) : (
            <div>
              <Card>
                <Card.Body>
                  <Card.Title className="text-center">Access Denied</Card.Title>
                  <Card.Text>
                    <p className="text-center">
                      You don't have permission to access these sections
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
        </div>
      </div>
    </div>
  );
}

export default Reports;