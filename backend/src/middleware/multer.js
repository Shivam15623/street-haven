import multer from "multer";
import path from "path";
import fs from "fs";

// Safe file types
const safeTypeMap = {
  image: [".jpg", ".jpeg", ".png", ".gif", ".webp"],
  pdf: [".pdf"],
  doc: [".docx"], // avoid .doc
  ppt: [".pptx"], // avoid .ppt
  excel: [".xlsx"], // avoid .xls
};

// Max size: 10MB
const MAX_SIZE = 10 * 1024 * 1024;

// Ensure upload folder exists
const uploadDir = "./public/attachments";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // sanitize file name (replace spaces and special chars)
    const safeName = file.originalname
      .replace(/\s+/g, "_")
      .replace(/[^\w.-]/g, "");
    cb(null, Date.now() + "_" + safeName);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  // Check if extension is allowed
  const allSafeExts = [].concat(...Object.values(safeTypeMap));
  if (!allSafeExts.includes(ext)) {
    return cb(new Error("File type not allowed"), false);
  }

  cb(null, true);
};

// Multer middleware
export const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter,
});
