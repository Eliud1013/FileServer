const dgram = require("dgram");
const fs = require("fs");
const path = require("path");
const errorHandler = require("./errorHandler");
const colors = require("colors");

class Client {
  address = "";
  port = null;
  action = null;
  client = null;
  file = "";
  outputPath = null;
  constructor(address, port, action, file, outputPath) {
    this.address = address;
    this.port = port;
    this.action = action;
    this.client = dgram.createSocket("udp4");
    this.file = file;
    this.outputPath = outputPath;

    this.exec(this.action, file);
  }
  async sendMessage(message = "") {
    const buffer = Buffer.from(message);
    this.client.send(
      buffer,
      0,
      buffer.length,
      this.port,
      this.address,
      (err) => {
        if (err) {
          console.error("Error al enviar el mensaje:", err);
        }
      }
    );
  }
  async exec(action = "") {
    if (action == "") process.exit(1);
    switch (action) {
      case "list":
        const messageList = { command: "list" };
        this.sendMessage(JSON.stringify(messageList));
        this.recieve();
        break;
      case "upload":
        const fileNameUpload = path.basename(this.file);
        const fileBuff = fs.readFileSync(this.file);
        const messageUpload = {
          command: "upload",
          file: fileBuff,
          fileName: fileNameUpload,
        };

        this.sendMessage(JSON.stringify(messageUpload));
        this.recieve();
        break;
      case "download":
        const fileNameDownload = path.basename(this.file);
        const messageDownload = {
          command: "download",
          fileName: fileNameDownload,
        };
        this.sendMessage(JSON.stringify(messageDownload));
        this.recieve();
        break;
      case "delete":
        const fileNameDelete = path.basename(this.file);
        const messageDelete = {
          command: "delete",
          fileName: fileNameDelete,
        };
        this.sendMessage(JSON.stringify(messageDelete));
        this.recieve();
      default:
        break;
    }
  }
  recieve() {
    this.client.on("message", (msg, rinfo) => {
      const response = JSON.parse(Buffer.from(msg, "utf-8").toString("utf-8"));

      if (response.resType == "list") {
        let i = 1;
        console.log(
          `${colors.dim("====".cyan)} File List ${colors.dim("====\n".cyan)}`
        );
        response.data.forEach((e) => {
          console.log(`${colors.blue(i + ".")} ${colors.white(e)}`);
          i++;
        });
        console.log(`${colors.dim("\n===================".cyan)}`);
      } else if (response.resType == "upload") {
        console.log(response.data);
      } else if (response.resType == "download") {
        const buffer = Buffer.from(response.data);
        if (this.outputPath) {
          try {
            fs.writeFileSync(
              this.outputPath,
              buffer.toString("utf-8"),
              "utf-8",
              (err) => {
                if (err) {
                  let message = errorHandler(err);
                  console.log(message);
                }
              }
            );
          } catch (err) {
            if (err) {
              let message = errorHandler(err);
              console.log(message + this.outputPath);
            }
          }
        } else {
          console.log("\n[*] File content:");
          console.log("-------------------------");
          console.log(buffer.toString("utf-8").white);
          console.log("-------------------------");
          console.log("[!] Use -o option to save content to a file");
        }
      } else if (response.resType == "delete") {
        if (response.deleted) {
          console.log("[!] The file has been deleted.");
        } else {
          console.log("[!] The file has not been deleted.");
          console.log("[?] Does the file exists?.");
        }
      }

      this.client.close();
    });
  }

  hello() {
    console.log(this.address + ":" + this.port + " Action: " + this.action);
  }
}

module.exports = Client;
