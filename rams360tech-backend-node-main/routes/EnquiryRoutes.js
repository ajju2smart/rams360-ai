import express from "express";
const router = express.Router();
import { createEnquiry, getAllEnquiries, getEnquiryById, updateEnquiry, deleteEnquiry } from "../controllers/EnquiryController.js";

router.post("/", createEnquiry);
router.get("/", getAllEnquiries);
router.get("/:id", getEnquiryById);
router.put("/:id", updateEnquiry);
router.delete("/:id", deleteEnquiry);

export default router;