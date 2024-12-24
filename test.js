let str = "Это пример строки с числом %%123%% внутри";
let regex = /%%(\d+)%%/;
let match = str.match(regex);

if (match) {
    console.log("Найденное число:", match[1]); // '123'
} else {
    console.log("Число не найдено");
}
