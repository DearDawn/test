/* eslint-disable rulesdir/disable-sensitive */
const fs = require('fs');
const path = require('path');

const toKeyPosKey = 'creditEducateCard.thirdDesc';
// const toKey = 'creditEducateCard.bestPrize';
// const fromKey = 'entryPrizePopup.BestPrize';
const toKey = 'creditEducateCard.creditNeverExpire';
const fromKey = 'creditExplanationPopup.third';

function constructRegex(startStr, endStr) {
    // 构造正则表达式
    const regexPattern = new RegExp(`(${startStr}[^}]*\n)(\\s*)("${endStr})`, 'm');
    return regexPattern;
}

function insetKeyToThePosBefore(posBefore = '') {
    let [a, b] = posBefore.split('.');
    a = b ? a : '';
    b = b ? b : a;

    return function (insetKey, fromKey, data) {

        const regex = constructRegex(a, b);
        const json = JSON.parse(data);
        const newValue = getNestedValue(json, fromKey)

        const result = data.toString().replace(regex, `$1$2"${insetKey.split('.')[1]}": ${JSON.stringify(newValue)},\n$2$3`);
        return result;
    }
}

// 遍历目录并查找 index.json 文件
function traverseDirectory(dir) {
    fs.readdirSync(dir).forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            // 如果是目录，递归遍历
            traverseDirectory(filePath);
        } else if (file === 'bgnb_win_credit.json') {
            // 如果是 index.json 文件，读取并比较 key 值
            // compareJsonKeys(filePath);
            const data = fs.readFileSync(filePath, 'utf8');
            const result = insetKeyToThePosBefore(toKeyPosKey)(toKey, fromKey, data)
            fs.writeFileSync(filePath, result);
        }
    });
}


// 解析嵌套的 key
function getNestedValue(obj, keys) {
    return keys.split('.').reduce((acc, key) => acc && acc[key], obj);
}

// 比较 json 文件中的两个 key 值
function compareJsonKeys(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        const json = JSON.parse(data);
        const value1 = getNestedValue(json, toKey);
        const value2 = getNestedValue(json, fromKey);

        if (value1 !== undefined && value2 !== undefined) {
            if (value1 === value2) {
                // console.log(`${filePath}: ${key1} and ${key2} are equal.`);
            } else {
                console.error(`${filePath}: ${toKey} and ${fromKey} are NOT equal.`);
            }
        } else {
            console.error(`${filePath}: One or both keys (${toKey}, ${fromKey}) are missing.[${!!value1},${!!value2}]`);
        }
    } catch (err) {
        console.error(`Error reading or parsing ${filePath}:`, err.message);
    }
}

// 从当前目录开始遍历
traverseDirectory('.');



// const data = fs.readFileSync(path.join(__dirname, './en/bgnb_win_credit.json'))
// const result = insetKeyToThePosBefore(toKeyPosKey)(toKey, fromKey, data)
// fs.writeFileSync(path.join(__dirname, './en/bgnb_win_credit.json'), result);
