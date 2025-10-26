import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import { PrismaClient } from "@prisma/client";
import multer from "multer";

const prisma = new PrismaClient();

// Multer config (in-memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage }).single("file");

export const uploadFileAndGetUrl = async (req, res) => {
  upload(req, res, async (err) => {
    if (err)
      return res
        .status(400)
        .json({ ok: false, message: "Upload error", error: err });
    if (!req.file)
      return res.status(400).json({ ok: false, message: "No file uploaded" });

    const { courseId } = req.body;
    if (!courseId)
      return res
        .status(400)
        .json({ ok: false, message: "courseId is required" });

    // ✅ Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: parseInt(courseId) },
    });
    if (!course)
      return res.status(404).json({ ok: false, message: "Course not found" });

    const file = req.file;
    const mime = file.mimetype;
    const isImage = mime.startsWith("image/");
    const isPDF = mime === "application/pdf";

    if (!isImage && !isPDF) {
      return res
        .status(400)
        .json({ ok: false, message: "Only image and PDF files are allowed" });
    }

    // ✅ Determine destination folder
    const folder = isImage ? "images" : "pdf";
    const fileName = `${Date.now()}_${file.originalname}`;
    const fullPath = `courses/${courseId}/${folder}/${fileName}`;

    const fileUpload = bucket.file(fullPath);
    const token = uuidv4();

    // ✅ Optional: optimize image
    let fileBuffer = file.buffer;
    if (isImage) {
      try {
        fileBuffer = await sharp(file.buffer)
          .resize({ width: 1080 }) // adjust size as needed
          .jpeg({ quality: 70 }) // adjust quality
          .toBuffer();
      } catch (error) {
        return res
          .status(500)
          .json({ ok: false, message: "Image optimization failed", error });
      }
    }

    // ✅ Upload to Firebase Storage
    const stream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
        metadata: {
          firebaseStorageDownloadTokens: token,
        },
      },
    });

    stream.on("error", (error) => {
      console.error("Upload error:", error);
      return res
        .status(500)
        .json({ ok: false, message: "Upload failed", error });
    });

    stream.on("finish", () => {
      const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${
        bucket.name
      }/o/${encodeURIComponent(fullPath)}?alt=media&token=${token}`;
      return res.status(200).json({
        ok: true,
        message: "File uploaded successfully",
        fileUrl: downloadUrl,
      });
    });

    stream.end(fileBuffer);
  });
};

export const deleteFileFromStorage = async (req, res) => {
  const { path } = req.body;

  if (!path) {
    return res
      .status(400)
      .json({ ok: false, message: "File path is required" });
  }

  try {
    const file = bucket.file(path);
    const [exists] = await file.exists();

    if (!exists) {
      return res.status(404).json({ ok: false, message: "File not found" });
    }

    await file.delete();
    return res
      .status(200)
      .json({ ok: true, message: "File deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    return res
      .status(500)
      .json({ ok: false, message: "Failed to delete file", error });
  }
};
