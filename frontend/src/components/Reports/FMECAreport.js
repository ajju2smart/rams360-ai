import React, { useState, useMemo } from "react";
import { Col, Form, Row, Button } from "react-bootstrap";
import "../../css/Reports.scss";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FaFileExcel } from "react-icons/fa";
import Loader from "../core/Loader";
import FirstPageReport from "./FirstPageReport.js";
import LastPageReport from "./LastPageReport.js";
import { useMultiReportData } from "../hooks/useReportData";

// ─── Header / key config ─────────────────────────────────────────────────────
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
  "FMECA ID": "fmecaId",
  "Operating phase": "operatingPhase",
  Function: "function",
  "Failure Mode": "failureMode",
  "Failure Mode Ratio Alpha": "failureModeRatioAlpha",
  cause: "cause",
  "Sub system effect": "subSystemEffect",
  "End Effect": "endEffect",
  "End Effect ratio Beta(Must equal to 1)": "endEffectRatioBeta",
  "Safety Impact": "safetyImpact",
  "Reference Hazard ID": "referenceHazardId",
  "Reliability impact": "realibilityImpact",
  "Service Disruption Time(Minutes)": "serviceDisruptionTime",
  Frequency: "frequency",
  Severity: "severity",
  "Risk Index": "riskIndex",
  CM: "cm",
  CR: "cr_computed",
  "Detectable means during operation": "detectableMeansDuringOperation",
  "Detectable means maintainer": "detectableMeansToMaintainer",
  "Built in Test": "BuiltInTest",
  "Design Control": "designControl",
  "Maintenance Control": "maintenanceControl",
  "Export Constraints": "exportConstraints",
  "immediate action during operational phase": "immediteActionDuringOperationalPhase",
  "user field 1": "userField1",
  "user field 2": "userField2",
  "user field 3": "userField3",
  "user field 4": "userField4",
  "user field 5": "userField5",
  "user field 6": "userField6",
  "user field 7": "userField7",
  "user field 8": "userField8",
  "user field 9": "userField9",
  "user field 10": "userField10",
  "PM Task ID": "pmTaskId",
  "PM Task Type": "pmTaskType",
  "Task Intervel Frequency": "taskIntrvlFreq",
  "Task Interval Unit": "taskIntrvlUnit",
  "Latitude / Frequency tolerance": "LatitudeFreqTolrnc",
  "Scheduled Maintance Task": "scheduleMaintenceTsk",
  "Task Intervel Determination": "tskInteralDetermination",
  "Task Description": "taskDesc",
};

const header1 = [
  "S.No", "Id", "Product Name", "Part Number", "Quantity", "Reference",
  "Category", "Part Type", "Environment", "Temperature", "FR",
  "FMECA ID", "Operating phase", "Function", "Failure Mode",
  "Failure Mode Ratio Alpha", "cause", "Sub system effect", "End Effect",
  "End Effect ratio Beta(Must equal to 1)", "Safety Impact", "Reference Hazard ID",
  "Reliability impact", "Service Disruption Time(Minutes)", "Frequency",
  "Severity", "Risk Index", "CM", "CR",
  "Detectable means during operation", "Detectable means maintainer",
  "Built in Test", "Design Control", "Maintenance Control", "Export Constraints",
  "immediate action during operational phase",
  "user field 1", "user field 2", "user field 3", "user field 4", "user field 5",
  "user field 6", "user field 7", "user field 8", "user field 9", "user field 10",
];

const header2 = [
  "PM Task ID", "PM Task Type", "Task Intervel Frequency", "Task Interval Unit",
  "Latitude / Frequency tolerance", "Scheduled Maintance Task",
  "Task Intervel Determination", "Task Description",
];

const combinedHeaders = [...header1, ...header2];

