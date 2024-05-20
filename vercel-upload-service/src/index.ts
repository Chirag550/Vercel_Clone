import express from "express";
import cors from "cors";
import simpleGit from "simple-git";
import { generate } from "./utils";
import { getAllFiles } from "./file";

import path from "path";

const app = express();
app.use(cors());
app.use(express.json());

console.log("server is running");

app.post("/deploy", async (req, res) => {
  const repoUrl = req.body.repoUrl;

  //generating a random id
  const id = generate(); // asd12

  //clone a git repo in local
  await simpleGit().clone(repoUrl, path.join(__dirname, `output/${id}`));

  //get all files path for uploading in s3

  const files = getAllFiles(path.join(__dirname, `output/${id}`));

  //upload to s3(aws)

  //publish in redis queue

  res.json({
    id: id,
  });
});

app.listen(3000);
