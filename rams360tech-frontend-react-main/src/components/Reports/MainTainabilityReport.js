// ─────────────────────────────────────────────────────────────────────────────
// MainTainabilityReport.js  (fixed)
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useMemo } from "react";
import { Col, Form, Row, Button } from "react-bootstrap";
import "../../css/Reports.scss";
import * as XLSX from "xlsx";
import { FaFileExcel } from "react-icons/fa";
import Loader from "../core/Loader";
import FirstPageReport from "./FirstPageReport.js";
import LastPageReport from "./LastPageReport.js";
import { useMultiReportData } from "../hooks/useReportData";

const headerKeyMapping = {
  Id: "indexCount",
  "Product Name": "productName", "Part Number": "partNumber",
  Quantity: "quantity", Reference: "reference", Category: "category",
  "Part Type": "partType", Environment: "environment", Temperature: "temperature",
  FR: "fr", MTTR: "mttr", MCT: "mct", MLH: "mlh",
  Repairable: "repairable", "Level of Repair": "levelOfRepair",
  "Level of Replace": "levelOfReplace", Spare: "spare", Mmax: "mMax",
  Remarks: "remarks",
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

const header1 = [
  "S.No", "Id", "Product Name", "Part Number", "Quantity", "Reference",
  "Category", "Part Type", "Environment", "Temperature", "FR",
  "MTTR", "MCT", "MLH", "Repairable", "Level of Repair", "Level of Replace",
  "Spare", "Mmax", "Remarks",
];

const header2 = [
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

const combinedHeaders = [...header1, ...header2];

function MaintainabilityReport(props) {
  const {
    projectId,
    selectModuleFieldValue: reportType,
    hierarchyType,
    selectModule: moduleType,
  } = props;

  const { projectData, data, isLoading } = useMultiReportData({
    projectId,
    reportEndpoint: "/api/v1/reports/get/maintainability/report",
    secondaryEndpoints: [],
    reportType,
    hierarchyType,
    skip: reportType == 5,
  });

  const [columnVisibility, setColumnVisibility] = useState(
    Object.fromEntries(header2.map((h) => [h, true]))
  );

  const handleColumnVisibilityChange = ({ target: { name, checked } }) =>
    setColumnVisibility((prev) => ({ ...prev, [name]: checked }));

  // Flatten: one row per PMMRA record (or one row if no PMMRA)
  const safeData = useMemo(() =>
    (data ?? []).flatMap((item) => {
      const productId = item?.productId || {};
      const mttrData = item?.mttrData?.[0] || {};
      const pmmraRecords = item?.pmmraData;
      if (Array.isArray(pmmraRecords) && pmmraRecords.length > 0) {
        return pmmraRecords.map((p) => ({ productId, mttrData, pmmraData: p }));
      }
      return [{ productId, mttrData, pmmraData: {} }];
    }),
    [data]
  );

  const exportToExcel = () => {
    if (!projectData) return;
    const visibleHeaders = [...header1, ...header2.filter((h) => columnVisibility[h])];
    const mainContentData = [
      [], [], ["Project Report"], [],
      ["Project Name", projectData.projectName || ""],
      ["Project Number", projectData.projectNumber || ""],
      ["Project Description", projectData.projectDesc || ""],
      [],
      visibleHeaders,
      ...safeData.map((row) =>
        visibleHeaders.map((h) => {
          if (h === "S.No") return safeData.indexOf(row) + 1;
          const key = headerKeyMapping[h];
          return row.productId?.[key] ?? row.mttrData?.[key] ?? row.pmmraData?.[key] ?? "-";
        })
      ),
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
      [], [],
      ["Project Name", projectData.projectName || ""],
      ["Document Title", "Maintainability Report"],
    ]), "First Page");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(mainContentData), "Main Content");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
      [], [], ["Last Page"],
    ]), "Last Page");
    XLSX.writeFile(wb, "maintainability_analysis.xlsx");
  };

  if (isLoading) return <Loader />;

  return (
    <div>
      <div className="mt-3" />
      {safeData.length > 0 ? (
        <>
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
                  <h5>Maintainability Analysis</h5>
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

              <div style={{ overflowX: "auto", marginBottom: "10px" }}>
                <Row className="d-flex align-items-center">
                  <Col className="d-flex flex-row custom-checkbox-group">
                    {header2.map((item) => (
                      <Form.Check
                        key={item} type="checkbox" name={item} label={item}
                        checked={columnVisibility[item]}
                        onChange={handleColumnVisibilityChange}
                        className="custom-checkbox ml-5"
                      />
                    ))}
                  </Col>
                </Row>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table className="report-table">
                  <thead>
                    <tr>
                      {header1.map((h) => <th key={h} style={{ textAlign: "center" }}>{h}</th>)}
                      {header2.filter((h) => columnVisibility[h]).map((h) => (
                        <th key={h} style={{ textAlign: "center" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {safeData.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {combinedHeaders.map((h) => {
                          if (header2.includes(h) && !columnVisibility[h]) return null;
                          if (h === "S.No") return <td key={h} style={{ textAlign: "center" }}>{rowIndex + 1}</td>;
                          const key = headerKeyMapping[h];
                          let val = row.productId[key] ?? row.mttrData[key] ?? row.pmmraData[key] ?? "-";
                          if (h === "FR" && typeof val === "number") val = val.toFixed(6);
                          return <td key={h} style={{ textAlign: "center" }}>{val}</td>;
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div id="last-page-report">
                <LastPageReport projectId={projectId} moduleType={moduleType} />
              </div>
            </div>
          </div>
        </>
      ) : (
        <div style={{ display: "flex", width: "100%", justifyContent: "center" }}>
          <h3>No Records to Display</h3>
        </div>
      )}
    </div>
  );
}

export { MaintainabilityReport as default };