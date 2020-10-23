const Generator = require("yeoman-generator");
const path = require("path");

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);
    this.argument("name", { type: String, required: false });

    this.option("yarn", {
      description: "Use Yarn as the package manager",
    });

    this.option("docker", {
      description: "Install Docker artifacts including a Dockerfile",
    });

    this.useYarn = this.options.yarn;
    this.docker = this.options.docker;
    this.name = this.options.name || "express-app";
    this.description = "";
    this.version = "1.0.0";
  }

  initializing() {}

  async prompting() {
    const prompts = [
      {
        type: "input",
        name: "description",
        message: `App description [${this.description}]`,
      },
    ];

    if (!this.options.name) {
      prompts.unshift({
        type: "input",
        name: "name",
        message: `App name [${this.name}]`,
      });
    }

    return await this.prompt(prompts).then((r) => {
      this.name = r.name ? r.name : this.name;
      this.description = r.description ? r.description : this.description;
    });
  }

  writing() {
    // Copy src directory
    this.fs.copy(this.sourceRoot(), this.destinationPath(this.name));

    // List of files from root to be copy
    const files = [
      ".eslintrc.js",
      ".prettierrc.js",
      "package.json",
      "nodemon.json",
      "tsconfig.json",
      "Dockerfile",
      "gitignore",
    ];

    // EJS options to be parsed
    const opts = {
      name: this.name,
      title: this.name,
      description: this.description,
      version: this.version,
    };

    // Copy each file
    files.forEach((f) => {
      this.fs.copyTpl(
        this.templatePath(f),
        this.destinationPath(`${this.name}/${f}`),
        opts
      );
    });

    // Rename the gitignore file
    this.fs.move(
      this.destinationPath(`${this.name}`, "gitignore"),
      this.destinationPath(`${this.name}`, ".gitignore")
    );
  }

  install() {
    const appDir = path.join(process.cwd(), this.name);
    process.chdir(appDir);
    if (this.useYarn) {
      this.yarnInstall();
    } else {
      this.npmInstall();
    }
  }
};
