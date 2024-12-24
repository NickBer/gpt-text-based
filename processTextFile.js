const fs = require("fs");
const path = require("path");

function isTextFile(filePath) {
    // Добавляем расширения для JavaScript, Solidity и TypeScript
    const textFileExtensions = [".txt", ".md", ".js", ".html", ".css", ".sol", ".ts", ".csv"];
    const extension = path.extname(filePath);
    return textFileExtensions.includes(extension);
}

function isFile(pathString) {
    try {
        const stat = fs.statSync(pathString);
        return stat.isFile();
    } catch (e) {
        return false; // Если ошибка, значит файл не найден или путь не верен
    }
}

// Преобразование относительного пути в абсолютный

function processStringSync(inputString, chatFile) {
    const directoryPath = path.dirname(chatFile);
    const lines = inputString.split("\n"); // Разбиваем входную строку на массив строк
    return lines
        .map((line) => {
            // Проверяем каждую строку, является ли она путем к файлу и текстовым файлом
            if (isFile(line) && isTextFile(line)) {
                // Если да, читаем содержимое файла синхронно
                try {
                    return fs.readFileSync(line, "utf-8");
                } catch (e) {
                    return line; // Если ошибка чтения, возвращаем исходную строку
                }
            }
            // вдруг путь был относительным
            try {
                const absolutePath = path.resolve(directoryPath, string);
                if (isFile(absolutePath) && isTextFile(absolutePath)) {
                    // Если да, читаем содержимое файла синхронно
                    try {
                        return fs.readFileSync(line, "utf-8");
                    } catch (e) {
                        return line; // Если ошибка чтения, возвращаем исходную строку
                    }
                }
            } catch (e) {
                return line; // Если ошибка чтения, возвращаем исходную строку
            }
            // Если нет, возвращаем строку как есть
            return line;
        })
        .join("\n");
}

module.exports = processStringSync;
