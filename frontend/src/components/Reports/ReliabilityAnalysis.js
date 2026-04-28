import React from "react";
import { Col, Row, Button } from "react-bootstrap";
import "../../css/Reports.scss";
import * as XLSX from "xlsx";
import { FaFileExcel } from "react-icons/fa";
import Loader from "../core/Loader";
import FirstPageReport from "./FirstPageReport.js";
import LastPageReport from "./LastPageReport.js";
import { useMultiReportData } from "../hooks/useReportData";

const headerKeyMapping = {
  Id: "indexCount",
  "Part Name": "productName",
  "Part Number": "partNumber",
  Quantity: "quantity",
  Reference: "reference",
  Category: "category",
  "Part Type": "partType",
  Environment: "environment",
  Temperature: "temperature",
  FR: "fr",
  MTTR: "mttr",
  MCT: "mct",
  MLH: "mlh",
  Source: "source",
  Predicted: "predicted",
  "Duty Cycle": "dutyCycle",
  "FR Distribution": "frDistribution",
  "FR Remarks": "frRemarks",
  Standard: "standard",
  "FR Offset Operand": "frOffsetOperand",
  "Failure Rate Offset": "failureRateOffset",
  "FR Unit": "frUnit",
  MTBF: "mtbfHours",
};

const HEADERS = [
  "Id", "Part Name", "Part Number", "Quantity", "Reference", "Category",
  "Part Type", "Environment", "Temperature", "FR",
  "Source", "Predicted", "Duty Cycle", "FR Distribution", "FR Remarks",
  "Standard", "FR Offset Operand", "Failure Rate Offset", "FR Unit", "MTBF",
];

const columnWidths = {
  Source: "130px", Predicted: "120px", "Duty Cycle": "80px",
  "FR Distribution": "130px", "FR Remarks": "100px", Standard: "100px",
  "FR Offset Operand": "120px", "Failure Rate Offset": "120px", "FR Unit": "60px",
};

function ReliabilityAnalysis(props) {
  const {
    projectId,
    selectModuleFieldValue: reportType,
    hierarchyType,
    selectModule: moduleType,
  } = props;

  const { projectData, data, isLoading } = useMultiReportData({
    projectId,
    reportEndpoint: "/api/v1/reports/get/reliablility/report",
    secondaryEndpoints: [],
    reportType,
    hierarchyType,
    skip: reportType == 5,
  });

  const safeData = (data ?? []).map((item) => ({
    productId: item?.productId || {},
    failureRatePrediction: item?.failureRatePrediction || {},
  }));

  const exportToExcel = () => {
    if (!projectData) return;

    const mainContentData = [
      [], [], ["Project Report"], [],
      ["Project Name", projectData.projectName || ""],
      ["Project Number", projectData.projectNumber || ""],
      ["Project Description", projectData.projectDesc || ""],
      [],
      HEADERS,
      ...safeData.map((row) =>
        HEADERS.map((h) => {
          const key = headerKeyMapping[h];
          let val = row.productId[key] ?? row.failureRatePrediction[key] ?? "-";
          if (h === "FR" && typeof val === "number") val = parseFloat(val.toFixed(6));
          return val;
        })
      ),
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
      [], [], ["Project Name", projectData.projectName || ""],
      ["Document Title", "Reliability Analysis"],
    ]), "First Page");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(mainContentData), "Main Content");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([[], [], ["Last Page"]]), "Last Page");
    XLSX.writeFile(wb, "reliability_analysis.xlsx");
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
                  <h5>Reliability Analysis</h5>
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
                    <tr>
                      {HEADERS.map((h) => (
                        <th key={h} style={{ width: columnWidths[h], textAlign: "center" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {safeData.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {HEADERS.map((h) => {
                          const key = headerKeyMapping[h];
                          let val = row.productId[key] ?? row.failureRatePrediction[key] ?? "-";
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

export default ReliabilityAnalysis;