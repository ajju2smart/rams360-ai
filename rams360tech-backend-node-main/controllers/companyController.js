import Company from "../models/companyModel.js";
import { getAll, getOne, deleteOne, updateOne } from "./baseController.js";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";

export const getCompany = getOne(Company);
// export const getAllCompany = getAll(Company);
export const updateCompany = updateOne(Company);
export const deleteCompany = deleteOne(Company);

export async function getAllCompany(req, res, next) {
  try {
    const company = await Company.find();
    res.status(201).json({
      message: "Get All Comapnys",
      company,
    });
  } catch (err) {
    console.log("err", err);
  }
}

export async function createCompany(req, res, next) {
  try {
    const {
      companyId,
      companyName,
      name,
      password,
      confirmPassword,
      email,
      phoneNumber,
      role,
    } = req.body;

    // 1️⃣ Check password match
    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
      });
    }

    // 2️⃣ Check if company exists
    const existingCompany = await Company.findById(companyId);

    if (!existingCompany) {
      return res.status(409).json({
        message: "Company does not exist",
      });
    }

    // 3️⃣ Check if user email exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "User email already exists",
      });
    }

    // 4️⃣ Create company
    // const company = await Company.create({
    //   _id: companyId,
    //   companyName,
    // });

    // 5️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6️⃣ Create super admin user
    const companyUser = await User.create({
      companyName,
      name,
      password: hashedPassword,
      email,
      phoneNumber,
      companyId,
      role,
      isSuperAdminCreated: true,
    });

    return res.status(201).json({
      message: "Company created successfully",
      company: existingCompany,
      companyUser,
    });

  } catch (err) {
    console.error("Create company error:", err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function createCompanyName(req, res, next) {
  try {
    const data = req.body;
    const exist = await Company.find({ companyName: data.companyName });

    if (exist.length === 0) {
      const createCompany = await Company.create({
        companyName: data.companyName,
      });
      res.status(201).json({
        message: "Company Created SuccessFully",
        createCompany,
      });
    } else {
      res.status(208).json({
        message: "Company Name Already Exist",
        exist,
      });
    }
  } catch (err) {
    console.log("err");
  }
}
