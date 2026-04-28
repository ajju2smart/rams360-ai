import React, { useMemo } from "react";
import { Col, Row, Button } from "react-bootstrap";
import "../../css/Reports.scss";
import * as XLSX from "xlsx";
import { FaFileExcel } from "react-icons/fa";
import Loader from "../core/Loader";
import FirstPageReport from "./FirstPageReport.js";
import LastPageReport from "./LastPageReport.js";
import { useReportData } from "../hooks/useReportData";
 
const PM_headerKeyMapping = {
  Id: "indexCount",
  "Product Name": "productName", "Part Number": "partNumber",
  Quantity: "quantity", Reference: "reference", Category: "category",
  "Part Type": "partType", Environment: "environment", Temperature: "temperature",
  FR: "fr", MTTR: "mttr", MCT: "mct", MLH: "mlh",
  "PM Task ID": "pmTaskId", "PM Task Type": "pmTaskType",
  "Task Intervel Frequency": "taskIntrvlFreq", "Task Intervel Unit": "taskIntrvlUnit",
  "Latitude/Frequency Tolerence": "LatitudeFreqTolrnc",
  "Scheduled Maintenance Task": "scheduleMaintenceTsk",
  "Task Intervel Determination": "tskInteralDetermination",
  "Task Description": "taskDesc",
  "Task Time at ML1": "tskTimeML1", "Task Time at ML2": "tskTimeML2",
  "Task Time at ML3": "tskTimeML3", "Task Time at ML4": "tskTimeML4",
  "Task Time at ML5": "tskTimeML5", "Task Time at ML6": "tskTimeML6",
  "Task Time at ML7": "tskTimeML7",
  "Skill 1": "skill1", "Skill 1 Nos": "skillOneNos",
  "Skill 1 Contribution %": "skillOneContribution",
  "Skill 2": "skill2", "Skill 2 Nos": "skillTwoNos",
  "Skill 2 Contribution %": "skillTwoContribution",
  "Skill 3": "skill3", "Skill 3 Nos": "skillThreeNos",
  "Skill 3 Contribution %": "skillThreeContribution",
  "Additional Replacement Spare 1": "addiReplaceSpare1",
  "Additional Replacement Spare 1 Qty": "addiReplaceSpare1Qty",
  "Additional Replacement Spare 2": "addiReplaceSpare2",
  "Additional Replacement Spare 2 Qty": "addiReplaceSpare2Qty",
  "Additional Replacement Spare 3": "addiReplaceSpare3",
  "Additional Replacement Spare 3 Qty": "addiReplaceSpare3Qty",
  "Consumable 1": "consumable1", "Consumable 1 Qty": "consumable1Qty",
  "Consumable 2": "consumable2", "Consumable 2 Qty": "consumable2Qty",
  "Consumable 3": "consumable3", "Consumable 3 Qty": "consumable3Qty",
  "Consumable 4": "consumable4", "Consumable 4 Qty": "consumable4Qty",
  "Consumable 5": "consumable5", "Consumable 5 Qty": "consumable5Qty",
  "User Field 1": "userField1", "User Field 2": "userField2",
  "User Field 3": "userField3", "User Field 4": "userField4",
  "User Field 5": "userField5",
};
 
const PM_HEADERS = [
  "S.No", "Id", "Product Name", "Part Number", "Quantity", "Reference",
  "Category", "Part Type", "Environment", "Temperature", "FR", "MTTR", "MCT", "MLH",
  "PM Task ID", "PM Task Type", "Task Intervel Frequency", "Task Intervel Unit",
  "Latitude/Frequency Tolerence", "Scheduled Maintenance Task",
  "Task Intervel Determination", "Task Description",
  "Task Time at ML1", "Task Time at ML2", "Task Time at ML3", "Task Time at ML4",
  "Task Time at ML5", "Task Time at ML6", "Task Time at ML7",
  "Skill 1", "Skill 1 Nos", "Skill 1 Contribution %",
  "Skill 2", "Skill 2 Nos", "Skill 2 Contribution %",
  "Skill 3", "Skill 3 Nos", "Skill 3 Contribution %",
  "Additional Replacement Spare 1", "Additional Replacement Spare 1 Qty",
  "Additional Replacement Spare 2", "Additional Replacement Spare 2 Qty",
  "Additional Replacement Spare 3", "Additional Replacement Spare 3 Qty",
  "Consumable 1", "Consumable 1 Qty", "Consumable 2", "Consumable 2 Qty",
  "Consumable 3", "Consumable 3 Qty", "Consumable 4", "Consumable 4 Qty",
  "Consumable 5", "Consumable 5 Qty",
  "User Field 1", "User Field 2", "User Field 3", "User Field 4", "User Field 5",
];
 
