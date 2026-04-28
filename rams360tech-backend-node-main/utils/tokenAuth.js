import jwt from "jsonwebtoken";
import { TOKEN_KEY } from "../config.js";

export function verifyToken(req, res, next) {
  const token = req.cookies.accessToken;
  console.log("accessToken", token);

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, TOKEN_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid Token" });
  }
}