import User from "../models/userModel.js";
import Company from "../models/companyModel.js";
import {
  getAll,
  getOne,
  deleteOne,
  createOne,
  updateOne,
} from "./baseController.js";
import { TOKEN_KEY, isProduction } from "../config.js";
import jwt from "jsonwebtoken";
import user from "../models/userModel.js";
import bcrypt from "bcryptjs";


export const deleteUser = deleteOne(User);

export async function getMe(req, res, next) {
  try {
    // req.user comes from verifyToken
    console.log("req.user.id", req.cookies);

    const user = await User.findById(req.user.id)
      .select("-password -refreshToken")

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);

  } catch (err) {
    next(err);
  }
}

export async function getAllCompanyUsers(req, res, next) {
  try {
    const data = req.body;
    const companyUsersList = await User.find({
      isSuperAdminCreated: true,
    }).populate("companyId");
    res.status(201).json({
      message: "Get Company Users List",
      companyUsersList,
    });
  } catch (err) {
    console.log("err", err);
  }
}

export const adminResetPassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Hash new password
    user.password = await bcrypt.hash(newPassword, 10);

    // Invalidate all sessions
    user.refreshToken = null;

    // Optional: force reset flag
    user.mustChangePassword = true;

    await user.save();

    res.json({ message: "Password reset by admin successfully" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export async function createUser(req, res, next) {
  try {
    const data = req.body;

    const exist = await User.findOne({ email: data.email });
    if (exist) {
      return res.status(208).json({ message: "User Already Exist" });
    }

    //HASH PASSWORD
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await User.create({
      ...data,
      password: hashedPassword,
    });

    const userCount = await User.countDocuments({ companyId: data.companyId });

    await Company.findByIdAndUpdate(
      data.companyId,
      { userCount }
    );

    res.status(201).json({
      message: "User Created Successfully",
      user,
    });

  } catch (err) {
    next(err);
  }
}

export async function refreshToken(req, res) {
  try {
    const token = req.cookies.refreshToken;
    console.log("refreshToken", token);

    if (!token) {
      return res.status(401).json({ message: "No refresh token" });
    }

    const decoded = jwt.verify(token, TOKEN_KEY);

    const user = await User.findById(decoded.id);
    if (!user || !user.refreshToken) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const isValid = await bcrypt.compare(token, user.refreshToken);

    if (!isValid) {
      // 🚨 TOKEN REUSE DETECTED
      user.refreshToken = null;
      await user.save();
      return res.status(403).json({ message: "Token reuse detected" });
    }

    // 🔁 ROTATION
    const newAccessToken = jwt.sign(
      { id: user._id },
      TOKEN_KEY,
      { expiresIn: "15m" }
    );

    const newRefreshToken = jwt.sign(
      { id: user._id },
      TOKEN_KEY,
      { expiresIn: "7d" }
    );

    const hashedRefresh = await bcrypt.hash(newRefreshToken, 10);
    user.refreshToken = hashedRefresh;
    await user.save();


    const accessCookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      ...(isProduction && { domain: ".rams360tech.com" }),
      maxAge: 15 * 60 * 1000,
    };

    const refreshCookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      ...(isProduction && { domain: ".rams360tech.com" }),
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };
    //Store in HTTP-only cookies
    res.cookie("accessToken", newAccessToken, accessCookieOptions);
    res.cookie("refreshToken", newRefreshToken, refreshCookieOptions);
    res.json({ message: "Token refreshed" });

  } catch (err) {
    return res.status(403).json({ message: "Expired refresh token" });
  }
}

export async function logout(req, res) {
  const token = req.cookies.refreshToken;

  if (token) {
    const decoded = jwt.decode(token);
    if (decoded?.id) {
      const user = await User.findById(decoded.id);
      if (user) {
        user.refreshToken = null;
        user.lastLogout = new Date();
        await user.save();
      }
    }
  }

  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    ...(isProduction && { domain: ".rams360tech.com" }),
  };

  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);

  res.status(200).json({ message: "Logged out successfully" });
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const userData = await User.findOne({ email });
    if (!userData) {
      return res.status(400).json({ message: "Invalid Credential" });
    }

    const isMatch = await bcrypt.compare(password, userData.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Credential" });
    }

    // Access Token
    const accessToken = jwt.sign(
      {
        id: userData._id,
        companyId: userData.companyId,
        role: userData.role
      },
      TOKEN_KEY,
      // { expiresIn: "15m" }
      { expiresIn: "1d" }
    );

    // Refresh Token
    const refreshToken = jwt.sign(
      {
        id: userData._id,
        companyId: userData.companyId,
        role: userData.role
      },
      TOKEN_KEY,
      { expiresIn: "7d" }
    );

    //HASH refresh token before saving
    const hashedRefresh = await bcrypt.hash(refreshToken, 10);
    userData.refreshToken = hashedRefresh;
    userData.lastLogin = new Date();
    await userData.save();

    const accessCookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      ...(isProduction && { domain: ".rams360tech.com" }),
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    };

    const refreshCookieOptions = {
      httpOnly: true,
      secure: isProduction,
      ...(isProduction && { domain: ".rams360tech.com" }),
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 day
    };
    //Store in HTTP-only cookies
    res.cookie("accessToken", accessToken, accessCookieOptions);
    res.cookie("refreshToken", refreshToken, refreshCookieOptions);

    res.status(200).json({
      message: "Login Successfully",
      user: userData,
    });

  } catch (err) {
    next(err);
  }
}

