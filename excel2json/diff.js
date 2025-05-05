const fs = require('fs');

let diffList = [];
let oldJSON = [];

const diff = (_oldJSON, newJSON) => {
  oldJSON = JSON.parse(_oldJSON);

  newJSON.forEach((newItem) => {
    const oldItemIndex = oldJSON.findIndex((item) => item.key === newItem.key);

    if (oldItemIndex > -1) {
      const oldItem = oldJSON[oldItemIndex];
      oldJSON.splice(oldItemIndex, 1);

      if (JSON.stringify(oldItem) !== JSON.stringify(newItem)) {
        diffList.push({ ...newItem, update: true });
      }
    } else {
      diffList.push({ ...newItem, add: true });
    }
  });

  if (oldJSON.length) {
    oldJSON.forEach((item) => {
      diffList.push({ ...item, del: true });
    });
  }
};

const showDiff = () => {
  const year = new Date().getFullYear() % 100;
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const day = String(new Date().getDate()).padStart(2, '0');

  const date = `${year}${month}${day}`;
  const diffJsonFilePath = `./public/output/diff_${date}.json`;

  const newList = {};
  for (let i = 0; i < diffList.length; i += 100) {
    newList[`${i}`] = diffList.slice(i, i + 100);
  }

  fs.writeFileSync(diffJsonFilePath, JSON.stringify(newList, null, 2));
};

module.exports = { diff, showDiff };
