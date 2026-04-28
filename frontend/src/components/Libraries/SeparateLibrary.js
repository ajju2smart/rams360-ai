/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Col, Form, Row, Container, Button, Modal, Card, Dropdown } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAdjust, faEdit, faEllipsisV, faEye, faEyeSlash, faTrash, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import Select from "react-select";
import Label from "../LabelComponent";
import MaterialTable from "material-table";
import { tableIcons } from "../PBS/TableIcons";
import { Formik, ErrorMessage } from "formik";
import { customStyles } from "../core/select";
import * as Yup from "yup";
import Api from "../../Api";
import Loader from "../core/Loader";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/* ─── Animation styles injected once into <head> ─── */
const ANIM_STYLES = `
  @keyframes sl-shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position:  600px 0; }
  }
  @keyframes sl-fade-in {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
  @keyframes sl-spin {
    to { transform: rotate(360deg); }
  }
  .sl-fade-in { animation: sl-fade-in 0.35s ease both; }
  .sl-skeleton {
    border-radius: 6px;
    background: linear-gradient(90deg, #e8edf2 25%, #f4f7fb 50%, #e8edf2 75%);
    background-size: 600px 100%;
    animation: sl-shimmer 1.4s infinite linear;
  }
  .sl-overlay {
    position: absolute; inset: 0;
    background: rgba(255,255,255,0.75);
    backdrop-filter: blur(2px);
    display: flex; align-items: center; justify-content: center;
    z-index: 20; border-radius: 8px;
  }
  .sl-spinner-ring {
    width: 38px; height: 38px; border-radius: 50%;
    border: 3px solid #dde3ec;
    border-top-color: #3b82f6;
    animation: sl-spin 0.75s linear infinite;
  }
  .sl-spinner-sm {
    width: 14px; height: 14px;
    border: 2px solid rgba(255,255,255,0.45);
    border-top-color: #fff;
    border-radius: 50%;
    animation: sl-spin 0.65s linear infinite;
    display: inline-block;
    margin-right: 6px;
    vertical-align: middle;
  }
`;
if (typeof document !== "undefined" && !document.getElementById("__sl-anim")) {
  const tag = document.createElement("style");
  tag.id = "__sl-anim";
  tag.textContent = ANIM_STYLES;
  document.head.appendChild(tag);
}

/* ─── Full-page shimmer skeleton ─── */
const PageSkeleton = () => (
  <div className="mt-5 sl-fade-in" style={{ padding: "0 16px" }}>
    <div className="sl-skeleton mb-4" style={{ height: 42, borderRadius: 8 }} />
    <div style={{ border: "1px solid #e3e8ef", borderRadius: 10, padding: 24, marginBottom: 28 }}>
      <Row>
        {[1, 2, 3].map((i) => (
          <Col key={i}>
            <div className="sl-skeleton mb-2" style={{ height: 13, width: "45%", marginBottom: 10 }} />
            <div className="sl-skeleton" style={{ height: 38 }} />
          </Col>
        ))}
      </Row>
      <div className="d-flex justify-content-end mt-4" style={{ gap: 10 }}>
        <div className="sl-skeleton" style={{ height: 36, width: 90, borderRadius: 6 }} />
        <div className="sl-skeleton" style={{ height: 36, width: 90, borderRadius: 6 }} />
      </div>
    </div>
    <div style={{ border: "1px solid #e3e8ef", borderRadius: 10, overflow: "hidden" }}>
      <div className="sl-skeleton" style={{ height: 50 }} />
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} style={{ display: "flex", gap: 16, padding: "13px 16px", borderTop: "1px solid #f0f3f7" }}>
          {[6, 18, 24, 30, 14].map((w, j) => (
            <div key={j} className="sl-skeleton" style={{ height: 13, flex: w, borderRadius: 4 }} />
          ))}
        </div>
      ))}
    </div>
  </div>
);

/* ─── Inline overlay spinner for relative containers ─── */
const LoadingOverlay = ({ label = "Loading…" }) => (
  <div className="sl-overlay">
    <div style={{ textAlign: "center" }}>
      <div className="sl-spinner-ring" style={{ margin: "0 auto 10px" }} />
      <div style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>{label}</div>
    </div>
  </div>
);

