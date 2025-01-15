const fs = require('fs');
const json = require('./list.json');

const linkList = json.map(item => item.link).flat().filter(Boolean);

fs.writeFileSync('./link.json', JSON.stringify(linkList, undefined, 2), 'utf8');

console.log('[dodo] ', 'json', linkList);