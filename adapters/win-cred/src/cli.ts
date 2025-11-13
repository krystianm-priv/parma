import { argv, stdin, stdout } from "node:process";
import { addSecret } from "./win-cred.js";

const [_nodePath, _scriptPath, secretName] = argv;

if (!secretName) {
  console.error("Usage: parma-win-cred <secret_name>");
  process.exit(1);
}

const NAME = secretName.toUpperCase();

function readSecret(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    stdout.write(prompt);
    stdin.setRawMode(true);
    stdin.resume();

    let password = "";

    stdin.on("data", (char) => {
      const byte = char.toString();

      switch (byte) {
        case "\n":
        case "\r":
        case "\u0004": // Ctrl-D
          stdin.setRawMode(false);
          stdin.pause();
          stdout.write("\n");
          resolve(password);
          break;
        case "\u0003": // Ctrl-C
          process.exit(0);
          break;
        case "\u007f": // Backspace
        case "\b":
          if (password.length > 0) {
            password = password.slice(0, -1);
            stdout.write("\b \b"); // Erase the asterisk
          }
          break;
        default:
          password += byte;
          stdout.write("*"); // Show asterisk
          break;
      }
    });
  });
}

readSecret(`Enter value for "${NAME}": `).then((SECRET) => {
  addSecret(NAME, SECRET);
});
