import { S3 } from "aws-sdk";
import fs from "fs";

const s3 = new S3({
  accessKeyId: "ed29f2842da94dcfe242d7b21afe7d5b",
  secretAccessKey:
    "965bce1c2d916332e0b1dccb69c61b0fcac073fdbc333f9f4df751a7e579d3be",
  endpoint: "https://fccb72b040c1e4466774e912731b5e37.r2.cloudflarestorage.com",
});

// fileName => output/12312/src/App.jsx
// filePath => C:\Users\Chira\OneDrive\Desktop\Vercel_Clone\vercel-upload-service\dist\output\12312\src\App.jsx
export const uploadFile = async (fileName: string, localFilePath: string) => {
  const fileContent = fs.readFileSync(localFilePath);
  const response = await s3
    .upload({
      Body: fileContent,
      Bucket: "vercel",
      Key: fileName,
    })
    .promise();
};
