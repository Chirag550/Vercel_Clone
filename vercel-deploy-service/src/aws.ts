import { S3 } from "aws-sdk";
import fs from "fs";
import path from "path";

const s3 = new S3({
  accessKeyId: "ed29f2842da94dcfe242d7b21afe7d5b",
  secretAccessKey:
    "965bce1c2d916332e0b1dccb69c61b0fcac073fdbc333f9f4df751a7e579d3be",
  endpoint: "https://fccb72b040c1e4466774e912731b5e37.r2.cloudflarestorage.com",
});

// output/asdasd

function delay(ms: any) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function listObjectsWithDelay(bucket: any, prefix: any, delayTime: any) {
  // Add delay
  await delay(delayTime);

  // List objects
  const allFiles = await s3
    .listObjectsV2({
      Bucket: bucket,
      Prefix: prefix,
    })
    .promise();

  return allFiles;
}
export async function downloadS3Folder(prefix: string) {
  try {
    const allFiles = await listObjectsWithDelay("vercel", prefix, 10000);

    console.log("in download s3 folder");
    console.log("All Files: ", JSON.stringify(allFiles, null, 2));

    if (!allFiles.Contents || allFiles.Contents.length === 0) {
      console.log("No files found for the given prefix.");
      return;
    }

    const allPromises = allFiles.Contents.map(async ({ Key }) => {
      return new Promise((resolve, reject) => {
        if (!Key) {
          resolve("");
          return;
        }
        const finalOutputPath = path.join(__dirname, Key);
        const outputFile = fs.createWriteStream(finalOutputPath);
        const dirName = path.dirname(finalOutputPath);
        if (!fs.existsSync(dirName)) {
          fs.mkdirSync(dirName, { recursive: true });
        }
        s3.getObject({
          Bucket: "vercel",
          Key,
        })
          .createReadStream()
          .pipe(outputFile)
          .on("finish", () => {
            resolve("");
          })
          .on("error", (err) => {
            console.error(`Error downloading file ${Key}:`, err);
            reject(err);
          });
      });
    });

    console.log("Awaiting promises...");

    await Promise.all(allPromises);

    console.log("Downloaded");
  } catch (err) {
    console.error("Error in listObjectsV2:", err);
  }
}

export function copyFinalDist(id: string) {
  const folderPath = path.join(__dirname, `output/${id}/build`);
  const allFiles = getAllFiles(folderPath);
  allFiles.forEach((file) => {
    uploadFile(
      (`dist/${id}/` + file.slice(folderPath.length + 1)).replace(/\\/g, "/"),
      file
    );
  });
}

const getAllFiles = (folderPath: string) => {
  let response: string[] = [];

  const allFilesAndFolders = fs.readdirSync(folderPath);
  allFilesAndFolders.forEach((file) => {
    const fullFilePath = path.join(folderPath, file);
    if (fs.statSync(fullFilePath).isDirectory()) {
      response = response.concat(getAllFiles(fullFilePath));
    } else {
      response.push(fullFilePath);
    }
  });
  return response;
};

const uploadFile = async (fileName: string, localFilePath: string) => {
  const fileContent = fs.readFileSync(localFilePath);
  const response = await s3
    .upload({
      Body: fileContent,
      Bucket: "vercel",
      Key: fileName,
    })
    .promise();
  console.log(response);
};
