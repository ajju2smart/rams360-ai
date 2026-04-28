import  { useMemo as useMemoSA } from "react";
import { Col as ColSA, Row as RowSA, Button as ButtonSA } from "react-bootstrap";
import * as XLSXSA from "xlsx";
import { FaFileExcel as FaFileExcelSA } from "react-icons/fa";
import LoaderSA from "../core/Loader";
import FirstPageReportSA from "./FirstPageReport.js";
import LastPageReportSA from "./LastPageReport.js";
import { useReportData as useReportDataSA } from "../hooks/useReportData";
 
const SA_headerKeyMapping = {
  Id: "indexCount",
  "Product Name": "productName", "Part Number": "partNumber",
  Quantity: "quantity", Reference: "reference", Category: "category",
  "Part Type": "partType", Environment: "environment", Temperature: "temperature",
  FR: "fr", MTTR: "mttr", MCT: "mct", MLH: "mlh",
  Repairable: "repairable", "Level of Repair": "levelOfRepair",
  "Level of Replace": "levelOfReplace", Spare: "spare", Mmax: "mMax",
  Remarks: "remarks",
  "Warrenty Spare": "warrantySpare", "Recommended Spare": "recommendedSpare",
  "Delivery Time Days": "deliveryTimeDays",
  "After Serial Production Price 1": "afterSerialProductionPrice1",
  "Price 1 MOQ": "price1MOQ",
  "After Serial Production Price 2": "afterSerialProductionPrice2",
  "Price 2 MOQ": "price2MOQ",
  "After Serial Production Price 3": "afterSerialProductionPrice3",
  "Price 3 MOQ": "price3MOQ",
  "Annual Price Escalation Percentage": "annualPriceEscalationPercentage",
  "LCC-Price Validity to be Included": "lccPriceValidity",
  "Recommended Spare Quantity": "recommendedSpareQuantity",
  "Calculated Spare Quantity": "calculatedSpareQuantity",
};
 
const SA_HEADERS = [
  "S.No", "Id", "Product Name", "Part Number", "Quantity", "Reference",
  "Category", "Part Type", "Environment", "Temperature", "FR", "MTTR", "MCT", "MLH",
  "Repairable", "Level of Repair", "Level of Replace", "Spare", "Mmax", "Remarks",
  "Warrenty Spare", "Recommended Spare", "Delivery Time Days",
  "After Serial Production Price 1", "Price 1 MOQ",
  "After Serial Production Price 2", "Price 2 MOQ",
  "After Serial Production Price 3", "Price 3 MOQ",
  "Annual Price Escalation Percentage", "LCC-Price Validity to be Included",
  "Recommended Spare Quantity", "Calculated Spare Quantity",
];
 
function SpareAnalysis(props) {
  const {
    projectId, selectModuleFieldValue: reportType,
    hierarchyType, selectModule: moduleType,
  } = props;
 
  const { projectData, data, isLoading } = useReportDataSA({
    projectId,
    reportEndpoint: "/api/v1/reports/get/spart/report/",
    reportType, hierarchyType,
    skip: reportType == 5,
  });
 
  const sparePartsData = useMemoSA(() =>
    (data ?? []).map((item) => ({
      productId: item?.productId || {},
      mttrData: item?.mttrData || {},
      spareData: item?.sparePartsData || {},
    })),
    [data]
  );
 
  const exportToExcel = () => {
    if (!projectData) return;
    const mainContentData = [
      [], [], ["Spare Parts Analysis Report"], [],
      ["Project Name", projectData.projectName || ""],
      ["Project Number", projectData.projectNumber || ""],
      ["Project Description", projectData.projectDesc || ""],
      [],
      SA_HEADERS,
      ...sparePartsData.map((row, i) =>
        SA_HEADERS.map((h) => {
          if (h === "S.No") return i + 1;
          const key = SA_headerKeyMapping[h];
          return row.productId?.[key] ?? row.mttrData?.[key] ?? row.spareData?.[key] ?? "-";
        })
      ),
    ];
    const wb = XLSXSA.utils.book_new();
    XLSXSA.utils.book_append_sheet(wb, XLSXSA.utils.aoa_to_sheet([
      [], [], ["Project Name", projectData.projectName || ""],
      ["Document Title", "Spare Parts Analysis"],
    ]), "First Page");
    XLSXSA.utils.book_append_sheet(wb, XLSXSA.utils.aoa_to_sheet(mainContentData), "Main Content");
    XLSXSA.utils.book_append_sheet(wb, XLSXSA.utils.aoa_to_sheet([[], [], ["Last Page"]]), "Last Page");
    XLSXSA.writeFile(wb, "spare_analysis.xlsx");
  };
 
  if (isLoading) return <LoaderSA />;
 
  return (
    <div>
      <div className="mt-3" />
      {sparePartsData.length > 0 ? (
        <div>
          <RowSA className="d-flex align-items-center justify-content-end">
            <ColSA className="d-flex justify-content-end">
              <ButtonSA className="report-save-btn" onClick={exportToExcel} style={{ marginRight: "8px" }}>
                <FaFileExcelSA style={{ marginRight: "8px" }} /> Excel
              </ButtonSA>
            </ColSA>
          </RowSA>
          <div className="sheet-container mt-3">
            <div className="sheet" id="pdf-report-content">
              <div id="first-page-report">
                <FirstPageReportSA projectId={projectId} moduleType={moduleType} />
              </div>
              <RowSA className="d-flex justify-content-between">
                <ColSA className="d-flex flex-column align-items-center" />
                <ColSA className="d-flex flex-column align-items-center">
                  <h5>{projectData?.projectName}</h5>
                  <h5>Spares Analysis</h5>
                </ColSA>
                <ColSA className="d-flex flex-column align-items-center">
                  <h5>Rev:</h5><h5>Rev Date:</h5>
                </ColSA>
              </RowSA>
              <div className="sheet-content">
                <div className="field"><label>Project Name:</label><span>{projectData?.projectName}</span></div>
                <div className="field"><label>Project Number:</label><span>{projectData?.projectNumber}</span></div>
                <div className="field"><label>Project Description:</label><span>{projectData?.projectDesc}</span></div>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table className="report-table">
                  <thead>
                    <tr>{SA_HEADERS.map((h) => <th key={h} style={{ textAlign: "center" }}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {sparePartsData.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {SA_HEADERS.map((h) => {
                          if (h === "S.No") return <td key={h} style={{ textAlign: "center" }}>{rowIndex + 1}</td>;
                          const key = SA_headerKeyMapping[h];
                          let val = row.productId?.[key] ?? row.mttrData?.[key] ?? row.spareData?.[key] ?? "-";
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
            <LastPageReportSA projectId={projectId} moduleType={moduleType} />
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
 
export { SpareAnalysis as default };