// ─── Component ────────────────────────────────────────────────────────────────
function FMECAreport(props) {
  const {
    projectId,
    selectModuleFieldValue: reportType,
    hierarchyType,
    selectModule: moduleType,
  } = props;

  const { projectData, data, secondaryData, isLoading } = useMultiReportData({
    projectId,
    reportEndpoint: "/api/v1/reports/get/fmeca/report",
    secondaryEndpoints: [
      { key: "pmmraTree", url: "/api/v1/productTreeStructure/pmmra/details" },
    ],
    reportType,
    hierarchyType,
    skip: reportType == 5,
  });

  const pmmraTreeData = secondaryData?.pmmraTree ?? [];

  const [columnVisibility, setColumnVisibility] = useState(
    Object.fromEntries(header2.map((h) => [h, true]))
  );

  const handleColumnVisibilityChange = ({ target: { name, checked } }) =>
    setColumnVisibility((prev) => ({ ...prev, [name]: checked }));

  // ─── Flatten data into display rows ────────────────────────────────────────
  const fmecaData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const allRows = [];

    data.forEach((item) => {
      const productId = item?.productId || {};
      const fmecaItems = Array.isArray(item?.fmecaData)
        ? item.fmecaData
        : item?.fmecaData ? [item.fmecaData] : [];
      const pmmraItems = Array.isArray(item?.pmmraData)
        ? item.pmmraData
        : item?.pmmraData ? [item.pmmraData] : [];

      const maxCount = Math.max(fmecaItems.length, pmmraItems.length, 1);

      for (let i = 0; i < maxCount; i++) {
        allRows.push({
          productId,
          fmecaData: fmecaItems[i] || {},
          pmmraData: pmmraItems[i] || {},
        });
      }
    });

    // Merge extra pmmraTree rows that aren't already represented
    if (Array.isArray(pmmraTreeData)) {
      pmmraTreeData.forEach((pmmraItem) => {
        const productId = pmmraItem?.productId || {};
        const pmmraItems = Array.isArray(pmmraItem?.pmmraData)
          ? pmmraItem.pmmraData
          : pmmraItem?.pmmraData ? [pmmraItem.pmmraData] : [];

        pmmraItems.forEach((pmmraDetail) => {
          const exists = allRows.find(
            (r) =>
              r.productId.partNumber === productId.partNumber &&
              r.pmmraData.pmTaskId === pmmraDetail.pmTaskId
          );
          if (!exists) {
            const emptyRow = allRows.find(
              (r) =>
                r.productId.partNumber === productId.partNumber &&
                Object.keys(r.pmmraData).length === 0
            );
            if (emptyRow) {
              emptyRow.pmmraData = pmmraDetail;
            } else {
              allRows.push({ productId, fmecaData: {}, pmmraData: pmmraDetail });
            }
          }
        });
      });
    }

    return allRows;
  }, [data, pmmraTreeData]);

  // ─── Build product groups (for CR row-span) ────────────────────────────────
  const groups = useMemo(() => {
    const map = new Map();
    const list = [];
    fmecaData.forEach((row) => {
      const key =
        row?.productId?.partNumber ||
        row?.productId?._id ||
        row?.productId?.productName ||
        "unknown";
      if (!map.has(key)) {
        map.set(key, []);
        list.push({ key, rows: map.get(key) });
      }
      map.get(key).push(row);
    });
    return list;
  }, [fmecaData]);

  // ─── Excel export ──────────────────────────────────────────────────────────
  const exportToExcel = () => {
    if (!projectData) return;

    const headers = Object.keys(headerKeyMapping);
    const dataRows = [];
    let globalIdx = 0;

    groups.forEach(({ rows }) => {
      const crSum = rows.reduce((sum, row) => {
        const cm = parseFloat(row?.fmecaData?.cm ?? row?.productId?.cm ?? 0) || 0;
        const fr = parseFloat(row?.fmecaData?.fr ?? row?.productId?.fr ?? 0) || 0;
        return sum + cm * fr;
      }, 0);

      rows.forEach((row, localIdx) => {
        const rowIdx = globalIdx++;
        dataRows.push(
          headers.map((h) => {
            if (h === "S.No") return rowIdx + 1;
            if (h === "CR") return localIdx === 0 ? parseFloat(crSum.toFixed(6)) : "";
            const key = headerKeyMapping[h];
            let val = row?.productId?.[key] ?? row?.fmecaData?.[key] ?? row?.pmmraData?.[key] ?? "-";
            if (h === "FR" && typeof val === "number") val = parseFloat(val.toFixed(6));
            return val;
          })
        );
      });
    });

    const firstPageData = [
      [], [],
      ["Project Name", projectData.projectName || ""],
      ["Document Title", "FMECA"],
      [], [], ["Rev", ""], ["Rev Date", ""], [], [],
      ["Project Name", projectData.projectName || ""],
      ["Project Number", projectData.projectNumber || ""],
      ["Document Title", "FMECA"], ["Revision", ""], ["Date", ""], [],
      ["Created By", ""], ["Created Date", ""], [],
      ["Reviewed By", ""], ["Reviewed Date", ""], [],
      ["Approved By", ""], ["Approved Date", ""],
    ];

    const mainContentData = [
      [], [], ["Document Title", "FMECA"], [],
      ["Project Name", projectData.projectName || ""],
      ["Project Number", projectData.projectNumber || ""],
      ["Project Description", projectData.projectDesc || ""],
      [],
      headers,
      ...dataRows,
    ];

    const mainWs = XLSX.utils.aoa_to_sheet(mainContentData);
    const headerRowIdx = 8;
    const crColIdx = headers.indexOf("CR");
    if (crColIdx !== -1) {
      mainWs["!merges"] = mainWs["!merges"] || [];
      let offset = headerRowIdx + 1;
      groups.forEach(({ rows }) => {
        if (rows.length > 1) {
          mainWs["!merges"].push({
            s: { r: offset, c: crColIdx },
            e: { r: offset + rows.length - 1, c: crColIdx },
          });
        }
        offset += rows.length;
      });
    }

    const lastPageData = [
      [], [],
      ["Project Name", projectData.projectName || ""],
      ["Document Title", "FMECA"],
      [], [], ["Rev", ""], ["Rev Date", ""], [], [],
      ["Last Page"], [], ["Revision History"], [], ["REVISIONS"], [],
      ["REVISION", "DESCRIPTION", "DATE", "AUTHOR", "CHECKED BY", "APPROVED BY"],
      ["", "", "", "", "", ""], ["", "", "", "", "", ""],
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(firstPageData), "First Page");
    XLSX.utils.book_append_sheet(wb, mainWs, "Main Content");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(lastPageData), "Last Page");
    XLSX.writeFile(wb, "fmeca_report.xlsx");
  };

  if (isLoading) return <Loader />;

  return (
    <div>
      <div className="mt-3" />
      {fmecaData.length > 0 ? (
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
                  <h5>FMECA</h5>
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

              {/* PM column toggles */}
              <div style={{ overflowX: "auto", marginBottom: "10px" }}>
                <Row className="d-flex align-items-center">
                  <Col className="d-flex flex-row custom-checkbox-group">
                    {header2.map((item) => (
                      <Form.Check
                        key={item}
                        type="checkbox"
                        name={item}
                        label={item}
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
                      {header1.map((h) => (
                        <th key={h} style={{ textAlign: "center" }}>{h}</th>
                      ))}
                      {header2.filter((h) => columnVisibility[h]).map((h) => (
                        <th key={h} style={{ textAlign: "center" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      let globalIdx = 0;
                      return groups.flatMap(({ rows }) => {
                        const crSum = rows.reduce((sum, row) => {
                          const cm = parseFloat(row?.fmecaData?.cm ?? row?.productId?.cm ?? 0) || 0;
                          const fr = parseFloat(row?.fmecaData?.fr ?? row?.productId?.fr ?? 0) || 0;
                          return sum + cm * fr;
                        }, 0);

                        return rows.map((row, localIdx) => {
                          const rowIdx = globalIdx++;
                          return (
                            <tr key={rowIdx}>
                              {combinedHeaders.map((h) => {
                                // Skip hidden PM columns
                                if (header2.includes(h) && !columnVisibility[h]) return null;

                                const key = headerKeyMapping[h];

                                if (h === "CR") {
                                  if (localIdx !== 0) return null;
                                  return (
                                    <td
                                      key="CR"
                                      rowSpan={rows.length}
                                      style={{ textAlign: "center", verticalAlign: "middle", fontWeight: "bold" }}
                                    >
                                      {crSum.toFixed(6)}
                                    </td>
                                  );
                                }

                                if (h === "S.No") {
                                  return <td key={h} style={{ textAlign: "center" }}>{rowIdx + 1}</td>;
                                }

                                let val = row?.productId?.[key] ?? row?.fmecaData?.[key] ?? row?.pmmraData?.[key] ?? "-";
                                if (h === "FR" && typeof val === "number") val = val.toFixed(6);

                                return <td key={h} style={{ textAlign: "center" }}>{val}</td>;
                              })}
                            </tr>
                          );
                        });
                      });
                    })()}
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

export default FMECAreport;