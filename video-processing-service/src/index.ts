import express from "express";
import ffmpeg from "fluent-ffmpeg";

const app = express();
app.use(express.json());

app.post("/process-video", (req, res) => {
  // Get path of the input video file from the request body
  const inputVideoPath = req.body.inputVideoPath;
  const outputVideoPath = req.body.outputVideoPath;

  if (!inputVideoPath) {
    res.status(400).send("Input video path is required");
  }
  if (!outputVideoPath) {
    res.status(400).send("Output video path is required");
  }

  ffmpeg(inputVideoPath)
    .outputOptions("-vf", "scale=-1:360") //360p conversion
    .on("end", () => {
      res.status(200).send("Video processing finished!");
    })
    .on("error", (err) => {
      console.log("Error: ", err);
      res.status(500).send("Internal Server Error: ${err.message}");
    })
    .save(outputVideoPath);
});
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(
    `Video processing service app listening at http://localhost:${port}`
  );
});
