import { createClient, commandOptions } from "redis";
import { copyFinalDist, downloadS3Folder } from "./aws";
import { buildProject } from "./utils";

const subscriber = createClient();
subscriber.connect();
console.log("Entered in Deploy Service ");

async function main() {
  while (1) {
    const res = await subscriber.brPop(
      commandOptions({ isolated: true }),
      "build-queue",
      0
    );
    // @ts-ignore;
    const id = res.element as string;
    console.log(id);

    await downloadS3Folder(`output/${id}`);
    await buildProject(id);
    copyFinalDist(id);
  }
}
main();
