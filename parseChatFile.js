const systemStart = "system:";
function isEmptyOrWhitespace(str) {
    return !str.trim();
}

function parseChatFile(content, separator) {
    if (isEmptyOrWhitespace(content)) {
        throw new Error('Файл пуст');
    }

    const blocks = content.split(separator).map(block => block.trim());
    const messages = [];
    let hasUserMessage = false;
    blocks.forEach((block) => {
        if (isEmptyOrWhitespace(block)) {
            return;
        }

        if (block.toLowerCase().startsWith(systemStart)) {
            messages.push({ role:"system",content: block.substring(systemStart.length) });
            return;
        }

        if (!hasUserMessage) {
            let images = block.split("\n").filter(isImageLinkOrPath);
            if(images.length == 0) images = false;
            // remove images from block
            block = block.split("\n").filter((s) => !isImageLinkOrPath(s)).join("\n");
            messages.push({ role:"user",content: block, images});
            hasUserMessage = true;
        } else {
            try {
                const stats = JSON.parse(block.split("\n")[0]);
                messages.push({ role:"assistant",content: block.substring(block.indexOf("\n") + 1), stats });
                hasUserMessage = false;
            } catch (error) {
                throw new Error('Некорректный JSON в сообщении ассистента');
            }
        }
    });

    return messages;
}

function isImageLinkOrPath(str) {
    // Проверяем, что строка является URL к изображению
    const urlRegex = /^https?:\/\/.*\.(jpg|jpeg|png|gif)$/i;
    // Проверяем, что строка является локальным путем к изображению
    const fileRegex = /^[^.].*\.(jpg|jpeg|png|gif)$/i;

    return urlRegex.test(str) || fileRegex.test(str);
}

module.exports = parseChatFile;