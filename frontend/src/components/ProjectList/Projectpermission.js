import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card, Form, Table, Modal, Button } from "react-bootstrap";
import Label from "../core/Label";
import "../../css/ProjectList.scss";
import { Formik, ErrorMessage } from "formik";
import { useHistory } from "react-router-dom";
import Select from "react-select";
import Api from "../../Api";
import * as Yup from "yup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { customStyles } from "../core/select";
import { useAuth } from "../../context/AuthContext";

const moduleNames = [
  "Projects",
  "PBS",
  "Failure Rate Prediction",
  "MTTR Prediction",
  "FMECA",
  // "RBD",
  // "FTA",
  "PM MRA",
  "Spare Part Analysis",
  "Safety",
  "Seprate Library",
  "Connected Library",
  "Reports",
];

const deepClone = (obj) => {
  try {
    return structuredClone(obj);
  } catch {
    return JSON.parse(JSON.stringify(obj));
  }
};

const userValidation = Yup.object().shape({
  user: Yup.object().required("User is Required"),
});

export default function Projectpermission(props) {
  const { user } = useAuth();
  const history = useHistory();

  const companyName = props?.location?.state?.companyName; // unused (ok to remove if not needed)
  const projectName = props?.location?.state?.projectName;
  const companyId = props?.location?.state?.companyId;
  const projectId = props?.location?.state?.projectID;

  const userId = user?._id;
  const companyIdLocal = user?.companyId;

  const [userData, setUserData] = useState([]);
  const [permissions, setPermissions] = useState(moduleNames.map((name) => ({ name, read: false, write: false })));

  const [permissionId, setPermissionId] = useState(null);
  const [responseMessage, setResponseMessage] = useState("");
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [initialPermissions, setInitialPermissions] = useState(() => deepClone(permissions));
  const [initialUserId, setInitialUserId] = useState(null);

  // used to ignore stale permission responses
  const permReqSeq = useRef(0);

  const logout = useCallback(() => {
    localStorage.clear();
    history.push("/login");
    window.location.reload();
  }, [history]);

  const showModalAndRedirect = useCallback(() => {
    setShow(true);
    setTimeout(() => {
      setShow(false);
      //history.push("/project/list");
    }, 2000);
  }, [history]);

  const userOptions = useMemo(
    () => userData.map((u) => ({ value: u._id, label: u.name })),
    [userData]
  );

  const arePermissionsEqual = useCallback((a, b) => {
    if (!a || !b || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i].read !== b[i].read || a[i].write !== b[i].write) return false;
    }
    return true;
  }, []);

  const handlePermissionChange = useCallback((index, field) => {
    setPermissions((prev) => {
      const next = [...prev];
      const curr = next[index];

      // keep your original rule: write only possible if read is true (UI also disables)
      const updated = { ...curr, [field]: !curr[field] };

      // optional safety: if read is turned off, force write off
      if (field === "read" && updated.read === false) updated.write = false;

      next[index] = updated;
      return next;
    });
  }, []);

  const normalizePermissionsFromApi = useCallback((apiModules) => {
    return moduleNames.map((moduleName) => {
      const m = apiModules?.find((mod) => mod.name === moduleName);
      return {
        name: moduleName,
        read: !!m?.read,
        write: !!m?.write,
      };
    });
  }, []);

  const getPermissionData = useCallback(
    (authorizedId) => {
      const seq = ++permReqSeq.current;
      setIsLoading(true);

      Api.get(`/api/v1/projectPermission/list`, {
        params: { projectId, authorizedPersonnel: authorizedId, userId },
      })
        .then((res) => {
          // ignore stale responses
          if (seq !== permReqSeq.current) return;

          const data = res?.data?.data;
          setPermissionId(data?._id ?? null);

          const nextPerms = data?.modules
            ? normalizePermissionsFromApi(data.modules)
            : moduleNames.map((name) => ({ name, read: false, write: false }));

          setPermissions(nextPerms);
          setInitialPermissions(deepClone(nextPerms));
          setInitialUserId(authorizedId);
        })
        .catch((err) => {
          if (err?.response?.status === 401) logout();
        })
        .finally(() => {
          if (seq === permReqSeq.current) setIsLoading(false);
        });
    },
    [logout, normalizePermissionsFromApi, projectId, userId]
  );

  const getUsers = useCallback(() => {
    setIsLoading(true);

    Api.get("/api/v1/user/list", {
      params: { companyId: companyIdLocal, userId },
    })
      .then((res) => {
        const data = res?.data?.usersList || [];
        setUserData(data);

        if (data.length > 0) {
          // fetch first user's permissions immediately
          getPermissionData(data[0]._id);
        }
      })
      .catch((err) => {
        if (err?.response?.status === 401) logout();
      })
      .finally(() => setIsLoading(false));
  }, [companyIdLocal, getPermissionData, logout, userId]);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const permissionUpdate = useCallback(
    (values) => {
      const selectedUserId = values.user?.value;

      const noChanges =
        selectedUserId === initialUserId &&
        arePermissionsEqual(permissions, initialPermissions);

      if (noChanges) {
        setResponseMessage("No changes to save.");
        showModalAndRedirect();
        return;
      }

      setIsLoading(true);

      Api.post(`/api/v1/projectPermission`, {
        modules: permissions,
        accessType: "Read",
        authorizedPersonnel: selectedUserId,
        companyId,
        projectId,
        createdBy: selectedUserId,
        modifiedBy: userId,
        projectPermissionId: permissionId,
        userId,
      })
        .then((res) => {
          setInitialPermissions(deepClone(permissions));
          setInitialUserId(selectedUserId);
          setResponseMessage(res?.data?.message || "Permissions updated successfully!");
          showModalAndRedirect();
        })
        .catch((err) => {
          setResponseMessage(err?.response?.data?.message || "Error updating permissions");
          showModalAndRedirect();
          if (err?.response?.status === 401) logout();
        })
        .finally(() => setIsLoading(false));
    },
    [
      arePermissionsEqual,
      companyId,
      initialPermissions,
      initialUserId,
      logout,
      permissionId,
      permissions,
      projectId,
      showModalAndRedirect,
      userId,
    ]
  );

  // choose current selected user from initialUserId (first load) or null
  const initialFormikUser = useMemo(() => {
    if (!initialUserId) return null;
    const u = userData.find((x) => x._id === initialUserId);
    return u ? { value: u._id, label: u.name } : null;
  }, [initialUserId, userData]);

  return (
    <div className="mx-4" style={{ marginTop: "90px" }}>
      <Formik
        enableReinitialize
        initialValues={{ user: initialFormikUser }}
        validationSchema={userValidation}
        onSubmit={permissionUpdate}
      >
        {(formik) => {
          const { values, handleSubmit, setFieldValue } = formik;

          const disableSave =
            isLoading ||
            !values.user ||
            (values.user?.value === initialUserId &&
              arePermissionsEqual(permissions, initialPermissions));

          return (
            <Form onSubmit={handleSubmit}>
              <div className="mttr-sec">
                <p className="mb-0 para-tag">Project Permission</p>
              </div>

              <Card className="mt-2 card-color">
                <div className="project-name">
                  <h5 className="text-center mt-4">
                    <b>{projectName}</b>
                  </h5>
                </div>
                <hr className="mx-2" />

                <div className="d-flex justify-content-center">
                  <Form.Group className="project-permission-select">
                    <Label notify={true}>Authorized Personnel</Label>
                    <Select
                      name="user"
                      styles={customStyles}
                      placeholder="Select User"
                      value={values.user}
                      className="mt-1"
                      isDisabled={isLoading}
                      onChange={(e) => {
                        setFieldValue("user", e);
                        if (e?.value) getPermissionData(e.value);
                      }}
                      options={userOptions}
                    />
                    <ErrorMessage name="user" component="span" className="error" />
                  </Form.Group>
                </div>

                <Table bordered className="mt-4">
                  <thead>
                    <tr>
                      <td>
                        <Label notify={true}>
                          <b>Modules</b>
                        </Label>
                      </td>
                      <td className="d-flex justify-content-center">
                        <b>Read/Write</b>
                      </td>
                    </tr>
                  </thead>

                  <tbody>
                    {permissions.map((permission, index) => (
                      <tr key={permission.name}>
                        <td>{permission.name}</td>
                        <td className="edit-project-list">
                          <Form.Check
                            type="checkbox"
                            checked={permission.read}
                            onChange={() => handlePermissionChange(index, "read")}
                            disabled={isLoading}
                          />
                          <span className="ms-3 me-5">Read</span>

                          <Form.Check
                            type="checkbox"
                            checked={permission.write}
                            onChange={() => handlePermissionChange(index, "write")}
                            disabled={isLoading || !permission.read}
                          />
                          <span className="ms-3">Write</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card>

              <div className="d-flex justify-content-end my-3">
                <Button
                  className="delete-cancel-btn me-2 mb-5"
                  variant="outline-secondary"
                  type="button"
                  onClick={() => history.push("/project/list")}
                  disabled={isLoading}
                >
                  CANCEL
                </Button>

                <Button
                  className="save-btn mb-5"
                  type="submit"
                  disabled={disableSave}
                  style={{
                    opacity: disableSave ? 0.5 : 1,
                    cursor: disableSave ? "not-allowed" : "pointer",
                    filter: disableSave ? "blur(0.5px)" : "none",
                    transition: "all 0.3s ease",
                  }}
                >
                  {isLoading ? "SAVING..." : "SAVE CHANGES"}
                </Button>
              </div>

              <Modal show={show} centered>
                <Modal.Body className="modal-body-user">
                  <FontAwesomeIcon icon={faCircleCheck} fontSize={"40px"} color="#1d5460" />
                </Modal.Body>
                <Modal.Footer className="d-flex justify-content-center" style={{ borderTop: 0, bottom: "30px" }}>
                  <h4>{responseMessage}</h4>
                </Modal.Footer>
              </Modal>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
}
