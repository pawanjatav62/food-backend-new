import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.json({ success: false, message: "Not Authorized Login Again" });
  }

  try {
    // ✅ Bearer token extract
    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.id;

    next();
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Invalid or Expired Token" });
  }
};

export default authMiddleware;