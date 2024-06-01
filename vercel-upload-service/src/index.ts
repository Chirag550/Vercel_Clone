//id -ed29f2842da94dcfe242d7b21afe7d5b
//secret - 965bce1c2d916332e0b1dccb69c61b0fcac073fdbc333f9f4df751a7e579d3be
//endpoint -https://fccb72b040c1e4466774e912731b5e37.r2.cloudflarestorage.com
import express from "express";
import cors from "cors";
import simpleGit from "simple-git";
import { generate } from "./utils";
import { getAllFiles } from "./file";

import path from "path";
import { uploadFile } from "./aws";

const app = express();
app.use(cors());
app.use(express.json());

console.log("server is running");
console.log(__dirname);

app.post("/deploy", async (req, res) => {
  const repoUrl = req.body.repoUrl;

  //generating a random id
  const id = generate(); // asd12
  console.log(__dirname);

  //clone a git repo in local
  await simpleGit().clone(repoUrl, path.join(__dirname, `output/${id}`));

  //get all files path for uploading in s3

  const files = getAllFiles(path.join(__dirname, `output/${id}`));

  //upload to s3(aws)
  files.forEach(async (file) => {
    await uploadFile(file.slice(__dirname.length + 1), file);
  });

  //publish in redis queue

  res.json({
    id: id,
  });
});

app.listen(3000);
