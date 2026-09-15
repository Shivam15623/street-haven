import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    //upload the file on cloudinary
    const ext = path.extname(localFilePath).toLowerCase();
    let resourceType = "auto"; // default
    if (ext === ".pdf") {
      resourceType = "raw"; // force raw for PDFs
    }
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: resourceType,
      secure: true,
    });
    // file has been uploaded successfull

    fs.unlinkSync(localFilePath);
    return response;
  } catch {
    fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the upload operation got failed
    return null;
  }
};
const deleteFromCloudinary = async (fileUrl) => {
  try {
    if (!fileUrl) throw new Error("File URL is required");

    // Extract the public_id from the URL
    // Example URL: https://res.cloudinary.com/<cloud>/image/upload/v123456/folder/fileName.ext
    const urlParts = fileUrl.split("/");
    const fileWithExt = urlParts.slice(7).join("/"); // gets folder/fileName.ext after /upload/
    const publicId = fileWithExt.replace(/\.[^/.]+$/, ""); // remove extension

    // Determine resource type based on file extension
    const ext = fileWithExt.split(".").pop().toLowerCase();
    let resourceType = "image"; // default
    if (ext === "pdf" || ext === "doc" || ext === "docx" || ext === "txt") {
      resourceType = "raw";
    } else if (ext === "mp4" || ext === "mov") {
      resourceType = "video";
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      secure: true,
    });
    return result;
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    throw new Error("Failed to delete file from Cloudinary");
  }
};
export { uploadOnCloudinary, deleteFromCloudinary };
