import fs from "fs";
import path from "path";
import * as glob from "glob";

const sourceDir = path.join(process.cwd(), "src");

const getContentType = (filePath: string): string => {
  if (filePath.endsWith("png")) {
    return "image/png";
  }

  if (filePath.endsWith("gif")) {
    return "image/gif";
  }

  return "image/jpeg";
};

export function images() {
  const images = {} as Record<string, string>;

  glob
    .sync(`${sourceDir}/images/embed/**/*.{png,jpg,gif}`)
    .forEach((imagePath) => {
      if (!imagePath.includes("@2x")) {
        return;
      }

      const contents = fs.readFileSync(imagePath).toString("binary");
      const base64 = btoa(contents);
      const contentType = getContentType(imagePath);
      const dataURL = `data:${contentType};base64,${base64}`;
      const name = path
        .basename(imagePath, path.extname(imagePath))
        .replace("@2x", "");

      images[name] = dataURL;
    });

  fs.writeFileSync(
    path.join(sourceDir, "images.json"),
    JSON.stringify(images, null, 2),
  );
}
