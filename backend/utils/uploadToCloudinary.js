import { uploadToCloudinary as uploadToCloudinaryUtil } from "../config/cloudinary.js";

const uploadToCloudinary = (fileBuffer, folder = "mern_uploads") =>
  uploadToCloudinaryUtil(fileBuffer, folder);

export default uploadToCloudinary;