export async function getCompanyUsers(req, res, next) {
  try {
    const data = req.query;
    console.log("data.....", data)

    const usersList = await User.find({
      companyId: data.companyId,
      _id: { $nin: [data.userId] }, // Exclude the current user only
      role: { $nin: ["admin"] } // Exclude admin role
    })
      .where("role").ne("SuperAdmin"); // Additional condition to exclude SuperAdmin role

    res.status(201).json({
      message: "List Of users In Company",
      usersList,
    });
  } catch (err) {
    console.log("err", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getUser(req, res, next) {
  try {
    const userId = req.query.userId;
    const usersList = await User.findOne({ _id: userId }).populate("companyId");

    res.status(201).json({
      message: "Get users",
      usersList,
    });
  } catch (err) {
    console.log("err", err);
  }
}

export async function getAllUser(req, res, next) {
  try {
    const data = req.query;
    const usersList = await User.find({
      companyId: data.companyId,
      role: { $ne: "admin" },
      _id: { $ne: data.userId },
    }).populate("companyId");

    res.status(201).json({
      message: "Get users",
      usersList,
    });
  } catch (err) {
    console.log("err", err);
  }
}

// export async function updateUser(req, res, next) {
//   try {
//     const data = req.body;

//     const userId = req.params.id;

//     const exist = await User.find({ email: data.email });
//     if (exist.length > 0) {
//       const existEmail = exist[0].email;
//       const newEmail = await User.find({ _id: userId });
//       if (existEmail == newEmail[0].email) {
//         const editDetail = {
//           email: data.email,
//           password: data.password,
//           name: data.name,
//           phone: data.phone,
//           role: data.role,
//           confirmPassword:data.confirmPassword,
//         };
//         const editData = await User.findByIdAndUpdate(userId, editDetail, {
//           new: true,
//           runValidators: true,
//         });
//         res.status(201).json({
//           message: "User Details Updated Successfully",
//           editData,
//         });
//       } else {
//         res.status(208).json({
//           message: "User Already Exist",
//           exist,
//         });
//       }
//     } else {
//       const editDetail = {
//         email: data.email,
//         password: data.password,
//         name: data.name,
//         phone: data.phone,
//         role: data.role,
//       };
//       const editData = await User.findByIdAndUpdate(userId, editDetail, {
//         new: true,
//         runValidators: true,
//       });
//       res.status(201).json({
//         message: "User Details Updated Successfully",
//         editData,
//       });
//     }
//   } catch (err) {
//     console.log("err", err);
//   }
// }
export async function updateUser(req, res, next) {
  try {
    const userId = req.params.id;
    const data = req.body;
    // Check if email already exists for another user
    if (data.email) {
      const emailExists = await User.findOne({
        email: data.email,
        _id: { $ne: userId },
      });

      if (emailExists) {
        return res.status(208).json({
          message: "User Already Exist",
        });
      }
    }

    // Prepare update object
    const editDetail = {
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
      name: data.name,
      phone: data.phone || data.phone,
      role: data.role,
    };

    // Remove undefined fields (important)
    Object.keys(editDetail).forEach(
      (key) => editDetail[key] === undefined && delete editDetail[key]
    );

    const editData = await User.findByIdAndUpdate(userId, editDetail, {
      new: true,
      runValidators: true,
    });

    res.status(201).json({
      message: "User Details Updated Successfully",
      editData,
    });
  } catch (err) {
    console.log("error....:", err);
    next(err);
  }
}

export async function resetUserPassword(req, res, next) {
  try {
    const userId = req.params.id;
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      return res.status(400).json({
        message: "Password and Confirm Password are required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        password: hashedPassword,
        confirmPassword: hashedPassword, // optional (better to remove this field completely from schema)
      },
      { new: true }
    ).select("-password -confirmPassword");

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "Password reset successfully",
    });
  } catch (err) {
    next(err);
  }
}



export async function updateUserThemeColor(req, res, next) {
  try {
    const data = req.body;
    const userId = data.userId;
    const editData = {
      userThemeColor: data.userThemeColor,
    };
    const updateData = await user.findByIdAndUpdate(userId, editData, {
      new: true,
      runValidators: true,
    });
    res.status(201).json({
      message: "User Theme Updated Successfully",
      updateData,
    });
  } catch (err) {
    next(err);
  }
}
export async function getUserData(req, res, next) {
  try {
    const userId = req.query.userId;
    const usersList = await User.findOne({ _id: userId }).populate("companyId");

    res.status(201).json({
      message: "Get users",
      usersList,
    });
  } catch (err) {
    console.log("err", err);
  }
}