function SeparateLibrary(props) {
  const { user } = useAuth();
  const [projectId, setProjectId] = useState(props?.location?.state?.projectId);
  const [editingData, setEditingData] = useState("");
  const [selectedValue, setSelectedValue] = useState("");
  const [selectModule, setSelectModule] = useState("");
  const [selectModuleFieldValue, setSelectModuleFieldVlue] = useState("");
  const [fieldvalue, setFieldValue] = useState("");
  const [moduleData, setModuleData] = useState([]);
  const [libraryFieldId, setLibraryFieldId] = useState();
  const [libraryId, setLibraryId] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [allSepareteData, setAllSepareteData] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [name, setName] = useState();
  const [editname, setEditName] = useState();
  const [editData, setEditData] = useState({});
  const [companyId, setCompanyId] = useState();
  const [selectedModule, setSelectedModule] = useState("");
  const [writePermission, setWritePermission] = useState();
  const [readPermission, setReadPermission] = useState();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFieldsLoading, setIsFieldsLoading] = useState(false);
  const history = useHistory();

  const role = user?.role;
  const userId = user?._id;
  const [isOwner, setIsOwner] = useState(false);
  const [createdBy, setCreatedBy] = useState();

  const logout = () => {
    localStorage.clear(history.push("/login"));
    window.location.reload();
  };

