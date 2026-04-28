import express, { json } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import hpp from "hpp";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import globalErrHandler from "./controllers/errorController.js";
import AppError from "./utils/appError.js";
//Routes
import userRoutes from "./routes/userRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import projectPermission from "./routes/projectPermissionRoutes.js";
import productBreakdownStructureRoutes from "./routes/productBreakdownStructureRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import failureRatePrediction from "./routes/failureRatePredictionRoutes.js";
import mttrPredictionRoutes from "./routes/mttrPredictionRoutes.js";
import pmMraRoutes from "./routes/pmMraRoutes.js";
import sparePartsAnalysis from "./routes/sparePartsAnalysisRoutes.js";
import productTreeStructureRoutes from "./routes/productTreeStructureRoutes.js";
import FMECARoutes from "./routes/FMECARoutes.js";
import SafetyRoutes from "./routes/safetyRoutes.js";
import FTAtreeRoutes from "./routes/FTAtreeRoutes.js";
import uploadFile from "./routes/uploadFile.js";
import libraryRoutes from "./routes/libraryRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import EnquiryRoutes from "./routes/EnquiryRoutes.js";


const app = express();
app.use(cookieParser());

//Allow Cross-Origin requests
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "https://rams360tech.com",
      "https://dev.rams360tech.com"
    ],
    credentials: true,
  })
);
// app.use(cors());
//proxy
app.set("trust proxy", 1);

//Set security HTTP headers
app.use(helmet());
// Logging middleware
// if (process.env.NODE_ENV === "development") {
//   app.use(morgan("dev"));
// } else {
//   app.use(morgan("combined"));
// }

app.use(morgan("dev"));
//Limit request from the same API
const limiter = rateLimit({
  max: 150000,
  windowMs: 60 * 60 * 1000,
  message: "Too Many Request from this IP, please try again in an hour",
});

app.use("/api", limiter);

//Body parser, reading data from body into req.body

app.use(
  express.json({
    limit: "50mb",
  })
);




// Data sanitization against No Sql query injection
app.use(mongoSanitize());

//Data sanitization against XSS(clean user input from malicious HTML code)
app.use(xss());

//Prevent parameter pollution
app.use(hpp());

app.get("/health", (req, res) => {
  res.status(200).json({
    version: "1.0.0",
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/enquiry", EnquiryRoutes);
app.use("/api/v1/company", companyRoutes);
app.use("/api/v1/projectCreation", projectRoutes);
app.use("/api/v1/projectPermission", projectPermission);
app.use("/api/v1/productBreakdownStructure", productBreakdownStructureRoutes);
app.use("/api/v1/productTreeStructure", productTreeStructureRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/failureRatePrediction", failureRatePrediction);
app.use("/api/v1/mttrPrediction", mttrPredictionRoutes);
app.use("/api/v1/pmMra", pmMraRoutes);
app.use("/api/v1/sparePartsAnalysis", sparePartsAnalysis);
app.use("/api/v1/FMECA", FMECARoutes);
app.use("/api/v1/safety", SafetyRoutes);
app.use("/api/v1/FTA", FTAtreeRoutes);
app.use("/api/v1/FTAjson", uploadFile);
app.use("/api/v1/library", libraryRoutes);
app.use("/api/v1/reports", reportRoutes);
// handle undefined Routes
app.use("*", (req, res, next) => {
  const err = new AppError(404, "fail", "undefined route");
  next(err, req, res, next);
});

app.use(globalErrHandler);

export default app;
