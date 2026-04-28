import { Router } from "express";
const router = Router();

import {
  createProductBreakdownStructure,
  deleteproductBreakdownStructure,
  getAllproductBreakdownStructure,
  getProductBreakdownStructure,
  updateProductBreakdownStructure,
  createPbsRecordFromImportFileNew,
} from "../controllers/productBreakdownStructureController.js";
import { verifyToken } from "../utils/tokenAuth.js";

router.route("/").get(getAllproductBreakdownStructure).post(createProductBreakdownStructure);

router.route("/update/detail").patch(verifyToken, updateProductBreakdownStructure);

router
  .route("/:id")
  .get(verifyToken, getProductBreakdownStructure)
  .delete(verifyToken, deleteproductBreakdownStructure);

router.route("/import/record/create").post(createPbsRecordFromImportFileNew);

export default router;
