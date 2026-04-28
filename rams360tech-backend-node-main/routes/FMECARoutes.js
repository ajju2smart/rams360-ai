import { Router } from "express";
import { createFMECA, getFMECACRById, updateFMECANewFnl, getFMECA, getAllFMECA, updateFMECA, deleteFMECA, createBulkUploadData, createFMECANew, createBulkUploadDataNew, deleteFMECANew } from "../controllers/FMECAController.js";
import { verifyToken } from "../utils/tokenAuth.js";


const router = Router();

router.route("/").get(verifyToken, getAllFMECA).post(verifyToken, createFMECANew);

router.route("/:id").delete(verifyToken, deleteFMECANew);

router.route("/bulk/create").post(verifyToken, createBulkUploadDataNew);

router.route("/product/list").get(verifyToken, getFMECA);

router.route("/update").patch(verifyToken, updateFMECANewFnl);
router.route("/totalcr").post(getFMECACRById);

export default router;
