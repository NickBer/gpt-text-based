# gpt-text-based

! Currently not well tested and code is also not very good. Created for personal use. Use at your own risk.

## Description

Simple script to chat with gpt in plain text.
Uses model selected in .env file.
Vision model is supported.

You can paste paths to documents and images in the chat and script will automatically replace them with content.

## VS Code

You can use this script to run gpt on any file, just setup global task and keybinding to run script on the current file.

## Usage

1. Install dependencies
```bash
npm install
```
2. Fill .env file with your credentials and model name.

3. Run script on the file
```bash
node gpt.js <path to file>
```

## Example

In the `chat example.txt` file you can find example of chat with gpt. You can use relative or absolute paths to files and images, you can include several files and images in one message. First message can be a system message if it starts with "System:", it will guide gpt.
You can use custom separator between messages, default is "====================".