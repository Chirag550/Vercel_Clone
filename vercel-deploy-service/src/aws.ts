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
export async function downloadS3Folder(prefix: string) {
  const allFiles = await s3
    .listObjectsV2({
      Bucket: "vercel",
      Prefix: prefix,
    })
    .promise();

  //
  const allPromises =
    allFiles.Contents?.map(async ({ Key }) => {
      return new Promise(async (resolve) => {
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
          });
      });
    }) || [];
  console.log("awaiting");

  await Promise.all(allPromises?.filter((x) => x !== undefined));
}
