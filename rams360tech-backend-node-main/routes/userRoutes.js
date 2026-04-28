import { Router } from "express";
const router = Router();

import {
  createUser,
  getAllUser,
  getUser,
  updateUser,
  deleteUser,
  login,
  getMe,
  logout,
  getCompanyUsers,
  refreshToken,
  getAllCompanyUsers,
  updateUserThemeColor,
  resetUserPassword,
  getUserData,
} from "../controllers/userController.js";
import { verifyToken } from "../utils/tokenAuth.js";
router.route("/me").get(verifyToken, getMe)
router.route("/").post(verifyToken, createUser);
router.route("/").get(getUserData);
router.route("/list").get(getAllUser);
router.route("/company/list").get(verifyToken, getCompanyUsers);
router.route("/login").post(login);
router.route("/logout").post(verifyToken, logout);
router.route("/refresh").post(verifyToken, refreshToken);
router.route("/:id").get(getUser).patch(verifyToken, updateUser).delete(verifyToken, deleteUser);
router.route("/resetpassword/:id").patch(verifyToken, resetUserPassword);
router.route("/company/all").get(verifyToken, getAllCompanyUsers);
router.route("/theme/color").patch(verifyToken, updateUserThemeColor)


export default router;
