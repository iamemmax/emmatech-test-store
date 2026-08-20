import path from "path";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../utils/cloudinaryConfig";

function uploadMiddleware(folderName: string) {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: (req, file) => {
      const folderPath = folderName.trim();
      const fileExtension = path.extname(file.originalname).substring(1);
     const publicId = `${file.fieldname}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      return {
        folder: folderPath,
        public_id: publicId,
        format: fileExtension,
      };
    },
  });

  return multer({
    storage,
    limits: {
      fileSize: 5 * 1024 * 1024, // keep images size < 5 MB
    },
  });
}

export default uploadMiddleware;



export const destroyImages = async (publicIds: string[]) => {
  if (!publicIds.length) return [];
  const results = await Promise.allSettled(
    publicIds.map(id => cloudinary.uploader.destroy(id, { invalidate: true }))
  );
  results.forEach((r, i) => {
    if (r.status === "rejected") console.error(`cloudinary destroy failed: ${publicIds[i]}`, r.reason);
    else if (r.value.result !== "ok") console.warn(`cloudinary: ${publicIds[i]} → ${r.value.result}`);
  });
  return results;
};