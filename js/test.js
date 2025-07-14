
const { convertOldToNew,
    convertJsonFile,
    convertJsonString } = require('./converter.js');

async function test() {
    //从命令行读取输入输出文件并调用方法
    const oldJsonPath = process.argv[2];
    const newJsonPath = process.argv[3];

    const result = await convertJsonFile(oldJsonPath, newJsonPath);
    console.log(result);

}

test();