function PreventiveManitenance(props) {
  const {
    projectId, selectModuleFieldValue: reportType,
    hierarchyType, selectModule: moduleType,
  } = props;
 
  const { projectData, data, isLoading } = useReportData({
    projectId,
    reportEndpoint: "/api/v1/reports/get/preventive/report",
    reportType, hierarchyType,
    skip: reportType == 5,
  });
 
  const preventiveData = useMemo(() =>
    (data ?? []).flatMap((item) => {
      const productId = item?.productId || {};
      const pmmraItems = Array.isArray(item?.pmmraData)
        ? item.pmmraData
        : item?.pmmraData && Object.keys(item.pmmraData).length > 0
          ? [item.pmmraData] : [];
      if (pmmraItems.length === 0) return [{ productId, pmmraData: {} }];
      return pmmraItems.map((p) => ({ productId, pmmraData: p }));
    }),
    [data]
  );
 
  const exportToExcel = () => {
    if (!projectData) return;
    const mainContentData = [
      [], [], ["Project Report"], [],
      ["Project Name", projectData.projectName || ""],
      ["Project Number", projectData.projectNumber || ""],
      ["Project Description", projectData.projectDesc || ""],
      [],
      PM_HEADERS,
      ...preventiveData.map((row, i) =>
        PM_HEADERS.map((h) => {
          if (h === "S.No") return i + 1;
          const key = PM_headerKeyMapping[h];
          return row.productId?.[key] ?? row.pmmraData?.[key] ?? "-";
        })
      ),
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
      [], [], ["Project Name", projectData.projectName || ""],
      ["Document Title", "Preventive Maintainence"],
    ]), "First Page");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(mainContentData), "Main Content");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
      [], [], ["Last Page"],
    ]), "Last Page");
    XLSX.writeFile(wb, "preventive_maintenance.xlsx");
  };
 
  if (isLoading) return <Loader />;
 
  return (
    <div>
      <div className="mt-3" />
      {preventiveData.length > 0 ? (
        <div>
          <Row className="d-flex align-items-center justify-content-end">
            <Col className="d-flex justify-content-end">
              <Button className="report-save-btn" onClick={exportToExcel} style={{ marginRight: "8px" }}>
                <FaFileExcel style={{ marginRight: "8px" }} /> Excel
              </Button>
            </Col>
          </Row>
          <div className="sheet-container mt-3">
            <div className="sheet" id="pdf-report-content">
              <div id="first-page-report">
                <FirstPageReport projectId={projectId} moduleType={moduleType} />
              </div>
              <Row className="d-flex justify-content-between">
                <Col className="d-flex flex-column align-items-center" />
                <Col className="d-flex flex-column align-items-center">
                  <h5>{projectData?.projectName}</h5>
                  <h5>Preventive Maintenance</h5>
                </Col>
                <Col className="d-flex flex-column align-items-center">
                  <h5>Rev:</h5><h5>Rev Date:</h5>
                </Col>
              </Row>
              <div className="sheet-content">
                <div className="field"><label>Project Name:</label><span>{projectData?.projectName}</span></div>
                <div className="field"><label>Project Number:</label><span>{projectData?.projectNumber}</span></div>
                <div className="field"><label>Project Description:</label><span>{projectData?.projectDesc}</span></div>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table className="report-table">
                  <thead>
                    <tr>{PM_HEADERS.map((h) => <th key={h} style={{ textAlign: "center" }}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {preventiveData.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {PM_HEADERS.map((h) => {
                          if (h === "S.No") return <td key={h} style={{ textAlign: "center" }}>{rowIndex + 1}</td>;
                          const key = PM_headerKeyMapping[h];
                          let val = row.productId[key] ?? row.pmmraData[key] ?? "-";
                          if (h === "FR" && typeof val === "number") val = val.toFixed(6);
                          return <td key={h} style={{ textAlign: "center" }}>{val}</td>;
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div id="last-page-report">
            <LastPageReport projectId={projectId} moduleType={moduleType} />
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", width: "100%", justifyContent: "center" }}>
          <h3>No Records to Display</h3>
        </div>
      )}
    </div>
  );
}
 
export { PreventiveManitenance as default };