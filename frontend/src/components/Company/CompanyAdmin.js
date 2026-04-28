import React, { useEffect, useState } from "react";
import { Table, Button, Form, Modal } from "react-bootstrap";
import Api from "../../Api";
import { useHistory } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPen, faKey } from "@fortawesome/free-solid-svg-icons";
import Label from "../LabelComponent";
import { useAuth } from "../../context/AuthContext";
import Tooltip from "@mui/material/Tooltip";

function CompanyAdmin() {
  const { user } = useAuth();
  const history = useHistory();
  const userId = user?._id;

  const [data, setData] = useState([]);

  const [editUser, setEditUser] = useState({
    id: "",
    name: "",
    email: "",
    phoneNumber: "",
    companyName: "",
    role: "",
  });

  const [editMode, setEditMode] = useState(false);

  const [passwordModal, setPasswordModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // ===============================
  // Logout
  // ===============================
  const logout = () => {
    localStorage.clear();
    history.push("/login");
    window.location.reload();
  };

  // ===============================
  // Fetch Users
  // ===============================
  const getAllCompanyUsers = () => {
    Api.get("/api/v1/user/company/all", {
      headers: { userId },
    })
      .then((res) => {
        setData(res?.data?.companyUsersList || []);
      })
      .catch((error) => {
        if (error?.response?.status === 401) logout();
      });
  };

  useEffect(() => {
    if (userId) getAllCompanyUsers();
  }, [userId]);

  // ===============================
  // Delete User
  // ===============================
  const deleteUser = (id) => {
    Api.delete(`/api/v1/user/${id}`, {
      headers: { userId },
    })
      .then((res) => {
        alert(res?.data?.message || "User deleted");
        getAllCompanyUsers();
      })
      .catch((error) => {
        if (error?.response?.status === 401) logout();
      });
  };

  // ===============================
  // Edit User
  // ===============================
  const handleEditClick = (user) => {
    setEditUser({
      id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      companyName: user.companyId?.companyName,
      role: user.role,
    });
    setEditMode(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEdit = () => {
    const { id, ...userData } = editUser;

    Api.patch(`/api/v1/user/${id}`, userData, {
      headers: { userId },
    })
      .then((res) => {
        alert(res?.data?.message || "User updated successfully");
        setEditMode(false);
        getAllCompanyUsers();
      })
      .catch((error) => {
        if (error?.response?.status === 401) logout();
      });
  };

  // ===============================
  // Change Password
  // ===============================
  const handlePasswordModal = (user) => {
    setSelectedUserId(user._id);
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
    setPasswordModal(true);
  };

  const handleChangePassword = () => {
    // Basic validation
    if (!newPassword || !confirmPassword) {
      setPasswordError("All fields are required");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setPasswordError("");

    Api.patch(
      `/api/v1/user/resetpassword/${selectedUserId}`, // change if needed
      { password: newPassword, confirmPassword: confirmPassword },
      { headers: { userId } }
    )
      .then((res) => {
        alert(res?.data?.message || "Password updated successfully");
        setPasswordModal(false);
      })
      .catch((error) => {
        if (error?.response?.status === 401) logout();
      });
  };
  
  return (
    <div className="mx-4 company-main-div">
      <div className="mttr-sec">
        <p className="mb-0 para-tag">User Informations</p>
      </div>

      <Table hover bordered>
        <thead>
          <tr>
            <th>S.No</th>
            <th>User Name</th>
            <th>Email Address</th>
            <th>Phone Number</th>
            <th>Company Name</th>
            <th>Role</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {data?.length > 0 ? (
            data.map((list, key) => (
              <tr key={list.id}>
                <td>{key + 1}</td>
                <td>{list?.name}</td>
                <td>{list?.email}</td>
                <td>{list?.phoneNumber}</td>
                <td>{list?.companyId?.companyName}</td>
                <td>{list?.role}</td>
                <td>
                  {/* Delete */}
                  <Tooltip title="Delete User" arrow>
                    <FontAwesomeIcon
                      icon={faTrash}
                      style={{ color: "#e60f45", cursor: "pointer" }}
                      className="me-3"
                      onClick={() => deleteUser(list.id)}
                    />
                  </Tooltip>

                  {/* Edit */}
                  <Tooltip title="Edit User" arrow>
                    <FontAwesomeIcon
                      icon={faPen}
                      style={{ color: "#1D5460", cursor: "pointer" }}
                      className="me-3"
                      onClick={() => handleEditClick(list)}
                    />
                  </Tooltip>

                  {/* Change Password */}
                  <Tooltip title="Change Password" arrow>
                    <FontAwesomeIcon
                      icon={faKey}
                      style={{ color: "#f39c12", cursor: "pointer" }}
                      onClick={() => handlePasswordModal(list)}
                    />
                  </Tooltip>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center">
                Users yet to be created
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* ================= Edit Modal ================= */}
      <Modal show={editMode} onHide={() => setEditMode(false)} centered>
        <div style={{ width: "500px" }}>
          <Modal.Header closeButton>
            <Modal.Title>Edit User</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Label>Name</Label>
              <Form.Control
                type="text"
                name="name"
                value={editUser.name}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group>
              <Label>Email</Label>
              <Form.Control
                type="text"
                name="email"
                value={editUser.email}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group>
              <Label>Phone Number</Label>
              <Form.Control
                type="text"
                name="phoneNumber"
                value={editUser.phoneNumber}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group>
              <Label>Company Name</Label>
              <Form.Control
                type="text"
                value={editUser.companyName}
                disabled
              />
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={() => setEditMode(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleEdit}>
              Save Changes
            </Button>
          </Modal.Footer>
        </div>
      </Modal>

      {/* ================= Change Password Modal ================= */}
      <Modal
        show={passwordModal}
        onHide={() => setPasswordModal(false)}
        centered
      >
        <div style={{ width: "400px" }}>
          <Modal.Header closeButton>
            <Modal.Title>Change Password</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Form.Group className="mb-3">
              <Label>New Password</Label>
              <Form.Control
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Label>Confirm Password</Label>
              <Form.Control
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
              />
            </Form.Group>

            {passwordError && (
              <p style={{ color: "red", fontSize: "14px" }}>
                {passwordError}
              </p>
            )}
          </Modal.Body>

          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setPasswordModal(false)}
            >
              Cancel
            </Button>

            <Button
              variant="primary"
              onClick={handleChangePassword}
              disabled={!newPassword || !confirmPassword}
            >
              Update Password
            </Button>
          </Modal.Footer>
        </div>
      </Modal>
    </div>
  );
}

export default CompanyAdmin;