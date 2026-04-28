import React, { useState } from "react";
import { Col, Form, Row, Button } from "react-bootstrap";
import "../../css/Reports.scss";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";
import { FaFileExcel } from "react-icons/fa";
import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, Header, AlignmentType, Footer,
} from "docx";
import FirstPageReport from "./FirstPageReport.js";
import LastPageReport from "./LastPageReport.js";
import Loader from "../core/Loader.js";
import { useReportData } from "../hooks/useReportData";

const headerKeyMapping = {
  Id: "indexCount",
  "Product Name": "productName",
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
};

const ALL_HEADERS = [
  "S.No", "Id", "Product Name", "Part Number", "Quantity", "Reference",
  "Category", "Part Type", "Environment", "Temperature", "FR", "MTTR", "MCT", "MLH",
];

const TOGGLE_COLS = ["FR", "MTTR", "MCT", "MLH"];

const columnWidths = {
  "Product Name": "130px", "Part Number": "120px", Quantity: "80px",
  Reference: "130px", Category: "100px", "Part Type": "100px",
  Environment: "120px", Temperature: "120px", FR: "60px",
  MTTR: "60px", MCT: "60px", MLH: "60px",
};

function PbsReport(props) {
  const { projectId, selectModuleFieldValue: reportType, hierarchyType, selectModule: moduleType } = props;

  const endpoint =
    reportType == 1
      ? `/api/v1/reports/get/pbs/report`
      : `/api/v1/reports/get/pbs/report`;

  const { projectData, data, isLoading } = useReportData({
    projectId,
    reportEndpoint: endpoint,
    reportType,
    hierarchyType,
    skip: reportType == 5,
  });

  const [columnVisibility, setColumnVisibility] = useState(
    Object.fromEntries(ALL_HEADERS.map((h) => [h, true]))
  );

  const handleColumnVisibilityChange = ({ target: { name, checked } }) => {
    setColumnVisibility((prev) => ({ ...prev, [name]: checked }));
  };

  const customSort = (a, b) =>
    String(a.indexCount).localeCompare(String(b.indexCount), undefined, { numeric: true });

  const sortedData = [...(data ?? [])].sort(customSort);

  // ─── Excel export ────────────────────────────────────────────────────────────
  const exportToExcel = () => {
    if (!projectData) return;

    const visibleHeaders = ALL_HEADERS.filter((h) => columnVisibility[h] !== false);

    const firstPageData = [
      [], [],
      ["Project Name", projectData.projectName || ""],
      ["Document Title", "Product Breakdown Structure"],
      [], [], ["Rev", ""], ["Rev Date", ""], [], [],
      ["Project Name", projectData.projectName || ""],
      ["Project Number", projectData.projectNumber || ""],
      ["Document Title", "Product Breakdown Structure"],
      ["Revision", ""], ["Date", ""], [],
      ["Created By", ""], ["Created Date", ""], [],
      ["Reviewed By", ""], ["Reviewed Date", ""], [],
      ["Approved By", ""], ["Approved Date", ""],
    ];

    const mainContentData = [
      [], [], ["Project Report"], [],
      ["Project Name", projectData.projectName || ""],
      ["Project Number", projectData.projectNumber || ""],
      ["Project Description", projectData.projectDesc || ""],
      [],
      visibleHeaders,
      ...sortedData.map((row) =>
        visibleHeaders.map((h) =>
          h === "S.No"
            ? sortedData.indexOf(row) + 1
            : row[headerKeyMapping[h]] || "-"
        )
      ),
    ];

    const lastPageData = [
      [], [],
      ["Project Name", projectData.projectName || ""],
      ["Document Title", "Product Breakdown Structure"],
      [], [], ["Rev", ""], ["Rev Date", ""], [], [],
      ["Last Page"], [], ["Revision History"], [], ["REVISIONS"], [],
      ["REVISION", "DESCRIPTION", "DATE", "AUTHOR", "CHECKED BY", "APPROVED BY"],
      ["", "", "", "", "", ""], ["", "", "", "", "", ""],
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(firstPageData), "First Page");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(mainContentData), "Main Content");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(lastPageData), "Last Page");
    XLSX.writeFile(wb, "pbs_report.xlsx");
  };

  if (isLoading) return <Loader />;

  return (
    <div>
      <div className="mt-3" />
      {sortedData.length > 0 ? (
        <>
          <Row className="d-flex align-items-center justify-content-end">
            <Col className="d-flex justify-content-end">
              <Button className="report-save-btn" onClick={exportToExcel} style={{ marginRight: "8px" }}>
                <FaFileExcel style={{ marginRight: "8px" }} /> Excel
              </Button>
            </Col>
          </Row>

          <div id="pdf-report-content">
            <div id="first-page-report">
              <FirstPageReport projectId={projectId} moduleType={moduleType} />
            </div>

            <div className="sheet-container mt-3" id="main-content-report">
              <div className="sheet">
                <Row className="d-flex justify-content-between">
                  <Col className="d-flex flex-column align-items-center" />
                  <Col className="d-flex flex-column align-items-center">
                    <h5>{projectData?.projectName}</h5>
                    <h5>Product Breakdown Structure</h5>
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

                {/* Toggle checkboxes */}
                <Row className="d-flex align-items-center justify-content-end">
                  <Col className="d-flex flex-row custom-checkbox-group">
                    {TOGGLE_COLS.map((col) => (
                      <Form.Check
                        key={col}
                        type="checkbox"
                        name={col}
                        label={col}
                        checked={columnVisibility[col]}
                        onChange={handleColumnVisibilityChange}
                        className="custom-checkbox ml-5"
                      />
                    ))}
                  </Col>
                </Row>

                <div style={{ overflowX: "auto" }}>
                  <table className="report-table">
                    <thead>
                      <tr>
                        {ALL_HEADERS.filter((h) => columnVisibility[h] !== false).map((h) => (
                          <th key={h} style={{ width: columnWidths[h], textAlign: "center" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sortedData.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {ALL_HEADERS.filter((h) => columnVisibility[h] !== false).map((h) => (
                            <td key={h} style={{ textAlign: "center" }}>
                              {h === "S.No"
                                ? rowIndex + 1
                                : h === "FR" && typeof row[headerKeyMapping[h]] === "number"
                                  ? parseFloat(row[headerKeyMapping[h]]).toFixed(6)
                                  : row[headerKeyMapping[h]] || "-"}
                            </td>
                          ))}
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
        </>
      ) : (
        <div style={{ display: "flex", width: "100%", justifyContent: "center" }}>
          <h3>No Records to Display</h3>
        </div>
      )}
    </div>
  );
}

export default PbsReport;