const hasWriteAccess = () => {
  if (role === "admin" || role === "SuperAdmin") return true;
  if (isOwner === true && createdBy === userId) return true;

  const module = writePermission?.find(m => m.name === "Seprate Library"); // change name if needed

  return module?.write ?? false;
};

  const hasReadAccess = () => {
    if (role === "admin" || role === "SuperAdmin") return true;
    if (isOwner === true && createdBy === userId) return true;
    return readPermission?.[10]?.read === true;
  };

  const handleDropdownChange = (event) => {
    setSelectedValue();
  };

  const handleAlert = () => {
    setEditModalOpen(false);
    alert("Changes saved successfully");
  };

  const validation = Yup.object().shape({
    Module: Yup.object().required("Module is required"),
    Field: Yup.object().required("Field is required"),
    Value: Yup.string().required("Value is required"),
  });

  const editValidation = Yup.object().shape({
    Module: Yup.string().required("Module is required"),
    Field: Yup.string().required("Field is required"),
    Value: Yup.string().required("Value is required"),
  });

  const columns = [
    {
      title: "S.No",
      render: (rowData) => `${rowData?.tableData?.id + 1}`,
    },
    {
      title: "Module",
      field: "moduleName",
    },
    {
      title: "Fields",
      field: "sourceName",
      render: (rowData) =>
        rowData?.sourceName?.charAt(0).toUpperCase() + rowData?.sourceName?.slice(1),
    },
    {
      title: "Value",
      field: "sourceValue",
    },
  ];

  useEffect(() => {
    getAllSeprateLibraryData();
  }, []);

  useEffect(() => {
    getProjectPermission();
    projectSidebar();
  }, [projectId]);

  const getAllSeprateLibraryData = async () => {
    const companyId = user?.companyId;
    setIsLoading(true);
    setCompanyId(companyId);
    Api.get("api/v1/library/get/all/separate/value", {
      params: { projectId: projectId },
    }).then((res) => {
      setIsLoading(false);
      setAllSepareteData(res.data.data);
    });
  };

  /* Table-level refresh (after create/delete) without full page skeleton */
  const refreshTableData = async () => {
    setIsTableLoading(true);
    Api.get("api/v1/library/get/all/separate/value", {
      params: { projectId: projectId },
    }).then((res) => {
      setIsTableLoading(false);
      setAllSepareteData(res.data.data);
    });
  };

  const getModuleFieldDetails = (value) => {
    setIsFieldsLoading(true);
    Api.post("api/v1/library", {
      moduleName: value,
      projectId: projectId,
      companyId: companyId,
    })
      .then((response) => {
        const data = response.data.libraryData.moduleData;
        const namesToFilter = [
          "Evident1", "Items", "condition", "failure", "redesign",
          "acceptable", "lubrication", "task", "combination", "rcmNotes",
        ];
        const filteredData = data.filter((item) => !namesToFilter.includes(item.name));
        setSelectedModule(value);
        setLibraryId(data.id);
        setModuleData(filteredData);
      })
      .finally(() => {
        setIsFieldsLoading(false);
      });
  };

  const handleReset = (resetForm) => {
    resetForm();
  };

  const submitFormValue = async (values, { setSubmitting, resetForm }) => {
    if (!hasWriteAccess()) {
      toast.error("You don't have permission to create library values");
      setSubmitting(false);
      return;
    }
    try {
      const res = await Api.post("api/v1/library/create/separate/value", {
        moduleName: values.Module.label,
        projectId: projectId,
        companyId: companyId,
        libraryId: libraryId,
        sourceId: libraryFieldId,
        sourceValue: values.Value,
      });
      const data = res.data;
      if (res.status === 201) {
        toast.success(data.message);
        resetForm();
      } else if (res.status === 208) {
        toast.error(data.message);
      }
      refreshTableData();
    } catch {
      toast.error("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const getProjectPermission = () => {
    Api.get(`/api/v1/projectPermission/list`, {
      params: { authorizedPersonnel: userId, projectId: projectId },
    })
      .then((res) => {
        const data = res?.data?.data;
        const modules = data?.modules || [];
        setWritePermission(modules);
        setReadPermission(modules);
      })
      .catch((error) => {
        if (error?.response?.status === 401) logout();
      });
  };

  const projectSidebar = () => {
    Api.get(`/api/v1/projectCreation/${projectId}`).then((res) => {
      setIsOwner(res.data.data.isOwner);
      setCreatedBy(res.data.data.createdBy);
    });
  };

  const updateFormValue = async (values, { setSubmitting }) => {
    if (!hasWriteAccess()) {
      toast.error("You don't have permission to update library values");
      setSubmitting(false);
      return;
    }
    const rowId = editData?.id;
    try {
      const res = await Api.put(`api/v1/library/separate/value/${rowId}`, {
        moduleName: values.Module.label || values.Module,
        projectId: projectId,
        companyId: companyId,
        libraryId: libraryId,
        sourceId: libraryFieldId,
        sourceName: values.Field,
        sourceValue: values.Value,
      });
      setEditModalOpen(false);
      if (res.status === 201) {
        toast.success(res.data.message);
      } else {
        toast.error(res.data.message);
      }
      refreshTableData();
    } catch {
      toast.error("An error occurred while saving changes");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteSepLib = () => {
    if (!hasWriteAccess()) {
      toast.error("You don't have permission to delete library values");
      return;
    }
    setIsDeleting(true);
    const rowId = name?.id;
    Api.delete(`api/v1/library/separate/value/${rowId}`)
      .then(() => {
        setDeleteModalOpen(false);
        toast.success("Deleted Successfully");
        refreshTableData();
      })
      .finally(() => {
        setIsDeleting(false);
      });
  };

  const deleteShow = (values) => {
    if (!hasWriteAccess()) {
      toast.error("You don't have permission to delete library values");
      return;
    }
    setName(values);
    setDeleteModalOpen(true);
  };

  const editShow = (values) => {
    if (!hasWriteAccess()) {
      toast.error("You don't have permission to edit library values");
      return;
    }
    setEditData(values);
    setLibraryId(values.libraryId);
    setLibraryFieldId(values.sourceId);
    setEditModalOpen(true);
  };

  if (!hasReadAccess() && !hasWriteAccess()) {
    return (
      <div className="mt-5">
        <div className="mttr-sec mt-0">
          <p className="mb-0 para-tag d-flex justify-content-center">Access Denied</p>
        </div>
        <div className="d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
          <h4>You don't have permission to access Separate Library</h4>
        </div>
      </div>
    );
  }

  /* ── Initial full-page load ── */
  if (isLoading) return <PageSkeleton />;

  return (
    <div className="mt-5 sl-fade-in">
      <div className="separate">
        <div className="mttr-sec mt-0">
          <p className="mb-0 para-tag d-flex justify-content-center">Separate Library</p>
          {hasReadAccess() && !hasWriteAccess() && (
            <p className="text-warning text-center mb-0">
              <small>Read-only access</small>
            </p>
          )}
        </div>

        {/* ── CREATE FORM ── */}
        {hasReadAccess() && (
          <Formik
            initialValues={{ Module: "", Field: "", Value: "" }}
            validationSchema={validation}
            onSubmit={submitFormValue}
          >
            {(Formik) => {
              const { handleBlur, handleChange, handleSubmit, setFieldValue, values, isSubmitting } = Formik;
              return (
                <Form onSubmit={handleSubmit} onReset={handleReset}>
                  <Card className="mt-4 mttr-card p-4" style={{ position: "relative" }}>
                    {/* Overlay while creating */}
                    {isSubmitting && <LoadingOverlay label="Creating…" />}
                    <Row>
                      <Col>
                        <Label notify={true}>Module</Label>
                        <Form.Group>
                          <Select
                            value={values.Module}
                            onChange={(e) => {
                              if (hasWriteAccess()) {
                                setSelectModule(e.value);
                                getModuleFieldDetails(e.value);
                                setFieldValue("Field", "");
                                setFieldValue("Module", { label: e.value, value: e.value });
                              }
                            }}
                            placeholder="Select Module"
                            type="select"
                            name="Module"
                            styles={customStyles}
                            isDisabled={!hasWriteAccess() || isSubmitting}
                            options={[
                              { value: "FMECA", label: "FMECA" },
                              { value: "SAFETY", label: "SAFETY" },
                              { value: "PMMRA", label: "PMMRA" },
                              { value: "MTTR", label: "MTTR" },
                            ]}
                          />
                          <ErrorMessage component="span" name="Module" className="error text-danger" />
                        </Form.Group>
                      </Col>
                      <Col>
                        <Label notify={true}>Fields</Label>
                        <Form.Group>
                          <Select
                            value={values.Field}
                            onChange={(e) => {
                              if (hasWriteAccess()) {
                                setLibraryFieldId(e.id);
                                setFieldValue("Value", "");
                                setFieldValue("Field", { label: e.label, value: e.value });
                                setSelectModuleFieldVlue(e.value);
                              }
                            }}
                            placeholder={isFieldsLoading ? "Loading fields…" : "Select Field"}
                            name="Field"
                            styles={customStyles}
                            isDisabled={!hasWriteAccess() || isFieldsLoading || isSubmitting}
                            isLoading={isFieldsLoading}
                            loadingMessage={() => "Fetching fields…"}
                            options={[
                              {
                                options: moduleData?.map((list) => ({
                                  value: list.name,
                                  label: list.key,
                                  id: list._id,
                                })),
                              },
                            ]}
                          />
                          <ErrorMessage component="span" name="Field" className="error text-danger" />
                        </Form.Group>
                      </Col>
                      {values.Field ? (
                        <Col>
                          <Label notify={true}>Value</Label>
                          <Form.Group>
                            <Form.Control
                              style={{ borderRadius: "3px" }}
                              placeholder="Enter value"
                              value={values.Value}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              name="Value"
                              disabled={!hasWriteAccess() || isSubmitting}
                            />
                            <ErrorMessage component="span" name="Value" className="error text-danger" />
                          </Form.Group>
                        </Col>
                      ) : null}
                      <div className="d-flex flex-direction-row justify-content-end mt-4 mb-2">
                        <Button
                          className="delete-cancel-btn me-2"
                          variant="outline-secondary"
                          onClick={() => Formik.resetForm()}
                          disabled={!hasWriteAccess() || isSubmitting}
                        >
                          CANCEL
                        </Button>
                        <Button
                          className="save-btn"
                          type="submit"
                          disabled={!hasWriteAccess() || isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <span className="sl-spinner-sm" />
                              Creating…
                            </>
                          ) : (
                            "CREATE"
                          )}
                        </Button>
                      </div>
                    </Row>
                  </Card>
                </Form>
              );
            }}
          </Formik>
        )}

        {/* ── TABLE with inline overlay on refresh ── */}
        {hasReadAccess() && (
          <div style={{ position: "relative", bottom: "10px" }}>
            {isTableLoading && <LoadingOverlay label="Refreshing data…" />}
            <MaterialTable
              title="Separate Library"
              className="mb-5"
              data={allSepareteData.filter((item) => item.moduleName === selectedModule)}
              columns={columns}
              icons={tableIcons}
              style={{ marginTop: "30px", opacity: isTableLoading ? 0.5 : 1, transition: "opacity 0.2s" }}
              actions={
                hasWriteAccess()
                  ? [
                      (rowData) => ({
                        icon: () => (
                          <Row>
                            <Col>
                              <FontAwesomeIcon
                                icon={faEdit}
                                className="icon-btn"
                                onClick={() => editShow(rowData)}
                              />
                            </Col>
                          </Row>
                        ),
                        tooltip: "Edit Page",
                      }),
                      (rowData) => ({
                        icon: () => (
                          <Row>
                            <Col>
                              <FontAwesomeIcon icon={faTrash} className="coloring" />
                            </Col>
                          </Row>
                        ),
                        tooltip: "Delete Page",
                        onClick: () => deleteShow(rowData),
                      }),
                    ]
                  : []
              }
              options={{
                cellStyle: { border: "1px solid #eee" },
                addRowPosition: "first",
                actionsColumnIndex: -1,
                pageSize: 5,
                pageSizeOptions: [5, 10, 20, 50],
                headerStyle: {
                  backgroundColor: "#CCE6FF",
                  fontWeight: "bold",
                  zIndex: 0,
                },
              }}
              onRowClick={(event, rowData) => setEditingData(rowData)}
            />
          </div>
        )}
      </div>

      {/* ── EDIT MODAL ── */}
      <Modal show={editModalOpen} onHide={() => setEditModalOpen(false)} className="mb-0">
        <Modal.Header
          className="mt-2 display-flex justify-content-center mttr-sec para-tag"
          style={{ margin: "15px" }}
        >
          <Modal.Title>Edit Separate Library</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ marginTop: "-22px", marginBottom: "-18px" }}>
          <Formik
            initialValues={{
              Module: editData.moduleName,
              Field: editData.sourceName,
              Value: editData.sourceValue,
            }}
            validationSchema={editValidation}
            onSubmit={updateFormValue}
          >
            {(Formik) => {
              const { handleBlur, handleChange, handleSubmit, values, isSubmitting } = Formik;
              const hasChanges = values.Value !== editData.sourceValue;
              return (
                <Form onSubmit={handleSubmit}>
                  <Card className="mt-0 mttr-card p-4" style={{ position: "relative" }}>
                    {isSubmitting && <LoadingOverlay label="Saving changes…" />}
                    <Row>
                      <Col className="col-lg-12 mb-3">
                        <Label className="college">Module</Label>
                        <Form.Group>
                          <Form.Control
                            style={{ backgroundColor: "#dddddd" }}
                            type="text"
                            value={editData.moduleName}
                            readOnly
                            name="Module"
                          />
                        </Form.Group>
                      </Col>
                      <Col className="col-lg-12 mb-3">
                        <Label className="college">Field</Label>
                        <Form.Group>
                          <Form.Control
                            style={{ backgroundColor: "#dddddd" }}
                            type="text"
                            value={editData.sourceName}
                            readOnly
                            name="field"
                          />
                        </Form.Group>
                      </Col>
                      <Col className="col-lg-12">
                        <Label className="college">Value</Label>
                        <Form.Group>
                          <Form.Control
                            style={{ borderRadius: "7px" }}
                            placeholder="Enter value"
                            value={values.Value}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            name="Value"
                            disabled={!hasWriteAccess() || isSubmitting}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <div className="d-flex flex-direction-row justify-content-end mt-4">
                      <Button
                        className="me-2 canceled"
                        variant="outline-secondary"
                        onClick={() => setEditModalOpen(false)}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      {hasWriteAccess() && (
                        <Button
                          type="submit"
                          className="save-btn-btn"
                          disabled={!hasChanges || isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <span className="sl-spinner-sm" />
                              Saving…
                            </>
                          ) : (
                            "Save Changes"
                          )}
                        </Button>
                      )}
                    </div>
                  </Card>
                </Form>
              );
            }}
          </Formik>
        </Modal.Body>
      </Modal>

      {/* ── DELETE MODAL ── */}
      <Modal show={deleteModalOpen} onHide={() => setDeleteModalOpen(false)}>
        <Modal.Header
          className="justify-content-center mttr-sec para-tag"
          style={{ margin: "15px", marginTop: "5px" }}
        >
          <Modal.Title>Delete separate library</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ marginTop: "-20px" }}>
          <div>
            <h5 className="d-flex justify-content-center mb-4 coloring">
              Are you sure want to delete?
            </h5>
            <Card className="mttr-card p-4" style={{ marginTop: "-10px", position: "relative" }}>
              {isDeleting && <LoadingOverlay label="Deleting…" />}
              <Row>
                <Col className="col-lg-12 mt-0">
                  <Label>Module</Label>
                  <Form.Group>
                    <Form.Control
                      style={{ backgroundColor: "#dddddd" }}
                      value={name?.moduleName}
                      name="module"
                      readOnly
                    />
                  </Form.Group>
                </Col>
                <Col className="col-lg-12 mt-3">
                  <Label>Field</Label>
                  <Form.Group>
                    <Form.Control
                      style={{ backgroundColor: "#dddddd" }}
                      value={name?.sourceName}
                      name="field"
                      readOnly
                    />
                  </Form.Group>
                </Col>
                <Col className="col-lg-12 mt-3">
                  <Label>Value</Label>
                  <Form.Group>
                    <Form.Control
                      style={{ backgroundColor: "#dddddd" }}
                      value={name?.sourceValue}
                      name="value"
                      readOnly
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card>
          </div>
        </Modal.Body>
        <div
          className="d-flex flex-direction-row justify-content-end mb-2"
          style={{ marginTop: "-15px" }}
        >
          <Button
            className="canceled me-2"
            variant="outline-secondary"
            onClick={() => setDeleteModalOpen(false)}
            disabled={isDeleting}
          >
            No
          </Button>
          {hasWriteAccess() && (
            <Button
              className="save-btn-btn me-3"
              onClick={() => deleteSepLib()}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <span className="sl-spinner-sm" />
                  Deleting…
                </>
              ) : (
                "Yes"
              )}
            </Button>
          )}
        </div>
      </Modal>
    </div>
  );
}

export default SeparateLibrary;