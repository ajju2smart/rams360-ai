// Make sure you have this import
import { useState, useEffect, useRef } from "react";
import { Nav, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";
import { Avatar } from "@material-ui/core";
import "../../css/HeaderNavBar.scss";
import Tooltip from "@mui/material/Tooltip";
import Relisafe from "../core/Images/Relisafe.png";
import { useHistory } from "react-router-dom";
import { useModal } from "../ModalContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileLines,
  faPenToSquare,
  faFileAlt,
  faExpand,
  faCompress,
  faTh,
  faRedo
} from "@fortawesome/free-solid-svg-icons";
import Api from "../../Api.js";
import "../../css/HeaderNavBar.scss";
import { FormControl, FormGroup, NavDropdown, Navbar } from "react-bootstrap";
import { faDownload, faUpload, faFileCsv, faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { Button, Modal, Select, Spin } from "antd";
import Label from "../../components/LabelComponent";
import * as Yup from "yup";
import { ErrorMessage, Form, Formik } from "formik";
import { customStyles } from "../../components/core/select";
import { useAuth } from "../../context/AuthContext";


const HeaderNavBar = ({
  active,
  selectedComponent,
  onReloadData,
  onGenerateReport,
  onZoomToFit,
  onZoomOriginal,
  onToggleGrid,
  onOriginalLayout
}) => {
  const history = useHistory();
  const { user, logout, loggingOut, setUser } = useAuth();
  const [file, setFile] = useState(null);
  const {
    openFTAModal,
    openPropertiesModal,
    openEditGateModal,
    openChildCreateModal,
    openChildEvent,
    openDeleteNode,
    handleDownloadFTA,
    openProbabilityCalculations,
    isProbOpen,
    triggerReload,
  } = useModal();

  const [openProbCal, setOpenProbCal] = useState();
  const handleCreateNew = () => {
    openFTAModal();
  };

  const handleOpenPropertyModal = () => {
    openPropertiesModal();
  };

  const handleOpenEdit = () => {
    openEditGateModal();
  };

  const handleOpenChildCreate = () => {
    openChildCreateModal();
  };

  const handleOpenChildEvent = () => {
    openChildEvent();
  };

  const handelDelete = () => {
    openDeleteNode();
  };


  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    if (event.target.files[0]) {
      const formData = new FormData();
      formData.append("jsonFile", event.target.files[0]);

      Api.post("/api/v1/FTAjson/upload", formData).then((res) => {
        if (res.status === 201) {
          toast("File uploaded successfully!", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
            type: "success",
          });
          triggerReload();
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        } else {
          toast("File not uploaded!", {
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
      }).catch((error) => {
        console.error("Error uploading JSON data", error);
      });
    }
  };

  const handleUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div>
      <Modal
        open={loggingOut}
        footer={null}
        closable={false}
        centered
        maskClosable={false}
        bodyStyle={{ textAlign: "center", padding: "40px" }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div className="logout-loader"></div>
          <h3 className="logout-text-animated">Logging out...</h3>
        </div>
      </Modal>
      <input type="file" accept=".json" onChange={handleFileChange} ref={fileInputRef} style={{ display: "none" }} />
      {user ? (
        <div className={active ? "nav-head-main-action" : "nav-head-main"}>
          <div className={active ? "avatar-div" : "avatar-div-action"}>
            <div className="avatar-div-action mx-5">
              <div style={{ width: "100%", display: "flex" }}>
                <div style={{ width: "0%" }} />
                {selectedComponent === "FTA" ? (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      width: "90%",
                      height: "100%",
                    }}
                  >
                    <Navbar variant="dark" expand="lg">
                      <Navbar.Collapse id="navbar-dark-example">
                        <Nav>
                          <NavDropdown
                            title={
                              <span className="dropdown-title">
                                Fault Tree <span className="dropdown-arrow">&#9662;</span>
                              </span>
                            }
                            id="basic-nav-dropdown"
                          >
                            <NavDropdown.Item onClick={handleCreateNew}>
                              <FontAwesomeIcon icon={faFileLines} style={{ paddingRight: "10px" }} />
                              Create New
                            </NavDropdown.Item>
                            <NavDropdown.Item onClick={handleOpenPropertyModal}>
                              <FontAwesomeIcon icon={faPenToSquare} style={{ paddingRight: "10px" }} />
                              Properties
                            </NavDropdown.Item>
                            <NavDropdown.Item onClick={handleDownloadFTA}>
                              <FontAwesomeIcon icon={faDownload} style={{ paddingRight: "10px" }} />
                              Save to File
                            </NavDropdown.Item>
                            <NavDropdown.Item onClick={handleUpload}>
                              <FontAwesomeIcon icon={faUpload} style={{ paddingRight: "10px" }} />
                              Load from File
                            </NavDropdown.Item>
                          </NavDropdown>
                        </Nav>
                      </Navbar.Collapse>
                    </Navbar>

                    <Navbar variant="dark" expand="lg">
                      <Navbar.Collapse id="navbar-dark-example">
                        <Nav>
                          <NavDropdown
                            title={
                              <span className="dropdown-title">
                                Edit <span className="dropdown-arrow">&#9662;</span>
                              </span>
                            }
                            id="basic-nav-dropdown"
                          >
                            <NavDropdown.Item onClick={handleOpenEdit}>Edit Gate</NavDropdown.Item>
                            <NavDropdown.Item onClick={handleOpenChildCreate}>Add New Logical Gate</NavDropdown.Item>
                            <NavDropdown.Item onClick={handleOpenChildEvent}>Add New Event</NavDropdown.Item>
                            <NavDropdown.Item onClick={handelDelete}>Delete</NavDropdown.Item>
                          </NavDropdown>
                        </Nav>
                      </Navbar.Collapse>
                    </Navbar>

                    <Navbar variant="dark" expand="lg">
                      <Navbar.Collapse id="navbar-dark-example">
                        <Nav>

                          <NavDropdown
                            title={
                              <span className="dropdown-title">
                                Report <span className="dropdown-arrow">&#9662;</span>
                              </span>
                            }
                            id="basic-nav-dropdown"
                          >
                            <NavDropdown.Item onClick={() => onGenerateReport && onGenerateReport('all')}>
                              <FontAwesomeIcon icon={faFileAlt} style={{ paddingRight: "10px" }} />
                              All Nodes Report
                            </NavDropdown.Item>
                            <NavDropdown.Item onClick={() => onGenerateReport && onGenerateReport('events')}>
                              <FontAwesomeIcon icon={faFileCsv} style={{ paddingRight: "10px" }} />
                              List of Events
                            </NavDropdown.Item>
                            <NavDropdown.Item onClick={() => onGenerateReport && onGenerateReport('gates')}>
                              <FontAwesomeIcon icon={faFilePdf} style={{ paddingRight: "10px" }} />
                              List of Gates
                            </NavDropdown.Item>
                          </NavDropdown>
                        </Nav>
                      </Navbar.Collapse>
                    </Navbar>

                    <Navbar variant="dark" expand="lg">
                      <Navbar.Collapse id="navbar-dark-example">
                        <Nav>
                          <NavDropdown
                            title={
                              <span className="dropdown-title">
                                View <span className="dropdown-arrow">&#9662;</span>
                              </span>
                            }
                            id="basic-nav-dropdown"
                          >
                            <NavDropdown.Item onClick={() => onZoomToFit && onZoomToFit()}>
                              <FontAwesomeIcon icon={faExpand} style={{ paddingRight: "10px" }} />
                              Zoom - To Fit Screen
                            </NavDropdown.Item>
                            <NavDropdown.Item onClick={() => onZoomOriginal && onZoomOriginal()}>
                              <FontAwesomeIcon icon={faCompress} style={{ paddingRight: "10px" }} />
                              Zoom - Original Size
                            </NavDropdown.Item>
                            <NavDropdown.Item onClick={() => onToggleGrid && onToggleGrid()}>
                              <FontAwesomeIcon icon={faTh} style={{ paddingRight: "10px" }} />
                              Toggle Grid
                            </NavDropdown.Item>
                            <NavDropdown.Item onClick={() => onOriginalLayout && onOriginalLayout()}>
                              <FontAwesomeIcon icon={faRedo} style={{ paddingRight: "10px" }} />
                              Original Layout
                            </NavDropdown.Item>
                          </NavDropdown>
                        </Nav>
                      </Navbar.Collapse>
                      <Navbar variant="dark" expand="lg">
                        <Navbar.Collapse id="navbar-dark-example">
                          <Nav>
                            <NavDropdown
                              title={
                                <span className="dropdown-title">
                                  Analysis <span className="dropdown-arrow">&#9662;</span>
                                </span>
                              }
                              id="basic-nav-dropdown"
                            >
                              <NavDropdown.Item onClick={() => setOpenProbCal(true)}>Probability Calculations(MCS)</NavDropdown.Item>
                              <NavDropdown.Item >Show Repeated Events</NavDropdown.Item>
                            </NavDropdown>
                          </Nav>
                        </Navbar.Collapse>
                      </Navbar>\
                    </Navbar>



                  </div>
                ) : null}

                <div
                  style={{
                    width: selectedComponent === "FTA" ? "10%" : "100%",
                    display: "flex",
                    justifyContent: "end",
                  }}
                >
                  <Nav>
                    <UncontrolledDropdown nav inNavbar>
                      <DropdownToggle nav>
                        <div className="d-flex justify-content-start align-items-center">
                          <Tooltip title={user?.name}>
                            <Avatar round size="50" className="d-flex justify-content-center">
                              <p className="dropdown-option mb-0">{user?.name?.substring(0, 2)}</p>
                            </Avatar>
                          </Tooltip>
                        </div>
                      </DropdownToggle>
                      <DropdownMenu className="drop-down-menu logout-text">
                        <DropdownItem
                          className="user-dropitem"
                          onClick={async () => {
                            if (loggingOut) return;

                            await logout();
                            history.replace("/login");
                          }}
                          style={{
                            cursor: loggingOut ? "not-allowed" : "pointer",
                            opacity: loggingOut ? 0.6 : 1,
                            pointerEvents: loggingOut ? "none" : "auto",
                            zIndex: 0
                          }}
                        >
                          {loggingOut ? "Logging out..." : "Log Out"}
                        </DropdownItem>
                      </DropdownMenu>
                    </UncontrolledDropdown>
                  </Nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className={"nav-head-main"}>
          <div className="header-logo">
            <img src={Relisafe} alt="Snow" className="mx-1 head-nav-image" />
          </div>
        </div>
      )}



      <Modal
        title={
          <p style={{ margin: "0px", color: "#00a9c9", width: '500px' }}>
            Calculation Parameter
          </p>
        }
        open={openProbCal}
        footer={null}
        onCancel={() => setOpenProbCal(false)}
        maskClosable={false}
      >
        <hr />
        <Formik
          enableReinitialize={true}
          initialValues={{
            name: "",
            description: "",
            calcTypes: "",
            missionTime: "",
          }}
          onSubmit={(values) => {
            // TODO: Implement actual probability calculation API call
            setOpenProbCal(false);
          }}
          validationSchema={Yup.object().shape({
            name: Yup.string().required("Name is Required"),
            description: Yup.string().required("Description is Required"),
            calcTypes: Yup.object().required("Calc.Types is Required"),
            missionTime: Yup.string().when('calcTypes', {
              is: (calcTypes) => calcTypes?.value === "Unavailability at time t Q(t)",
              then: Yup.string().required("Mission time t is required"),
            }),
          })}
        >
          {({ values, handleChange, handleSubmit, handleBlur, setFieldValue }) => (
            <Form onSubmit={handleSubmit}>
              <FormGroup className="mb-2">
                <Label notify={true}>Name</Label>
                <FormControl
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={values.name}
                  onBlur={handleBlur}
                  onChange={handleChange}
                />
                <ErrorMessage className="error text-danger" component="span" name="name" />
              </FormGroup>

              <FormGroup className="mb-2">
                <Label notify={true}>Description</Label>
                <FormControl
                  as="textarea"
                  rows={3}
                  type="text"
                  name="description"
                  placeholder="Description"
                  value={values.description}
                  onBlur={handleBlur}
                  onChange={handleChange}
                />
                <ErrorMessage className="error text-danger" component="span" name="description" />
              </FormGroup>

              <FormGroup className="mb-2">
                <Label notify={true}>Calc.Types</Label>
                <Select
                  styles={customStyles}
                  style={{
                    border: '1px solid black',
                    width: '100%',
                  }}
                  name="calcTypes"
                  value={values.calcTypes}
                  onBlur={handleBlur}
                  onChange={(selectedOption) => {
                    setFieldValue("calcTypes", selectedOption);
                    // Optional: If you need the value in state
                    // setCalcTypes(selectedOption?.value || "");
                  }}
                  options={[
                    {
                      value: "Unavailability at time t Q(t)",
                      label: "Unavailability at time t Q(t)",
                    },
                    {
                      value: "Steady-state mean unavailability Q",
                      label: "Steady-state mean unavailability Q",
                    },
                  ]}
                />
                <ErrorMessage className="error text-danger" component="span" name="calcTypes" />
              </FormGroup>

              {/* Fixed conditional rendering */}
              {(values.calcTypes?.value === "Unavailability at time t Q(t)" ||
                (typeof values.calcTypes === 'string' && values.calcTypes === "Unavailability at time t Q(t)")) && (
                  <FormGroup className="mb-2">
                    <Label notify={true}>Mission time t</Label>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <FormControl
                        type="text"
                        name="missionTime"
                        placeholder="Mission time t"
                        value={values.missionTime}
                        onBlur={handleBlur}
                        onChange={handleChange}
                        style={{ width: "80%" }}
                      />
                      <p style={{ margin: "0px", fontWeight: "bold", marginLeft: "20px" }}>
                        (hours)
                      </p>
                    </div>
                    <ErrorMessage className="error text-danger" component="span" name="missionTime" />
                  </FormGroup>
                )}

              <div className="d-flex justify-content-end mt-4">
                <Button
                  className="me-2"
                  onClick={() => setOpenProbCal(false)}
                >
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit">
                  Calculation
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </Modal>
    </div>
  );
};

export default HeaderNavBar;