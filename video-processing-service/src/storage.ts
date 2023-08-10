// GCS file interactions and local file interactions
import { Storage } from "@google-cloud/storage";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";

const storage = new Storage();

const rawVideoBucketName = "youtube-clone-raw-videos";
const processedVideoBucketName = "youtube-clone-processed-videos";

const localRawVideoPath = "./raw-videos";
const localProcessedVideoPath = "./processed-videos";

// Create the local directories for raw and processed videos
export function setupDirectories() {
  ensureDirectoryExistence(localRawVideoPath);
  ensureDirectoryExistence(localProcessedVideoPath);
}

/**
 * @param rawVideoName - The name of the file to convert from {@link localRawVideoPath}
 * @param processedVideoName - The name of the file to convert to {@link localProcessedVideoPath}
 * @returns A promise that resolves when the video conversion is complete
 */
export function convertVideo(rawVideoName: string, processedVideoName: string) {
  return new Promise<void>((resolve, reject) => {
    ffmpeg(`${localRawVideoPath}/${rawVideoName}`)
      .outputOptions("-vf", "scale=-1:360") //360p conversion
      .on("end", () => {
        console.log("Video processing finished!");
        resolve();
      })
      .on("error", (err) => {
        console.log("Error: ", err);
        reject(err);
      })
      .save(`${localProcessedVideoPath}/${processedVideoName}`);
  });
}

/**
 * @param fileName - The name of the file to download from the {@link rawVideoBucketName} bucket into
 * the {@link localRawVideoPath} directory
 * @returns A promise that resolves when the file is downloaded
 */
export async function downloadRawVideo(fileName: string) {
  const options = {
    destination: `${localRawVideoPath}/${fileName}`,
  };
  await storage.bucket(rawVideoBucketName).file(fileName).download(options);
  console.log(
    `gs://${rawVideoBucketName}/${fileName} downloaded to ${localRawVideoPath}/${fileName}.`
  );
}

/**
 * @param fileName - The name of the file to upload from the {@link localProcessedVideoPath} directory into
 * the {@link processedVideoBucketName} bucket
 * @returns A promise that resolves when the file is uploaded
 */
export async function uploadProcessedVideo(fileName: string) {
  const bucket = storage.bucket(processedVideoBucketName);
  await bucket.upload(`${localProcessedVideoPath}/${fileName}`, {
    destination: fileName,
  });
  console.log(`${fileName} uploaded to ${processedVideoBucketName}.`);

  await bucket.file(fileName).makePublic(); // Make the video file public in the bucket
}

/**
 * @param fileName - The name of the file to delete from the {@link localRawVideoPath} folder.
 * @returns A promise that resolves when the file is deleted
 */
export function deleteRawVideo(fileName: string) {
  return deleteFile(`${localRawVideoPath}/${fileName}`);
}

/**
 * @param fileName - The name of the file to delete from the {@link localProcessedVideoPath} folder.
 * @returns A promise that resolves when the file is deleted
 */
export function deleteProcessedVideo(fileName: string) {
  return deleteFile(`${localProcessedVideoPath}/${fileName}`);
}

/**
 * @param filePath - The path of the file to delete
 * @returns A promise that resolves when the file is deleted
 */
function deleteFile(filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.log(`Failed to delete file at ${filePath}`, err);
          reject(err);
        } else {
          console.log(`File at ${filePath} deleted`);
          resolve();
        }
      });
    } else {
      console.log(`File at ${filePath} does not exist`);
      resolve();
    }
  });
}

/**
 * Ensures a directory exists at the given path, creating it if it does not exist
 * @param {string} dirPath - The path of the directory to ensure exists
 */
function ensureDirectoryExistence(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true }); // recursive: true enables creating nested directories
    console.log(`Directory created at ${dirPath}`);
  }
}
