import express from "express";
import {
  convertVideo,
  deleteProcessedVideo,
  deleteRawVideo,
  downloadRawVideo,
  setupDirectories,
  uploadProcessedVideo,
} from "./storage";

setupDirectories();

const app = express();
app.use(express.json());

app.post("/process-video", async (req, res) => {
  // Get the bucket and file name from the Cloud Pub/Sub message.
  let data;
  try {
    const message = Buffer.from(req.body.message.data, "base64").toString(
      "utf8"
    );
    data = JSON.parse(message);
    if (!data.name) {
      throw new Error("Invalid message payload received from Pub/Sub");
    }
  } catch (error) {
    console.error(error);
    return res.status(400).send("Bad Request: missing file name");
  }

  const inputFileName = data.name;
  const outputFileName = `processed-${inputFileName}`;

  //download the file from the raw video bucket
  await downloadRawVideo(inputFileName);

  //convert the video to 360p
  try {
    await convertVideo(inputFileName, outputFileName);
  } catch (err) {
    await Promise.all([
      deleteRawVideo(inputFileName),
      deleteProcessedVideo(outputFileName),
    ]); //instead of await each function use promise all
    console.log(err);
    return res
      .status(500)
      .send("Internal Server Error: video conversion failed");
  }

  //upload the video to the processed video bucket
  await uploadProcessedVideo(outputFileName);
  await Promise.all([
    deleteRawVideo(inputFileName),
    deleteProcessedVideo(outputFileName),
  ]);

  return res.status(200).send("Video processing complete");
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(
    `Video processing service app listening at http://localhost:${port}`
  );
});
