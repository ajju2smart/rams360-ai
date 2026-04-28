import React, { useEffect, useState } from "react";
import TreeView from "@mui/lab/TreeView";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import TreeItem from "@mui/lab/TreeItem";
import ArrowRight from "@mui/icons-material/ArrowRight";
import { useHistory } from "react-router-dom";
import FailureRatePrediction from "../FailureRatePrediction";
import Api from "../../Api";

import "./index.css";
import { Button } from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";

const Tree = (props) => {
  const { user } = useAuth();
  const projectId = props.data[0]?.projectId?._id;
  const [expand, setExpand] = useState([]);
  const [nRoot, setRoot] = useState();
  const [expandAll, setExapndAll] = useState([]);
  const history = useHistory();
   const userId = user?._id;

  const expandEvent = () => {
    setExpand((n) => (n.length === 0 ? [Array.length] : []));
  };
  const collapseEvent = () => {
    setExpand([]);
  };

  const handleChange = (e, n) => {
    setExpand(n);
  };

  // Log out
  const logout = () => {
    localStorage.clear(history.push("/login"));
    window.location.reload();
  };

  const getTreedata = () => {
    Api.get(`/api/v1/productTreeStructure/product/list`, {
      params: {
        projectId: projectId,
        userId: userId,
      },
    })
      .then((res) => {
        const treeData = res?.data?.data;

        setExapndAll(treeData);
      })
      .catch((error) => {
        const errorStatus = error?.response?.status;
        if (errorStatus === 401) {
          logout();
        }
      });
  };
  useEffect(() => {
    getTreedata();
  }, [expand]);

  return (
    <>
      {/* <Button onClick={expandEvent}>Expand</Button> */}
      <Button variant="secondary" className="FRP-button mb-2" onClick={collapseEvent}>
        Collpase
      </Button>{" "}
      {props?.data?.map((res) => {
        return <TreeStructureView data={res.treeStructure} mainData={res} expand={expand} func={handleChange} />;
      })}
    </>
  );
};

export default Tree;

const TreeStructureView = ({ data, expand, func, mainData }) => {
  const [backColor, setBackColor] = useState("");
  const history = useHistory();
  const renderTree = (nodes) => (
    <TreeItem
      key={nodes.id}
      nodeId={nodes.id}
      label={<h5 className="mb-0 mx-2">{nodes.productName}</h5>}
      style={{ height: "auto" }}
      onClick={() => {
        history.push(<FailureRatePrediction data={nodes} mainData={mainData} />);
        setBackColor(nodes.id);
      }}
    >
      <p>{Array.isArray(nodes.children) ? nodes.children.map((node) => renderTree(node)) : null}</p>
    </TreeItem>
  );
  return (
    <TreeView
      style={{ height: "auto" }}
      aria-label="rich object"
      defaultCollapseIcon={<ExpandMoreIcon style={{ fontSize: "28px" }} />}
      defaultExpandIcon={<ChevronRightIcon style={{ fontSize: "1.5rem" }} />}
      expanded={expand}
      sx={{ height: 110, flexGrow: 1, maxWidth: 400, overflowY: "auto" }}
      onNodeToggle={func}
      defaultExpanded={[data.children.id]}
      defaultValue={[data.children.id]}
    >
      {renderTree(data)}
    </TreeView>
  );
};
