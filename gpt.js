const fs = require("fs");
const path = require("path");
const { OpenAI } = require("openai");
const processImages = require("./processImages");
const parseChatFile = require("./parseChatFile");
const processTextFile = require("./processTextFile");
require("dotenv").config({path: path.join(__dirname, ".env")});
const separator = process.env.SEPARATOR || "====================";

const openai = new OpenAI();
// first argument or default to chat.txt
const filePath = process.argv[2] || path.join(__dirname, "chat.txt");
const file = fs.readFileSync(filePath, "utf8").trim();

async function main() {
    let messages = parseChatFile(file, separator);
    messages = messages.map((message) => {
        if (message.role === "user" || message.role === "assistant" || message.role === "system") {
            message.content = processTextFile(message.content);
            return packMessage(message.role, message.content, message.images);
        } else {
            throw new Error("Unknown message type");
        }
    });
    // log stringified messages
    const assistantAnswer = await chatCompletion(messages);
    const newFile = file + "\n" + separator + "\n" + assistantAnswer + "\n" + separator + "\n";
    fs.writeFileSync(filePath, newFile);
}

async function chatCompletion(messages) {
    console.log("Thinking...");
    const response = await openai.chat.completions.create({
        model: process.env.GPT_MODEL || "gpt-4-1106-preview",
        messages,
        max_tokens: 4096,
        stream: false,
    });
    const stats = JSON.stringify(response.usage);
    const content = response.choices[0].message.content;
    console.log(response.choices[0].finish_details);
    return stats + "\n" + content;
}

function packMessage(role, text, images) {
    if (text === undefined) throw new Error("packMessage:text is undefined");
    if (role === "system" || role === "assistant") {
        if (images !== undefined)
            console.log("WARNING: for assistant or system messages, image should be undefined");
    }
    const message = {
        role,
        content: [{ type: "text", text }],
    };
    if (!images) return message;
    images = processImages(images);
    images = images.map((image) => ({ type: "image_url", image_url: { url: image, detail: "high" } }));
    message.content = message.content.concat(images);
    return message;
}

main();
