const { addNextMessage, parsePromptsFile} = require('./addNextMessage.js');
const answerInChat = require('./answerInChat.js');
const log = require("loglevel");

async function runChat(chatFilePath, promptsFilePath) {
    log.debug(`runChat(${chatFilePath}, ${promptsFilePath})`);
    const { system, prompts } = parsePromptsFile(promptsFilePath);
    // add first prompt
    addNextMessage(chatFilePath, promptsFilePath);
    // answer in chat
    await answerInChat(chatFilePath);
    for (let i = 1; i < prompts.length; i++) {
        log.debug(`Starting prompt ${i}`);
        // add next prompt
        addNextMessage(chatFilePath, promptsFilePath, i);
        // answer in chat
        await answerInChat(chatFilePath);
    }
    log.info("Done");
}

module.exports = runChat;