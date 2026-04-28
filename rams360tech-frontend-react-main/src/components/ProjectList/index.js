import { useEffect, useState } from "react";
import { Table, Row, Col, Form, Modal, Card, Button, Dropdown, Spinner } from "react-bootstrap";
import "../../css/ProjectList.scss";
import Api from "../../Api";
import { useHistory } from "react-router-dom";
import { FaEllipsisV } from "react-icons/fa";
import { ErrorMessage, Formik } from "formik";
import Label from "../LabelComponent";
import * as Yup from "yup";
import Loader from "../core/Loader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleExclamation } from "@fortawesome/free-solid-svg-icons";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../context/AuthContext";


export default function ProjectList(props, list) {
  const { user } = useAuth();
  const pbspermission = props?.location?.state?.pbsWrite;
  const [projectList, setProjectList] = useState([]);
  const [projectId, setProjectId] = useState();
  const [projectName, setProjectName] = useState();
  const [companyName, setCompanyName] = useState();
  const [projectNum, setProjectNum] = useState();
  const [loading, setLoading] = useState(false);
  const [projectOwner, setProjectOwner] = useState();
  const [confirmDeleteMsg, setConfirmDeleteMsg] = useState(false);
  const [projectDeleteMessage, setProjectDeleteMessage] = useState(false);
  const history = useHistory();
  const [show, setShow] = useState(false);
  const [owner, setOwner] = useState();
  const [responseExist, setResponseExist] = useState(false);
  const [alreadyExistMsg, setAlreadyExistMsg] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [isCreateSubmit, setIsCreateSubmit] = useState(false);
  const [projectCreateMessage, setProjectCreateMessage] = useState(false);
  const [createdProjectInfo, setCreatedProjectInfo] = useState({ id: null, name: "" });
  const initialHue = 240;
  const companyId = user?.companyId;
  const userId = user?._id;
  const role = user?.role

  const getDeleteProjectData = (value) => {
    setIsLoading(true);
    setTimeout(() => {
      setConfirmDeleteMsg(true);
      setIsLoading(false);
    }, 1000);
    setProjectId(value?.id);
    setCompanyName(value?.companyId?.companyName);
    setProjectName(value?.projectName);
    setProjectNum(value?.projectNumber);
    setProjectOwner(value?.projectOwner?.name);
  };

  const handleOpenModal = () => {
    setIsLoading(true);
    setTimeout(() => {
      setShow(true);
      setIsLoading(false);
    }, 500);
  }

  const deleteProject = () => {
    Api.delete(`api/v1/projectCreation/${projectId}`, {
      headers: {
        userId: userId,
      },
    })
      .then((res) => {
        setLoading(false);
        setConfirmDeleteMsg(false);
        ProjectDeleteMessageClose();
        getProjectList();
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };

  const logout = () => {
    localStorage.clear(history.push("/login"));
    window.location.reload();
  };

  useEffect(() => {
    document.documentElement.style.setProperty("--user-theme-color-hue", initialHue);
    getProjectList();
  }, []);

  const ProjectDeleteMessageClose = () => {
    setProjectDeleteMessage(true);
    setTimeout(() => {
      setProjectDeleteMessage(false);
    }, 2000);
  };

  const projectAlreadyExist = () => {
    setResponseExist(true);
    setTimeout(() => {
      setResponseExist(false);
    }, 2000);
  };

  const getProjectList = () => {
    Api.get(`/api/v1/projectCreation/company/user`, {
      params: {
        companyId: companyId,
        userId: userId,
      },
    })
      .then((response) => {
        setIsOwner(response?.data?.data?.isOwner);
        setProjectList(response?.data?.data);
        setIsLoading(false);
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };

  const SignInSchema = Yup.object().shape({
    name: Yup.string()
      .required("Project name is required")
      .min(1, "Enter project valid name")
      .max(25, "Maximum 25 character is allowed")
      .test('no-whitespace', 'Project name cannot contain only whitespace', (value) => {
        return value && value.trim().length > 0;
      }),
    number: Yup.string()
      .required("Project number is required")
      .min(1, "Enter valid project number")
      .max(25, "Maximum 25 characters is allowed")
      .test('no-whitespace', 'Project number cannot contain only whitespace', (value) => {
        return value && value.trim().length > 0;
      }),
    description: Yup.string()
      .required("Project description is required")
      .min(1, "Enter valid project description is required")
      .test('no-whitespace', 'Project description cannot contain only whitespace', (value) => {
        return value && value.trim().length > 0;
      })
      .max(50, "Maximum 50 character is allowed"),
  });

  const submitForm = (values, { resetForm }, id) => {
    Api.post("api/v1/projectCreation/", {
      projectName: values.name,
      projectDesc: values.description,
      projectNumber: values.number,
      projectOwner: owner,
      companyId: companyId,
      userId: userId,
    })
      .then((res) => {
        if (res.status === 201) {
          const projectlistId = res?.data?.data?.createData?.id;
          const createdName = res?.data?.data?.createData?.projectName;

          // ✅ Close the create modal, store created project info, show success message
          setShow(false);
          setIsCreateSubmit(false);
          setCreatedProjectInfo({ id: projectlistId, name: createdName });
          setProjectCreateMessage(true);

          // ✅ After 2 seconds, hide the success message and navigate to the project
          setTimeout(() => {
            setProjectCreateMessage(false);
            history.push({
              pathname: `/project/details/${projectlistId}`,
              state: {
                projctID: projectlistId,
                projectName: createdName,
                companyId: companyId,
              },
            });
          }, 2000);
        } else {
          setIsCreateSubmit(false);
          setAlreadyExistMsg(res?.data?.message);
          projectAlreadyExist();
          resetForm({ values: "" });
        }
      })
      .catch((error) => {
        setIsCreateSubmit(false);
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };


  return (
    <div className="mx-4 mb-5 " style={{ marginTop: "90px" }}>
      {isLoading ? (
        <Loader />
      ) : (
        <div>
          <div className="mttr-sec ">
            <p className=" mb-0 para-tag">Projects</p>
          </div>

          <div className="d-flex justify-content-end mt-4 low-length-responsive">
            <Button className="save-btn  mb-3" variant="secondary" onClick={handleOpenModal} disabled={isLoading}>
              {isLoading ? "Loading..." : "CREATE PROJECT"}
            </Button>
          </div>
          <Table bordered hover className="mt-4" style={{ bottom: "30px" }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Project No</th>
                <th>Project Name</th>
                <th class="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {projectList?.length > 0 ? (
                projectList?.map((list, i) => (
                  <tr className=" mt-3 mb-3">
                    <td className="viewRow ">{i + 1}</td>
                    <td className="viewRow">{list?.projectNumber}</td>
                    <td className="viewRow">{list?.projectName}</td>

                    {role === "admin" || (list.isOwner === true && list.createdBy === userId) ? (
                      <td className="d-flex justify-content-center ">
                        <Dropdown>
                          <Dropdown.Toggle className="dropdown">
                            <FaEllipsisV className="icon" />
                          </Dropdown.Toggle>
                          <Dropdown.Menu right>
                            <Dropdown.Item
                              style={{ textAlign: "center" }}
                              className="user-dropitem-project"
                              onClick={() =>
                                history.push({
                                  pathname: `/project/details/edit/${list?.id}`,
                                  state: {
                                    projectID: list?.id,
                                    company: list?.companyId?.companyName,
                                    project: projectName,
                                  },
                                })
                              }
                            >
                              Project Details
                            </Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item
                              style={{ textAlign: "center" }}
                              className="user-dropitem-project"
                              onClick={() => {
                                history.push({
                                  pathname: `/pbs/${list?.id}`,
                                  state: { projectId: list?.id, state: ["openSidebar", "pbs"], pbsWrite: pbspermission },
                                });
                              }}
                            >
                              Open Project
                            </Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item
                              style={{ textAlign: "center" }}
                              className="user-dropitem-project"
                              onClick={(e) => getDeleteProjectData(list)}
                            >
                              Delete Project
                            </Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item
                              style={{ textAlign: "center", position: "relative" }}
                              className="user-dropitem-project"
                              onClick={() => {
                                setIsLoading(true);
                                setTimeout(() => {
                                  history.push({
                                    pathname: `/permissions/${list?.id}`,
                                    state: {
                                      projectID: list?.id,
                                      companyName: list?.companyId?.companyName,
                                      projectName: list?.projectName,
                                      companyId: list?.companyId?._id,
                                    },
                                  });
                                  setIsLoading(false);
                                }, 500);
                              }}
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <>
                                  <Spinner
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    className="me-2"
                                  />
                                  Loading...
                                </>
                              ) : (
                                "Edit Permission"
                              )}
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                    ) : (
                      <td className="d-flex justify-content-center ">
                        <Dropdown>
                          <Dropdown.Toggle className="dropdown">
                            <FaEllipsisV className="icon" />
                          </Dropdown.Toggle>
                          <Dropdown.Menu right>
                            <Dropdown.Item
                              style={{ textAlign: "center" }}
                              className="user-dropitem-project"
                              onClick={() =>
                                history.push({
                                  pathname: `/project/details/edit/${list?.id}`,
                                  state: {
                                    projectID: list?.id,
                                    company: list?.companyId?.companyName,
                                    project: projectName,
                                  },
                                })
                              }
                            >
                              Project Details
                            </Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item
                              style={{ textAlign: "center" }}
                              className="user-dropitem-project"
                              onClick={() => {
                                history.push({
                                  pathname: `/pbs/${list?.id}`,
                                  state: { projectId: list?.id, state: "openSideBar", pbsWrite: pbspermission },
                                });
                              }}
                            >
                              Open Project
                            </Dropdown.Item>
                            <Dropdown.Divider />
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8">
                    <h6 className="d-flex justify-content-center">No Records to Display</h6>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>

          <div>
            {isLoading && <Loader />}
            <Modal show={show} size="lg" centered backdrop="static">
              <Modal.Body>
                <div className="mttr-sec mt-3 mx-2">
                  <p className=" mb-0 para-tag">Create Project </p>
                </div>
              </Modal.Body>
              <Formik
                initialValues={{
                  name: "",
                  number: "",
                  description: "",
                  owner: "",
                }}
                validationSchema={SignInSchema}
                onSubmit={(values, { resetForm }) => {
                  setIsCreateSubmit(true);
                  submitForm(values, { resetForm });
                }}
              >
                {(formik) => {
                  const { values, handleChange, handleSubmit, handleBlur, isValid, isSubmitting } = formik;
                  return (
                    <div className=" mx-4" style={{ width: "1000px" }}>
                      <Form onSubmit={handleSubmit}>
                        <Card className="card-color">
                          <div className="pb-4 px-4">
                            <Row>
                              <Col>
                                <Form.Group className="mt-3">
                                  <Label notify={true}>Project Name</Label>
                                  <Form.Control
                                    type="name"
                                    className="mt-1"
                                    name="name"
                                    value={values.name}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    id="name"
                                    placeholder="Project Name"
                                  />
                                  <ErrorMessage name="name" component="span" className="error" />
                                </Form.Group>
                              </Col>
                            </Row>
                            <Row>
                              <Col>
                                <Form.Group className="mt-3">
                                  <Label notify={true}>Project Number</Label>
                                  <Form.Control
                                    type="string"
                                    name="number"
                                    id="number"
                                    value={values.number}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className="mt-1"
                                    placeholder="Project Number"
                                  />
                                  <ErrorMessage name="number" component="span" className="error" />
                                </Form.Group>
                              </Col>
                            </Row>
                            <Row>
                              <Col>
                                <Form.Group className="mt-3">
                                  <Label notify={true}>Project Description</Label>
                                  <Form.Control
                                    as="textarea"
                                    type="description"
                                    name="description"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.description}
                                    id="description"
                                    className="mt-1"
                                    rows={4}
                                    placeholder="Project Description"
                                  />
                                  <ErrorMessage name="description" component="span" className="error" />
                                </Form.Group>
                              </Col>
                            </Row>
                          </div>
                        </Card>
                        <Row className="mt-3 mb-4 me-0 pe-0">
                          <Col className="add-project-button me-0 pe-0 ">
                            <Button
                              className="  delete-cancel-btn me-2 "
                              variant="outline-secondary"
                              type="reset"
                              onClick={() => setShow(false)}
                            >
                              CANCEL
                            </Button>
                            <Button className=" save-btn" type="submit" disabled={!isValid || isSubmitting}>
                              <b>{isCreateSubmit ? "Creating..." : "CREATE"}</b>
                            </Button>
                          </Col>
                        </Row>
                      </Form>
                      <Modal show={responseExist} centered className="user-delete-modal-user">
                        <Modal.Body className="modal-body-user">
                          <FontAwesomeIcon icon={faCircleExclamation} fontSize={"40px"} color={"red"} />
                        </Modal.Body>
                        <Modal.Footer
                          className=" d-flex justify-content-center"
                          style={{ borderTop: 0, bottom: "30px" }}
                        >
                          <div>
                            <h4 className="text-center">{alreadyExistMsg}</h4>
                          </div>
                        </Modal.Footer>
                      </Modal>
                    </div>
                  );
                }}
              </Formik>
            </Modal>
          </div>

          {/* ✅ NEW: Project Creation Success Modal */}
          <div>
            <Modal show={projectCreateMessage} centered>
              <div className="d-flex justify-content-center mt-5">
                <FontAwesomeIcon icon={faCircleCheck} fontSize={"40px"} color="#1D5460" />
              </div>
              <Modal.Footer className=" d-flex justify-content-center success-message mt-3 mb-4">
                <div>
                  <h4 className="text-center">Project Created Successfully</h4>
                  {createdProjectInfo.name && (
                    <p className="text-center text-muted mb-0">{createdProjectInfo.name}</p>
                  )}
                </div>
              </Modal.Footer>
            </Modal>
          </div>

          <div>
            {loading && <Loader />}
            <Modal show={confirmDeleteMsg} centered className="project-delete-modal-use" backdrop="static">
              <Modal.Body>
                <div style={{ marginTop: "25px" }}>
                  <h5 className="d-flex justify-content-center">Are you sure you want to delete this project?</h5>
                </div>
                <div className="mx-5 ">
                  {companyName ? (
                    <div className="d-flex mt-5">
                      <b className="text-center">Company Name:</b>
                      <p className="ms-2">{companyName}</p>
                    </div>
                  ) : null}
                  <div className="d-flex mt-3">
                    <b>Project Name:</b>
                    <p className="mx-3">{projectName}</p>
                  </div>
                  <div className="d-flex mt-3">
                    <b>Project Number:</b>
                    <p className="mx-3">{projectNum}</p>
                  </div>
                </div>
              </Modal.Body>
              <Modal.Footer className=" d-flex justify-content-center mt-3" style={{ borderTop: 0, bottom: "30px" }}>
                <Button
                  className="  delete-cancel-btn me-2 "
                  variant="outline-secondary"
                  onClick={() => setConfirmDeleteMsg(false)}
                >
                  NO
                </Button>
                <Button className="save-btn"
                  disabled={loading}
                  onClick={() => {
                    setLoading(true);
                    deleteProject();
                  }}>
                  {loading ? "Deleting..." : "YES"}
                </Button>
              </Modal.Footer>
            </Modal>
          </div>

          <div>
            <Modal show={projectDeleteMessage} centered>
              <div className="d-flex justify-content-center mt-5">
                <FontAwesomeIcon icon={faCircleCheck} fontSize={"40px"} color="#1D5460" />
              </div>
              <Modal.Footer className=" d-flex justify-content-center success-message mt-3 mb-4">
                <div>
                  <h4 className="text-center">Project Deleted Successfully</h4>
                </div>
              </Modal.Footer>
            </Modal>
          </div>
        </div>
      )}
    </div>
  );
}