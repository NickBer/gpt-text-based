const answerInChat = require("./answerInChat.js");

const filePath = process.argv[2] || path.join(__dirname, "chat.txt");

async function main() {
    answerInChat(filePath);
}
main();