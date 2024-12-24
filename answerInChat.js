const fs = require("fs");
const path = require("path");
const { OpenAI } = require("openai");
const processImages = require("./processImages");
const parseChatFile = require("./parseChatFile");
const processTextFile = require("./processTextFile");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const log = require("loglevel");
const separator = process.env.SEPARATOR || "====================";


let model = process.env.GPT_MODEL || "o1-preview";

const openai = new OpenAI();
// first argument or default to chat.txt
const filePath = process.argv[2] || path.join(__dirname, "chat.txt");

async function answerInChat(chatFilePath) {
    const chatFile = fs.readFileSync(chatFilePath, "utf8").trim();
    let messages = parseChatFile(chatFile, separator);
    messages = messages.map((message) => {
        if (message.role === "user" || message.role === "assistant" || message.role === "system") {
            message.content = processTextFile(message.content, chatFilePath);
            return packMessage(message.role, message.content, message.images);
        } else {
            throw new Error("Unknown message type");
        }
    });
    // log stringified messages
    const assistantAnswer = await chatCompletion(messages);
    const newFile = chatFile + "\n" + separator + "\n" + assistantAnswer + "\n" + separator + "\n";
    fs.writeFileSync(chatFilePath, newFile);
}

async function chatCompletion(messages) {
    log.info("Thinking...");
    console.log("Using model:", model);
    const response = await openai.chat.completions.create({
        model: model,
        messages,
        stream: false,
        // reasoning_effort: "high"
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
    images = images.map((image) => ({
        type: "image_url",
        image_url: { url: image, detail: "high" },
    }));
    message.content = message.content.concat(images);
    return message;
}

module.exports = answerInChat;