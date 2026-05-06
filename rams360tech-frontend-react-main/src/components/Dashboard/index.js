import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import SuperAdminDashboard from "./SuperAdminDashboard";

const Dashboard = () => {
  const { user } = useAuth();
  const role = user?.role;
  const history = useHistory();

  useEffect(() => {
    if (role === "admin" || role === "Employee") {
      history.push("/project/list");
    }
    // SuperAdmin stays on /dashboard — rendered below
  }, [role, history]);

  if (role === "SuperAdmin") {
    return <SuperAdminDashboard />;
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <h2>401</h2>
      <h3>You're not authorized to this page</h3>
      <button onClick={() => window.history.back()} style={{ padding: "10px 20px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
        Go Back
      </button>
    </div>
  );
};

export default Dashboard;
