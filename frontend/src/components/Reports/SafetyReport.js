import React, { useState, useMemo } from "react";
import { Col, Form, Row, Button } from "react-bootstrap";
import "../../css/Reports.scss";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";
import { FaFileExcel, FaFilePdf, FaFileWord } from "react-icons/fa";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
} from "docx";
import Loader from "../core/Loader";
import Safety_ComponentType from "./ComponentTypes/Safety_ComponentType.js";
import FirstPageReport from "./FirstPageReport.js";
import LastPageReport from "./LastPageReport.js";
import { useReportData } from "../hooks/useReportData";

function SafetyReport(props) {
  const {
    projectId,
    selectModuleFieldValue: reportType,
    hierarchyType,
    selectModule: moduleType,
  } = props;

  const [columnLength, setColumnLength] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState({
    Id: true,
    Reference: true,
    FR: true,
  });

  // ── Replaced manual fetch + permission calls with the shared hook ──
  const { projectData, data, isLoading } = useReportData({
    projectId,
    reportEndpoint: "/api/v1/reports/get/safety/report",
    reportType,
    hierarchyType,
    skip: reportType == 5,
  });

  const headerKeyMapping = {
    Id: "indexCount",
    "Product Name": "productName",
    "Part Number": "partNumber",
    Quantity: "quantity",
    Reference: "reference",
    Category: "category",
    "Part Type": "partType",
    FR: "fr",
    Hazard: "failureMode",
    "Mode of Operation": "modeOfOperation",
    "Hazard Cause": "hazardCause",
    "Effect of the Hazard": "effectOfHazard",
    "Hazard Classification": "hazardClasification",
    "Design Assurance Level (DAL) associated with the hazard": "designAssuranceLevel",
    "Means of Detection": "meansOfDetection",
    "Crew Response": "crewResponse",
    "Unique Hazard Identifiers": "uniqueHazardIdentifier",
    "Initial Severity ((impact))": "initialSeverity",
    "Initial likelihood (probability)": "initialLikelihood",
    "Initial Risk Level": "initialRiskLevel",
    "Design Mitigation": "designMitigation",
    "Mitigation Responsibility": "designMitigatonResbiity",
    "Mitigation Evidence": "designMitigtonEvidence",
    "Opernal Maintan Mitigation": "opernalMaintanMitigation",
    "Opernal Mitigaton Resbility": "opernalMitigatonResbility",
    "Operatnal Mitigation Evidence": "operatnalMitigationEvidence",
    "Residual Severity ((impact))": "residualSeverity",
    "Residual Likelihood (probability)": "residualLikelihood",
    "Residual Risk Level": "residualRiskLevel",
    "FTA Name/ID": "ftaNameId",
    "Hazard Status": "hazardStatus",
    "User Field 1": "userField1",
    "User Field 2": "userField2",
  };

  const headers = [
    "S.No",
    "Id",
    "Product Name",
    "Part Number",
    "Quantity",
    "Reference",
    "Category",
    "Part Type",
    "FR",
    "Hazard",
    "Mode of Operation",
    "Hazard Cause",
    "Effect of the Hazard",
    "Hazard Classification",
    "Design Assurance Level (DAL) associated with the hazard",
    "Means of Detection",
    "Crew Response",
    "Unique Hazard Identifiers",
    "Initial Severity ((impact))",
    "Initial likelihood (probability)",
    "Initial Risk Level",
    "Design Mitigation",
    "Mitigation Responsibility",
    "Mitigation Evidence",
    "Opernal Maintan Mitigation",
    "Residual Severity ((impact))",
    "Residual Likelihood (probability)",
    "Residual Risk Level",
    "Hazard Status",
    "FTA Name/ID",
    "User Field 1",
    "User Field 2",
  ];

  const columnWidths = {
    "Product Name": "130px",
    "Part Number": "120px",
    Quantity: "80px",
    Reference: "130px",
    Category: "100px",
    "Part Type": "100px",
    FR: "60px",
  };

  // ── Derived safetyData (unchanged logic, now driven by hook's `data`) ──
  const safetyData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const allRows = [];

    data.forEach((item) => {
      const productId = item?.productId || {};
      const safetyItems = Array.isArray(item?.safetyData)
        ? item.safetyData
        : item?.safetyData
        ? [item.safetyData]
        : [{}];

      if (safetyItems.length === 0) {
        allRows.push({ productId, safetyData: {}, hasSafetyData: false });
      } else {
        safetyItems.forEach((safetyItem) => {
          allRows.push({
            productId,
            safetyData: safetyItem || {},
            hasSafetyData: true,
          });
        });
      }
    });

    // Mirror the columnLength side-effect without useEffect
    if (Object.keys(headerKeyMapping).length > 13 && !columnLength) {
      setColumnLength(true);
    }

    return allRows;
  }, [data]); // eslint-disable-line

  // ── Helpers ──────────────────────────────────────────────────────────
  const handleColumnVisibilityChange = (event) => {
    const { name, checked } = event.target;
    setColumnVisibility((prev) => ({ ...prev, [name]: checked }));
  };

  const getVisibleHeaders = () =>
    headers.filter((header) => {
      if (header === "FR" || header === "Reference" || header === "Id") {
        return columnVisibility[header];
      }
      return true;
    });

  const resolveCell = (row, header, rowIndex) => {
    if (header === "S.No") return rowIndex + 1;

    if (header === "Hazard") {
      const hasHazardData =
        row.hasSafetyData &&
        (row?.safetyData?.failureMode ||
          row?.safetyData?.modeOfOperation ||
          row?.safetyData?.hazardCause);
      return hasHazardData ? rowIndex + 1 : "";
    }

    const key = headerKeyMapping[header];
    let value = key
      ? row?.productId?.[key] ?? row?.safetyData?.[key] ?? "-"
      : "-";

    if (header === "FR" && typeof value === "number") {
      value = value.toFixed(6);
    }

    return value;
  };

  // ── Export: Excel ─────────────────────────────────────────────────────
  const exportToExcel = () => {
    if (!projectData) return;

    const visibleHeaders = getVisibleHeaders();

    const firstPageData = [
      [],
      [],
      ["Project Name", projectData?.projectName || ""],
      ["Document Title", "SAFETY"],
      [],
      [],
      ["Rev", ""],
      ["Rev Date", ""],
      [],
      [],
      ["Project Name", projectData?.projectName || ""],
      ["Project Number", projectData?.projectNumber || ""],
      ["Document Title", "SAFETY"],
      ["Revision", ""],
      ["Date", ""],
      [],
      ["Created By", ""],
      ["Created Date", ""],
      [],
      ["Reviewed By", ""],
      ["Reviewed Date", ""],
      [],
      ["Approved By", ""],
      ["Approved Date", ""],
    ];

    const mainContentData = [
      [],
      [],
      ["Document Title", "SAFETY"],
      [],
      ["Project Name", projectData?.projectName || ""],
      ["Project Number", projectData?.projectNumber || ""],
      ["Project Description", projectData?.projectDesc || ""],
      [],
      visibleHeaders,
      ...safetyData.map((row, i) =>
        visibleHeaders.map((header) => resolveCell(row, header, i))
      ),
    ];

    const lastPageData = [
      [], [],
      ["Project Name", projectData?.projectName || ""],
      ["Document Title", "SAFETY"],
      [], [],
      ["Rev", ""], ["Rev Date", ""],
      [], [],
      ["Last Page"], [],
      ["Revision History"], [],
      ["REVISIONS"], [],
      ["REVISION", "DESCRIPTION", "DATE", "AUTHOR", "CHECKED BY", "APPROVED BY"],
      ["", "", "", "", "", ""],
      ["", "", "", "", "", ""],
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(firstPageData), "First Page");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(mainContentData), "Main Content");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(lastPageData), "Last Page");
    XLSX.writeFile(wb, "safety_report.xlsx");
  };

  // ── Export: PDF ───────────────────────────────────────────────────────
  const generatePDFReport = () => {
    if (!projectData) return;

    const firstPageContent = document.getElementById("first-page-report");
    const mainContent = document.getElementById("main-content-report");
    const lastPageContent = document.getElementById("last-page-report");

    const pdf = new jsPDF("p", "mm", "a4");
    const width = pdf.internal.pageSize.getWidth();
    const height = pdf.internal.pageSize.getHeight();
    let pageNumber = 1;

    const addContentToPDF = (element) =>
      html2canvas(element, { scale: 2, useCORS: true }).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        pdf.addImage(imgData, "PNG", 0, 0, width, height);
        pdf.text(`${pageNumber++}`, width - 10, height - 10);
      });

    Promise.resolve()
      .then(() => addContentToPDF(firstPageContent))
      .then(() => { pdf.addPage(); return addContentToPDF(mainContent); })
      .then(() => { pdf.addPage(); return addContentToPDF(lastPageContent); })
      .then(() => pdf.save("safety_report.pdf"))
      .catch((error) => console.error("Error generating PDF:", error));
  };

  // ── Export: Word ──────────────────────────────────────────────────────
  const generateWordDocument = () => {
    if (!projectData) return;

    const visibleHeaders = getVisibleHeaders();

    const tableRows = [
      new TableRow({
        children: visibleHeaders.map(
          (header) =>
            new TableCell({
              children: [new Paragraph({ text: header, bold: true })],
              width: { size: 100, type: WidthType.PERCENTAGE },
            })
        ),
      }),
      ...safetyData.map((row, i) =>
        new TableRow({
          children: visibleHeaders.map(
            (header) =>
              new TableCell({
                children: [
                  new Paragraph({ text: String(resolveCell(row, header, i)) }),
                ],
                width: { size: 100, type: WidthType.PERCENTAGE },
              })
          ),
        })
      ),
    ];

    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              children: [new TextRun({ text: "Project Report", bold: true, size: 32 })],
              alignment: "center",
            }),
            new Paragraph({ children: [new TextRun({ text: "" })] }),
            new Paragraph({ children: [new TextRun({ text: `Project Name: ${projectData.projectName || "-"}` })] }),
            new Paragraph({ children: [new TextRun({ text: `Project Number: ${projectData.projectNumber || "-"}` })] }),
            new Paragraph({ children: [new TextRun({ text: `Project Description: ${projectData.projectDesc || "-"}` })] }),
            new Paragraph({ children: [new TextRun({ text: "" })] }),
            new Table({ rows: tableRows }),
          ],
        },
      ],
    });

    Packer.toBlob(doc)
      .then((blob) => saveAs(blob, "safety_report.docx"))
      .catch((error) => console.error("Error generating Word document:", error));
  };

  // ── Render ────────────────────────────────────────────────────────────
  if (isLoading) return <Loader />;

  return (
    <div>
      <div className="mt-3" />

      {safetyData.length > 0 ? (
        <>
          <Row className="d-flex align-items-center justify-content-end">
            <Col className="d-flex justify-content-end">
              <Button
                className="report-save-btn"
                onClick={exportToExcel}
                style={{ marginRight: "8px" }}
              >
                <FaFileExcel style={{ marginRight: "8px" }} />
                Excel
              </Button>
              {/* Uncomment as needed:
              <Button className="report-save-btn" onClick={generatePDFReport} style={{ marginRight: "8px" }}>
                <FaFilePdf style={{ marginRight: "8px" }} /> PDF
              </Button>
              <Button className="report-save-btn" onClick={generateWordDocument}>
                <FaFileWord style={{ marginRight: "8px" }} /> Word
              </Button> */}
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
                    <h5>SAFETY</h5>
                  </Col>
                  <Col className="d-flex flex-column align-items-center">
                    <h5>Rev:</h5>
                    <h5>Rev Date:</h5>
                  </Col>
                </Row>

                <div className="sheet-content">
                  <div className="field">
                    <label>Project Name:</label>
                    <span>{projectData?.projectName}</span>
                  </div>
                  <div className="field">
                    <label>Project Number:</label>
                    <span>{projectData?.projectNumber}</span>
                  </div>
                  <div className="field">
                    <label>Project Description:</label>
                    <span>{projectData?.projectDesc}</span>
                  </div>
                </div>

                <Row className="d-flex align-items-center justify-content-end">
                  <Col className="d-flex flex-row custom-checkbox-group">
                    {["Id", "Reference", "FR"].map((col) => (
                      <Form.Check
                        key={col}
                        type="checkbox"
                        name={col}
                        label={col}
                        checked={columnVisibility[col]}
                        onChange={handleColumnVisibilityChange}
                        className="custom-checkbox ml-3"
                      />
                    ))}
                  </Col>
                </Row>

                <div style={{ overflowX: "auto" }}>
                  <table className="report-table">
                    <thead>
                      <tr>
                        {getVisibleHeaders().map((header) => (
                          <th
                            key={header}
                            style={{ width: columnWidths[header], textAlign: "center" }}
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {safetyData.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {getVisibleHeaders().map((header) => (
                            <td key={header} style={{ textAlign: "center" }}>
                              {resolveCell(row, header, rowIndex)}
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
          <h3>No Products Found</h3>
        </div>
      )}
    </div>
  );
}

export default SafetyReport;