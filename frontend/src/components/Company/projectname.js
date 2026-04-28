import React, { useEffect, useState } from "react";
import { Col, Row } from "reactstrap";
import Api from "../../Api";
import { useHistory } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Projectname(props) {
  const { user } = useAuth();
  const projectId = props?.projectId;
  const [companyName, setCompanyName] = useState();
  const [projectName, setProjectName] = useState();
  const history = useHistory();
  const userId = user?._id;

  const getProjectDetails = () => {
    Api.get(`/api/v1/projectCreation/${projectId}`, {
      headers: { userId: userId },
    })
      .then((response) => {
        setCompanyName(response?.data?.data?.companyId?.companyName);
        setProjectName(response?.data?.data?.projectName);
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };

  // Log out
  const logout = () => {
    localStorage.clear(history.push("/login"));
    window.location.reload();
  };

  useEffect(() => {
    getProjectDetails();
  }, []);
  return (
    <Row>
      <div className="mttr-sec">
        <h5 className="mb-0 para-tag_1 p-1" style={{ fontSize: "15px" }}>
          Project Name: {companyName} {projectName}
        </h5>
      </div>
    </Row>
  );
}

export default Projectname;
