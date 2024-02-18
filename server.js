const fs = require("fs");
const path = require("path");
const colors = require("colors");

const jsonFormat = ["command"];

class Server {
  server = null;
  port = null;
  dgram = require("dgram");
  dir = null;
  //
  constructor(port, dir) {
    this.server = this.dgram.createSocket("udp4");
    this.port = port;
    this.server.bind(port);
    this.dir = dir;
  }

  //
  async command(c, file = null, fileName = null) {
    switch (c) {
      case "list":
        let response = fs.readdirSync(this.dir);

        return { resType: "list", data: response };
      case "upload":
        try {
          fs.writeFileSync(`${this.dir}/${fileName}`, Buffer.from(file));

          const message = `[!] File uploaded to ${this.dir}/${fileName} `;

          return { resType: "upload", data: message };
        } catch (error) {
          console.log(error);
          return { resType: "upload", data: "Error" };
        }
      case "download":
        try {
          const fileBuff = fs.readFileSync(
            `${this.dir}/${path.basename(fileName)}`
          );

          return { resType: "download", data: fileBuff };
        } catch (error) {
          return { resType: "download", data: " File not found" };
        }

      case "delete":
        const userPath = path.join(this.dir, fileName);
        const absolutePath = path.resolve(userPath);
        if (absolutePath.startsWith(this.dir)) {
          try {
            fs.unlinkSync(absolutePath);
            return { resType: "delete", deleted: true };
          } catch (error) {
            return { resType: "delete", data: " File not found" };
          }
        } else {
          return { resType: "delete", data: "?xd" };
        }
      default:
        console.log("Command does not exists");
        break;
    }
  }
  start() {
    this.server.on("message", async (message, info) => {
      const data = JSON.parse(Buffer.from(message, "utf-8").toString("utf8"));
      const hasFormat = jsonFormat.every((key) => data.hasOwnProperty(key));
      if (!hasFormat) {
        //Send error to client
      } else {
        //PASSED
        const c = data.command;
        const file = data.file;
        const fileName = data.fileName;

        const dataSvr = await this.command(c, file, fileName);
        console.log(
          `${colors.bgCyan("[log]".red.bold)} User: ${info.address}:${
            info.port
          } | Action: ${c} | ${new Date().toUTCString()}`
        );

        this.server.send(JSON.stringify(dataSvr), info.port, info.address);
      }
    });
    //
    this.server.on("listening", () => {
      const address = this.server.address();
      console.log(
        "========================================================".green
      );
      console.log(`                   File server running `.bold);
      console.log(
        "========================================================\n".green
      );
      console.log(
        `${colors.yellow("[!]")}${colors.blue(" Server Dir:")} ${this.dir}`
      );
      console.log(
        `${colors.yellow("[!]")} ${colors.blue("Server Address:")} ${
          address.address
        }`
      );
      console.log(
        `${colors.yellow("[!]")} ${colors.blue("Server Port:")} ${address.port}`
      );
      console.log(
        `${colors.yellow("[!]")} ${colors.cyan("Waiting for clients...\n")}`
      );
    });
  }
}

module.exports = Server;
