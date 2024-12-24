const runChat = require("./runChat.js");
const fs = require("fs");
const path = require("path");
const log = require("loglevel");
const parseChatFile = require("./parseChatFile.js");
const separator = process.env.SEPARATOR || "====================";

const chatsDir = path.join(__dirname, "chats");
const promptsDir = path.join(__dirname, "prompts");
const processedPromptsDir = path.join(__dirname, "processedPrompts");

async function runAllChats(chatsDir, promptsDir) {
    // delete everything in processedPromptsDir and chatsDir
    fs.rmdirSync(processedPromptsDir, { recursive: true });
    fs.mkdirSync(processedPromptsDir);
    fs.rmdirSync(chatsDir, { recursive: true });
    fs.mkdirSync(chatsDir);

    const prompts = fs.readdirSync(promptsDir);
    prompts.sort(sortByNumberInFile);
    // run first chat
    let promptsFilePath = path.join(promptsDir, prompts[0]);
    let chatFilePath = path.join(chatsDir, prompts[0]);

    await runChat(chatFilePath, promptsFilePath);

    for (let i = 1; i < prompts.length; i++) {
        promptsFilePath = path.join(promptsDir, prompts[i]);
        // prepare prompt with answers
        const answers = getAnswers(chatsDir);
        const promptsFile = fs.readFileSync(promptsFilePath, "utf8").trim();
        const processedPromptsFile = insertAnswersInPrompt(promptsFile, answers);
        const processedPromptsFilePath = path.join(processedPromptsDir, prompts[i]);
        fs.writeFileSync(processedPromptsFilePath, processedPromptsFile);
        // run chat

        chatFilePath = path.join(chatsDir, prompts[i]);

        await runChat(chatFilePath, processedPromptsFilePath);
    }
}

function getLastMessage(chatFilePath) {
    const chatFile = fs.readFileSync(chatFilePath, "utf8").trim();
    const messages = parseChatFile(chatFile, separator);
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role != "assistant") {
        throw new Error("Last message is not assistant message");
    }
    return lastMessage.content;
}

function getAnswers(chatsDir) {
    const chats = fs.readdirSync(chatsDir);
    chats.sort(sortByNumberInFile);
    const answers = chats.map((chat) => getLastMessage(path.join(chatsDir, chat)));
    return answers;
}

function insertAnswersInPrompt(promptFile, answers) {
    return promptFile
        .split("\n")
        .map((line) => {
            let regex = /%%(\d+)%%/;
            let match = line.match(regex);
            if (match) {
                const answerId = parseInt(match[1])-1;
                if (isNaN(answerId)) {
                    throw new Error(`Invalid answerId: ${match[1]}`);
                }
                if (answerId >= answers.length) {
                    throw new Error(`AnswerId ${answerId} is out of range`);
                }
                return line.replace(regex, answers[answerId]);
            } else return line;
        })
        .join("\n");
}

function sortByNumberInFile(a, b) {
    const aNumber = parseInt(a.split("_")[0]);
    if (isNaN(aNumber)) {
        throw new Error(`Invalid prompts file name: ${a}`);
    }
    const bNumber = parseInt(b.split("_")[0]);
    if (isNaN(bNumber)) {
        throw new Error(`Invalid prompts file name: ${b}`);
    }
    return aNumber - bNumber;
}

runAllChats(chatsDir, promptsDir);
