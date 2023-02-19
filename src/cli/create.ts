/* eslint-disable no-console */

import fs from "fs";
import path from "path";

import { die } from "./helpers/die";
import { exec } from "./helpers/exec";

interface Params {
  name: string;
  id: string;
  author: string;
  email: string;
  url: string;
  description: string;
  path: string;
  install: boolean;
  github: string;
  gitlab: string;
}

class FileUtils {
  public destination: string;

  public templateDir: string;

  constructor(destination: string, templateDir: string) {
    this.destination = destination;
    this.templateDir = templateDir;
  }

  copyFile(relativePath: string) {
    const filePath = path.join(this.destination, relativePath);

    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.copyFileSync(path.join(templateDir, relativePath), filePath);
  }

  createFile(relativePath: string, contents = "") {
    const filePath = path.join(this.destination, relativePath);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, contents);
  }

  template(
    templatePath: string,
    outputPath: string,
    data: Record<string, unknown>,
  ) {
    const filePath = path.join(this.destination, outputPath);
    let contents = fs
      .readFileSync(path.join(this.templateDir, templatePath))
      .toString("utf-8");

    Object.keys(data).forEach((key) => {
      contents = contents.replace(
        new RegExp(`{${key}}`, "g"),
        String(data[key]),
      );
    });

    fs.writeFileSync(filePath, contents);
  }
}

const templateDir = path.resolve(
  path.join(__dirname, "..", "..", "templates", "create"),
);

function getGitUser(params: Params) {
  const gitConfig = (path: string) => {
    const result = exec("git", ["config", "--get", path], {
      error: "",
      cwd: process.cwd(),
      exitOnError: false,
    });

    return result?.stdout.toString("utf-8").trim();
  };

  const authorName = params.author || gitConfig("user.name") || "[NAME]";

  return { authorName };
}

export function create(params: Params) {
  if (!params.path) {
    die("ERROR: you need to provide a path.");
  }

  const destination = path.resolve(params.path);

  if (fs.existsSync(destination)) {
    die(`ERROR: Path "${destination}" already exists.`);
  }

  if (params.github && params.gitlab) {
    die("ERROR: --github and --gitlab are mutually exclusive.");
  }

  fs.mkdirSync(destination, { recursive: true });

  const fileUtils = new FileUtils(destination, templateDir);
  const { authorName } = getGitUser(params);
  const repo = path.basename(destination);
  const gitUser = params.github || params.gitlab || "[USER]";
  const gitHost = params.gitlab ? "gitlab.com" : "github.com";
  const url = params.url || `https://${gitHost}/${gitUser}/${repo}`;
  const context = {
    year: new Date().getFullYear(),
    id: params.id,
    description: params.description,
    name: params.name,
    authorName,
    repo,
    gitUser,
    gitHost,
  };

  fileUtils.copyFile("tsconfig.json");
  fileUtils.copyFile("package.json");
  fileUtils.copyFile("src/css/sdpi.css");
  fileUtils.copyFile("src/inspector.html");
  fileUtils.copyFile("src/inspector.ts");
  fileUtils.copyFile("src/images/actions/Hello.png");
  fileUtils.copyFile("src/images/actions/Hello@2x.png");
  fileUtils.copyFile("src/images/actions/Hello/Key.png");
  fileUtils.copyFile("src/images/actions/Hello/Key@2x.png");
  fileUtils.copyFile("src/images/category.png");
  fileUtils.copyFile("src/images/category@2x.png");
  fileUtils.copyFile("src/images/plugin.png");
  fileUtils.copyFile("src/images/plugin@2x.png");
  fileUtils.copyFile("src/actions/Hello.ts");
  fileUtils.copyFile("src/plugin.ts");
  fileUtils.copyFile("icons.sketch");
  fileUtils.template("LICENSE.md", "LICENSE.md", context);
  fileUtils.template("CODE_OF_CONDUCT.md", "CODE_OF_CONDUCT.md", context);
  fileUtils.template("CHANGELOG.md", "CHANGELOG.md", context);

  if (params.gitlab) {
    fileUtils.template("gitlabREADME.md", "README.md", context);
  } else {
    fileUtils.template("githubREADME.md", "README.md", context);
  }

  fileUtils.createFile("release/.keep", "");

  fileUtils.createFile(
    "src/streamdeck.json",
    JSON.stringify(
      {
        id: params.id,
        version: "0.0.0",
        name: params.name,
        description: params.description,
        author: authorName,
        category: "Hello",
        monitor: { windows: [], mac: [] },
        url,
      },
      null,
      2,
    ),
  );

  fileUtils.createFile("src/css/custom.css");
  fileUtils.createFile("src/images/embed/.keep");
  fileUtils.createFile("src/images/multiActions/.keep");
  fileUtils.createFile("src/inspectors/.keep");
  fileUtils.createFile("src/locales/.keep");
  fileUtils.createFile("src/images.json", "{}");
  fileUtils.createFile(".gitignore", ["/build"].join("\n"));

  if (params.install) {
    const error =
      "ERROR: Sorry, there was an error while installing dependencies.";
    exec("npm", ["install"], { cwd: destination, error });
  }

  const error =
    "ERROR: Sorry, there was an error while initializing the Git repository.";

  exec("git", ["init"], { cwd: destination, error });
  exec("git", ["add", "."], { cwd: destination, error });
  exec("git", ["commit", "--message", "Initial commit."], {
    cwd: destination,
    error,
  });

  if (params.github || params.gitlab) {
    exec(
      "git",
      ["remote", "add", "origin", `git@${gitHost}:${gitUser}/${repo}.git`],
      { cwd: destination, error },
    );
  }
}
