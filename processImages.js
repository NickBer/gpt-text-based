const fs = require("fs");
const path = require("path");
const mime = require("mime-types");

function processImages(imagePaths) {
    const result = imagePaths.map((imagePath) => {
        if (imagePath.startsWith("http")) {
            // Это URL, возвращаем как есть
            return imagePath;
        } else {
            // Проверяем существование файла
            const fullPath = imagePath;
            if (!fs.existsSync(fullPath)) {
                // Файл не найден, выбрасываем ошибку
                throw new Error(`File not found: ${imagePath}`);
            }

            // Получаем MIME-тип на основе расширения файла
            const mimeType = mime.lookup(fullPath) || "application/octet-stream";
            // Читаем файл и возвращаем его содержимое в виде Base64
            const fileContent = fs.readFileSync(fullPath, { encoding: "base64" });
            return `data:${mimeType};base64,${fileContent}`;
        }
    });

    return result;
}

module.exports = processImages;
