const chalk = require("chalk");
const NodeEnvironment = require("jest-environment-node");
const puppeteer = require("puppeteer");
const treeKill = require("tree-kill");
const { spawn } = require("child_process");
const { promisify } = require("util");

async function killProc(proc) {
  await promisify(treeKill)(proc.pid);
  console.log(chalk.green(`Successfully Close Page Server`));
}
class PuppeteerEnvironment extends NodeEnvironment {
  async setup() {
    console.log(chalk.green("Setup Puppeteer"));
    const browser = await puppeteer.launch({});
    // This global is not available inside tests but only in global teardown
    console.log(chalk.green("Start Page Server"));
    await this.startPage();
    this.global.__BROWSER__ = browser;
  }

  startPage() {
    const ls = spawn("npm", ["run", "start"], { stdio: "pipe" });
    let pageResolve;
    ls.stdout.on("data", (data) => {
      const infoStr = `${data}`;
      if (infoStr.match(/Compiled successfully/)) {
        setTimeout(() => {
          typeof pageResolve === "function" && pageResolve();
        }, 1000);
      }
      console.log(chalk.blue(infoStr));
    });

    ls.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
    });

    this.pageServerProc = ls;
    return new Promise((resolve) => {
      pageResolve = resolve;
    });
  }

  async teardown() {
    console.log(chalk.green("Teardown Puppeteer"));
    this.pageServerProc && killProc(this.pageServerProc);
    await this.global.__BROWSER__.close();
  }

  runScript(script) {
    return super.runScript(script);
  }
}

module.exports = PuppeteerEnvironment;
