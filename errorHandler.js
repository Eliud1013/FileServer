module.exports = function (err) {
  let message = "";
  switch (err.code) {
    case "ECONNREFUSED":
      message =
        "[X] Connection to FTP server refused\n[?] Is the FTP server active?";
      break;
    case "EACCES":
      message = "[X] You do not have permission to write: ";
      break;
    default:
      message = "[?] Unknown error";
      break;
  }
  return message;
};
