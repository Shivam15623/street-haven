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
  video: [".mp4", ".webm", ".mov"], // ✅ added video
};

// Max size: 10MB
const MAX_SIZE = 50 * 1024 * 1024; // 50MB (recommended for videos)
const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "video/mp4",
  "video/webm",
  "video/quicktime", // .mov
];

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

  const allSafeExts = Object.values(safeTypeMap).flat();

  if (!allSafeExts.includes(ext)) {
    return cb(new Error("File extension not allowed"), false);
  }

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error("Invalid file MIME type"), false);
  }

  cb(null, true);
};
// Multer middleware
export const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter,
});
