require("dotenv").config();
const errorHandler = require("./errorHandler");
const ftp = require("ftp");
const client = new ftp();

let conn = null;
const ftpDir = process.env.FTP_DIR;

const ftpConfig = {
  host: process.env.FTP_HOST,
  user: process.env.FTP_USER,
  password: process.env.FTP_PASSWD,
};
// LIST FILES

function listFiles() {
  if (conn == null) {
    connect();
  }
  return new Promise((resolve, reject) => {
    client.on("ready", () => {
      client.list((err, list) => {
        if (err) {
          reject(err);
        } else {
          resolve(list);
        }
        client.end();
      });
    });
  });
}
function deleteFile(fileName) {
  if (conn == null) {
    connect();
  }
  return new Promise((resolve, reject) => {
    client.on("ready", () => {
      client.delete(fileName, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }

        client.end();
      });
    });
    client.on("error", (error) => {
      console.log("error");
    });
  });
}
function downloadFile(fileName) {
  if (conn == null) {
    connect();
  }

  return new Promise((resolve, reject) => {
    client.on("ready", () => {
      const buffer = [];

      client.get(fileName, (err, stream) => {
        if (err) {
          reject(err);
          client.end();
          return;
        }

        stream.on("data", (chunk) => {
          buffer.push(chunk);
        });

        stream.on("end", () => {
          const fileBuffer = Buffer.concat(buffer);
          resolve(fileBuffer);
        });

        stream.on("error", (err) => {
          reject(err);
          client.end();
        });
      });
    });

    client.on("error", (err) => {
      // Maneja errores en la conexión FTP
      reject(err);
    });
  });
}

function uploadFile(buffer, fileName) {
  if (conn == null) {
    connect();
  }
  return new Promise((resolve, reject) => {
    client.on("ready", () => {
      client.put(buffer, `${ftpDir}/${fileName}`, (err) => {
        if (err) {
          console.error("Error al subir el archivo:", err);
        } else {
          resolve("[!] The file has been uploaded.");
        }
        client.end();
      });
    });
  });
}
async function connect() {
  conn = await client.connect(ftpConfig);
  client.on("error", (err) => {
    const message = errorHandler(err);
    console.log(message);
  });
}

module.exports = { listFiles, uploadFile, downloadFile, deleteFile };
