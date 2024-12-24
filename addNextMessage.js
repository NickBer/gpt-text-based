const fs = require("fs");
const path = require("path");
const { OpenAI } = require("openai");
const processImages = require("./processImages");
const parseChatFile = require("./parseChatFile");
const processTextFile = require("./processTextFile");
const log = require("loglevel");

require("dotenv").config({ path: path.join(__dirname, ".env") });
const separator = process.env.SEPARATOR || "====================";

function addNextMessage(chatFilePath, promptsFilePath, promptIdToAdd = 0) {
    log.debug(`addNextMessage(${chatFilePath}, ${promptsFilePath}, ${promptIdToAdd})`);
    // check if chat file exists, create if not
    if (!fs.existsSync(chatFilePath)) {
        log.info("Chat file does not exist, creating");
        fs.writeFileSync(chatFilePath, "");
    }
    const chatFile = fs.readFileSync(chatFilePath, "utf8").trim();
    const { system, prompts } = parsePromptsFile(promptsFilePath);

    // if chat file is empty
    if (chatFile === "") {
        log.debug("Chat file is empty");
        let promptToAdd = prompts[0];
        if (promptIdToAdd != 0) {
            promptToAdd = prompts[promptIdToAdd];
            log.warn(
                `File is empty, but promptIdToAdd is ${promptIdToAdd}, so adding prompt ${promptIdToAdd} instead of 0`
            );
        }
        const newFile = system ? `${system}\n${separator}\n${promptToAdd}` : promptToAdd;
        log.debug(`Added prompt "${promptToAdd.slice(0, 100)}" to empty chat file`);
        fs.writeFileSync(chatFilePath, newFile);
        return newFile;
    }

    log.debug("Chat file is not empty");
    let newFile = chatFile;
    // check that chat file ends with separator
    if (!chatFile.endsWith(separator)) {
        log.warn("Chat file does not end with separator, adding separator");
        // add separator
        newFile = `${chatFile}\n${separator}`;
    }
    newFile = `${newFile}\n${prompts[promptIdToAdd]}`;
    log.debug(`Added prompt "${prompts[promptIdToAdd].slice(0, 100)}" to chat file`);
    fs.writeFileSync(chatFilePath, newFile);
    return newFile;
}

function parsePromptsFile(promptsFilePath) {
    const promptsFile = fs.readFileSync(promptsFilePath, "utf8").trim();
    const prompts = promptsFile.split(separator).map((entry) => entry.trim());
    let system = "";
    if (prompts[0].toLowerCase().startsWith("system:")) {
        log.info("System message found in prompts file");
        system = prompts[0];
        prompts.shift();
    }
    return { system, prompts };
}

module.exports = { addNextMessage, parsePromptsFile}