const args = require("yargs")
  //Main Options
  .option("port", { alias: "p", demandOption: true, describe: "" })
  .option("server", { type: "boolean", describe: "Server mode" })
  .option("connect", { type: "string", describe: "Server address" })
  .option("list", {
    alias: "ls",
    type: "boolean",
    desc: "[Action] Fist files in the server ",
  })
  .option("upload", {
    type: "boolean",
    desc: "[Action] Upload file to server",
  })
  .option("download", {
    type: "boolean",
    desc: "[Action] Download a file from the server",
  })
  .option("file", {
    alias: "f",
    type: "string",
    desc: "File",
  })
  .option("output", {
    alias: "o",
    type: "string",
    desc: "Path to save file",
  })
  .option("delete", {
    alias: "d",
    type: "boolean",
    desc: "Delete a file",
  })
  .option("dir", { type: "string", desc: "Server dir" })

  .check((arg) => {
    if (arg.connect == null && !arg.server) {
      throw new Error("When using --server, --connect is required.");
    }
    if (arg.connect == "") {
      throw new Error("[ERROR] Please specify server address to connect.");
    }
    let actionCount = 0;
    if (arg.list) actionCount++;
    if (arg.upload) actionCount++;
    if (arg.download) actionCount++;
    if (actionCount > 1) {
      console.log(arg.upload);
      throw new Error("[ERROR] Please specify only one action");
    }
    if (arg.server && !arg.dir) {
      throw new Error("[ERROR] Please specify directory ");
    }
    return true;
  }).argv;

const mode = args.connect ? "connect" : "server";
const port = args.port;

switch (mode) {
  case "connect":
    let action = "";
    if (args.list) action = "list";
    if (args.upload) action = "upload";
    if (args.download) action = "download";
    if (args.delete) action = "delete";

    if (
      (action == "upload" || action == "download" || action == "delete") &&
      !args.file
    ) {
      console.log("[X] Please specify a file with the -f option.\n");
      console.log(
        `Example: ${process.argv[1]} --connect 192.168.1.2 -p 4444 --upload -f /etc/passwd`
      );
      process.exit(1);
    }

    const Client = require("./client");
    const client = new Client(
      args.connect,
      port,
      action,
      args.file,
      args.output
    );

    break;

  case "server":
    const Server = require("./server");
    const server = new Server(port, args.dir);
    server.start();
    break;
}
