const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const excelFilePath = './public/record_250213.xlsx';

// 读取Excel文件
const workbook = xlsx.readFile(excelFilePath, { cellStyles: true });

// 解析超链接
const getHyperlink = (cell, workbook) => {
  if (!cell || !cell.l) return null;
  return cell.l.Target;
};

const getPureVal = (val = '') => {
  if (!val?.trim()) return '';

  if (val === '-' || val === '—') return '';

  return val;
};

const getDateStr = (dateStr) => {
  const year = dateStr.substring(0, 4); // 从索引 0 开始，提取 4 位
  const month = dateStr.substring(4, 6); // 从索引 4 开始，提取 2 位
  const day = dateStr.substring(6, 8); // 从索引 6 开始，提取 2 位

  if (!month && !day) {
    return year;
  }

  if (!day) {
    return `${year}-${month}`;
  }

  return `${year}-${month}-${day}`;
};

function toTimestamp(dateStr) {
  let date;

  // 尝试解析完整的日期格式 (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    date = new Date(dateStr);
  }
  // 尝试解析月份格式 (YYYY-MM)
  else if (/^\d{4}-\d{2}$/.test(dateStr)) {
    date = new Date(dateStr + '-01'); // 默认设置为该月的第一天
  }
  // 尝试解析年份格式 (YYYY)
  else if (/^\d{4}$/.test(dateStr)) {
    date = new Date(dateStr + '-01-01'); // 默认设置为该年的第一天
  }
  // 如果格式不匹配，抛出错误
  else {
    console.error(
      '日期格式不正确，请输入 YYYY-MM-DD、YYYY-MM 或 YYYY 格式的日期'
    );
    return 0;
  }

  // 返回时间戳（毫秒数）
  return date.getTime();
}

const getActivityList = () => {
  // 改为Excel文件路径
  const jsonFilePath = './public/output/list.json';
  const jsonFilePathSong = './public/output/song.json';

  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // 将Excel数据转换为JSON
  const rows = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

  // 获取表头
  const headers = rows[0];
  const headerMap = {
    演唱歌曲: 'songs',
    时间: 'date',
    地点: 'location',
    类型: 'activity',
  };

  const songMap = {};
  const results = [];

  // 遍历每一行数据
  for (let rowIndex = 1; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex];
    if (!row || row.length === 0) continue;

    const rowData = {};

    const insertSong = (song) => {
      if (!song) return;

      const songList = song
        .split('+')
        ?.map((song) => song.trim())
        .filter((it) => !!it && it !== '-' && it !== '—');
      rowData[headerMap['演唱歌曲']].push(...songList);
      rowData[headerMap['演唱歌曲']] = [
        ...new Set(rowData[headerMap['演唱歌曲']]),
      ];

      songList.forEach((songItem) => {
        if (!songMap[songItem]) {
          songMap[songItem] = [];
        }
        songMap[songItem].push(rowIndex);
        songMap[songItem] = [...new Set(songMap[songItem])];
      });
    };

    const insertLink = (hyperlink) => {
      rowData.links = hyperlink
        ? [...(rowData.links || []), hyperlink]
        : rowData.links;
    };

    headers.forEach((_header, index) => {
      const header = String(_header).trim();
      const cell = worksheet[xlsx.utils.encode_cell({ r: rowIndex, c: index })];
      const value = cell ? String(cell.v || '') : '';

      if (header.startsWith('演唱歌曲')) {
        if (!rowData[headerMap['演唱歌曲']]) {
          rowData[headerMap['演唱歌曲']] = [];
        }
        insertSong(value.trim());
      } else if (!Number.isNaN(Number(header))) {
        insertSong(value.trim());
      } else {
        const headerKey = headerMap[header];

        if (!rowData[headerKey]) {
          rowData[headerKey] = {};
        }

        if (headerKey === headerMap['时间']) {
          rowData[headerKey] = getDateStr(value.trim());
          rowData['timestamp'] = toTimestamp(rowData[headerKey]);
        } else if (headerKey === headerMap['地点']) {
          rowData[headerKey] = value.trim();
          insertLink(getHyperlink(cell, workbook));
        } else if (headerKey === headerMap['类型']) {
          rowData[headerKey] = value.trim();
          insertLink(getHyperlink(cell, workbook));
        } else {
          rowData[headerKey] = value.trim();
        }
      }
    });

    rowData.type = '演出现场';
    rowData.key = `${rowData.type}_${rowData.date}_${rowData.location}_${rowData.activity}`;
    results.push(rowData);
  }

  // 处理歌曲映射
  const songList = [];
  Object.keys(songMap).forEach((song) => {
    songList.push({
      song,
      activity: songMap[song].map((index) => results[index - 1].key || ''),
    });
  });

  // 写入JSON文件
  if (!fs.existsSync(path.dirname(jsonFilePath))) {
    fs.mkdirSync(path.dirname(jsonFilePath));
  }

  fs.writeFileSync(jsonFilePath, JSON.stringify(results, null, 2));
  console.log('Excel 文件已成功转换为 JSON 文件:', jsonFilePath);
  fs.writeFileSync(jsonFilePathSong, JSON.stringify(songList, null, 2));
  console.log('songMap 已成功转换为 JSON 文件:', jsonFilePathSong);
};

const getShowList = () => {
  // 改为Excel文件路径
  const jsonFilePath = './public/output/list_show.json';
  const jsonFilePathSong = './public/output/song_show.json';

  const sheetName = workbook.SheetNames[1];
  const worksheet = workbook.Sheets[sheetName];

  // 将Excel数据转换为JSON
  const rows = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

  // 获取表头
  const headers = rows[0];
  const headerMap = {
    演唱歌曲: 'songs',
    播出时间: 'date',
    播出平台: 'location',
    节目名称: 'activity',
    期数: 'period',
  };

  const songMap = {};
  const results = [];

  // 遍历每一行数据
  for (let rowIndex = 1; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex];
    if (!row || row.length === 0) continue;

    const rowData = {};

    const insertSong = (song) => {
      if (!song) return;

      const songList = song
        .split('+')
        ?.map((song) => song.trim())
        .filter((it) => !!it && it !== '-' && it !== '—');
      rowData[headerMap['演唱歌曲']].push(...songList);
      rowData[headerMap['演唱歌曲']] = [
        ...new Set(rowData[headerMap['演唱歌曲']]),
      ];

      songList.forEach((songItem) => {
        if (!songMap[songItem]) {
          songMap[songItem] = [];
        }
        songMap[songItem].push(rowIndex);
        songMap[songItem] = [...new Set(songMap[songItem])];
      });
    };

    const insertLink = (hyperlink) => {
      rowData.links = hyperlink
        ? [...(rowData.links || []), hyperlink]
        : rowData.links;
    };

    headers.forEach((_header, index) => {
      const header = String(_header).trim();
      const cell = worksheet[xlsx.utils.encode_cell({ r: rowIndex, c: index })];
      const value = cell ? String(cell.v || '') : '';

      if (header.startsWith('演唱歌曲')) {
        if (!rowData[headerMap['演唱歌曲']]) {
          rowData[headerMap['演唱歌曲']] = [];
        }
        insertSong(value.trim());
      } else if (!Number.isNaN(Number(header))) {
        insertSong(value.trim());
      } else {
        const headerKey = headerMap[header];

        if (!rowData[headerKey]) {
          rowData[headerKey] = {};
        }

        if (headerKey === headerMap['播出时间']) {
          rowData[headerKey] = getDateStr(value.trim());
          rowData['timestamp'] = toTimestamp(rowData[headerKey]);
        } else {
          rowData[headerKey] = getPureVal(value);
        }
      }
    });

    rowData.type = '综艺晚会';
    rowData.activity += rowData.period;
    delete rowData.period;
    rowData.key = `${rowData.type}_${rowData.date}_${rowData.location}_${rowData.activity}`;
    results.push(rowData);
  }

  // 处理歌曲映射
  const songList = [];
  Object.keys(songMap).forEach((song) => {
    songList.push({
      song,
      activity: songMap[song].map((index) => results[index - 1].key || ''),
    });
  });

  // 写入JSON文件
  if (!fs.existsSync(path.dirname(jsonFilePath))) {
    fs.mkdirSync(path.dirname(jsonFilePath));
  }

  fs.writeFileSync(jsonFilePath, JSON.stringify(results, null, 2));
  console.log('Excel 文件已成功转换为 JSON 文件:', jsonFilePath);
  fs.writeFileSync(jsonFilePathSong, JSON.stringify(songList, null, 2));
  console.log('songMap 已成功转换为 JSON 文件:', jsonFilePathSong);
};

const getWebLiveList = () => {
  // 改为Excel文件路径
  const jsonFilePath = './public/output/list_web_live.json';
  const jsonFilePathSong = './public/output/song_web_live.json';

  const sheetName = workbook.SheetNames[3];
  const worksheet = workbook.Sheets[sheetName];

  // 将Excel数据转换为JSON
  const rows = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

  // 获取表头
  const headers = rows[0];
  const headerMap = {
    演唱歌曲: 'songs',
    直播时间: 'date',
    直播平台: 'location',
    备注: 'activity',
  };

  const songMap = {};
  const results = [];

  // 遍历每一行数据
  for (let rowIndex = 1; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex];
    if (!row || row.length === 0) continue;

    const rowData = {};

    const insertSong = (song) => {
      if (!song) return;

      const songList = song
        .split('+')
        ?.map((song) => song.trim())
        .filter((it) => !!getPureVal(it));
      rowData[headerMap['演唱歌曲']].push(...songList);
      rowData[headerMap['演唱歌曲']] = [
        ...new Set(rowData[headerMap['演唱歌曲']]),
      ];

      songList.forEach((songItem) => {
        if (!songMap[songItem]) {
          songMap[songItem] = [];
        }
        songMap[songItem].push(rowIndex);
        songMap[songItem] = [...new Set(songMap[songItem])];
      });
    };

    const insertLink = (hyperlink) => {
      rowData.links = hyperlink
        ? [...(rowData.links || []), hyperlink]
        : rowData.links;
    };

    headers.forEach((_header, index) => {
      const header = String(_header).trim();
      const cell = worksheet[xlsx.utils.encode_cell({ r: rowIndex, c: index })];
      const value = cell ? String(cell.v || '') : '';

      if (header.startsWith('演唱歌曲')) {
        if (!rowData[headerMap['演唱歌曲']]) {
          rowData[headerMap['演唱歌曲']] = [];
        }
        insertSong(value.trim());
      } else if (!Number.isNaN(Number(header))) {
        insertSong(value.trim());
      } else {
        const headerKey = headerMap[header];

        if (!rowData[headerKey]) {
          rowData[headerKey] = {};
        }

        if (headerKey === headerMap['直播时间']) {
          rowData[headerKey] = getDateStr(value.trim());
          rowData['timestamp'] = toTimestamp(rowData[headerKey]);
          insertLink(getHyperlink(cell, workbook));
        } else if (headerKey === headerMap['直播平台']) {
          rowData[headerKey] = value.trim();
          insertLink(getHyperlink(cell, workbook));
        } else if (headerKey === headerMap['备注']) {
          rowData[headerKey] = value.trim();
        } else {
          rowData[headerKey] = value.trim();
        }
      }
    });

    rowData.type = '网络直播';
    rowData.key = `${rowData.type}_${rowData.date}_${rowData.location}_${rowData.activity}`;
    results.push(rowData);
  }

  // 处理歌曲映射
  const songList = [];
  Object.keys(songMap).forEach((song) => {
    songList.push({
      song,
      activity: songMap[song].map((index) => results[index - 1].key || ''),
    });
  });

  // 写入JSON文件
  if (!fs.existsSync(path.dirname(jsonFilePath))) {
    fs.mkdirSync(path.dirname(jsonFilePath));
  }

  fs.writeFileSync(jsonFilePath, JSON.stringify(results, null, 2));
  console.log('Excel 文件已成功转换为 JSON 文件:', jsonFilePath);
  fs.writeFileSync(jsonFilePathSong, JSON.stringify(songList, null, 2));
  console.log('songMap 已成功转换为 JSON 文件:', jsonFilePathSong);
};

const getSongInfo = () => {
  // 改为Excel文件路径
  const jsonFilePath = './public/output/list_song_publish.json';
  const jsonFilePathSong = './public/output/song_info_list.json';

  const sheetName = workbook.SheetNames[2];
  const worksheet = workbook.Sheets[sheetName];

  // 将Excel数据转换为JSON
  const rows = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

  // 获取表头
  const headers = rows[0];
  const headerMap = {
    顺序: 'sort',
    歌名: 'song',
    发布时间: 'date',
    翻唱: 'is_cover',
    专辑: 'album',
    作词: 'author_lyrics',
    作曲: 'author_compose',
    编曲: 'author_arrange',
    制作人: 'author_produce',
  };

  const results = [];

  // 遍历每一行数据
  for (let rowIndex = 1; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex];
    if (!row || row.length === 0) continue;

    const rowData = {};

    headers.forEach((_header, index) => {
      const header = String(_header).trim();
      const cell = worksheet[xlsx.utils.encode_cell({ r: rowIndex, c: index })];
      const value = cell ? String(cell.v || '') : '';
      const style = cell?.s || {};
      if (header.startsWith('歌名')) {
        rowData[headerMap['歌名']] = value.trim();
        rowData[headerMap['翻唱']] =
          (style && style.fgColor?.rgb === 'FFFF00') ||
          style.bgColor?.rgb === 'FFFF00';
      } else if (header === '顺序') {
        rowData[headerMap['顺序']] = Number(value.trim());
      } else {
        const headerKey = headerMap[header];

        if (!rowData[headerKey]) {
          rowData[headerKey] = {};
        }

        if (headerKey === headerMap['发布时间']) {
          if (rowData[headerMap['歌名']] === '原来大理') {
            rowData[headerKey] = '2020-11-14';
            rowData['timestamp'] = 1605283200000;
            rowData['links'] = [
              'https://weibo.com/tv/show/1034:4571166355161117',
            ];
          } else {
            rowData[headerKey] = getDateStr(value.trim());
            rowData['timestamp'] = toTimestamp(rowData[headerKey]);
          }
        } else {
          rowData[headerKey] = value.trim();
        }
      }
    });

    results.push(rowData);
  }

  const publishListInfo = results.map((it) => {
    const info = {
      date: it.date,
      timestamp: it.timestamp,
      location: it.is_cover ? '翻唱' : '原唱',
      links: it.links || [],
      activity: it.song,
      songs: [it.song],
      type: '发布歌曲',
      key: '',
    };
    info.key = `${info.type}_${info.date}_${info.location}_${info.activity}`;
    // info.key = `${info.date}_${info.location}_${info.activity}`;
    // info.newKey = `${info.type}_${info.date}_${info.location}_${info.activity}`;
    return info;
  });

  // 写入JSON文件
  if (!fs.existsSync(path.dirname(jsonFilePath))) {
    fs.mkdirSync(path.dirname(jsonFilePath));
  }

  fs.writeFileSync(jsonFilePath, JSON.stringify(publishListInfo, null, 2));
  console.log('Excel 文件已成功转换为 JSON 文件:', jsonFilePath);

  fs.writeFileSync(jsonFilePathSong, JSON.stringify(results, null, 2));
  console.log('songMap 已成功转换为 JSON 文件:', jsonFilePathSong);
};

const geVideoInterviewList = () => {
  // 改为Excel文件路径
  const jsonFilePath = './public/output/list_video.json';

  const sheetName = workbook.SheetNames[4];
  const worksheet = workbook.Sheets[sheetName];

  // 将Excel数据转换为JSON
  const rows = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

  // 获取表头
  const headers = rows[0];
  const headerMap = {
    发布时间: 'date',
    媒体名称: 'location',
    备注: 'activity',
  };

  const songMap = {};
  const results = [];

  // 遍历每一行数据
  for (let rowIndex = 1; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex];
    if (!row || row.length === 0) continue;

    const rowData = {};

    const insertLink = (hyperlink) => {
      rowData.links = hyperlink
        ? [...(rowData.links || []), hyperlink]
        : rowData.links;
    };

    headers.forEach((_header, index) => {
      const header = String(_header).trim();
      const cell = worksheet[xlsx.utils.encode_cell({ r: rowIndex, c: index })];
      const value = cell ? String(cell.v || '') : '';

      const headerKey = headerMap[header];

      if (!rowData[headerKey]) {
        rowData[headerKey] = {};
      }

      if (headerKey === headerMap['发布时间']) {
        rowData[headerKey] = getDateStr(value.trim());
        rowData['timestamp'] = toTimestamp(rowData[headerKey]);
      } else if (headerKey === headerMap['媒体名称']) {
        rowData[headerKey] = value.trim();
      } else if (headerKey === headerMap['备注']) {
        rowData[headerKey] = value.trim();
        insertLink(getHyperlink(cell, workbook));
      } else {
        rowData[headerKey] = value.trim();
      }
    });

    rowData.type = '视频专访';
    rowData.key = `${rowData.type}_${rowData.date}_${rowData.location}_${rowData.activity}`;
    results.push(rowData);
  }

  // 写入JSON文件
  if (!fs.existsSync(path.dirname(jsonFilePath))) {
    fs.mkdirSync(path.dirname(jsonFilePath));
  }

  fs.writeFileSync(jsonFilePath, JSON.stringify(results, null, 2));
  console.log('Excel 文件已成功转换为 JSON 文件:', jsonFilePath);
};

const geTextInterviewList = () => {
  // 改为Excel文件路径
  const jsonFilePath = './public/output/list_text.json';

  const sheetName = workbook.SheetNames[5];
  const worksheet = workbook.Sheets[sheetName];

  // 将Excel数据转换为JSON
  const rows = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

  // 获取表头
  const headers = rows[0];
  const headerMap = {
    发布时间: 'date',
    发布者: 'location',
    文章标题: 'activity',
  };

  const songMap = {};
  const results = [];

  // 遍历每一行数据
  for (let rowIndex = 1; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex];
    if (!row || row.length === 0) continue;

    const rowData = {};

    const insertLink = (hyperlink) => {
      rowData.links = hyperlink
        ? [...(rowData.links || []), hyperlink]
        : rowData.links;
    };

    headers.forEach((_header, index) => {
      const header = String(_header).trim();
      const cell = worksheet[xlsx.utils.encode_cell({ r: rowIndex, c: index })];
      const value = cell ? String(cell.v || '') : '';

      const headerKey = headerMap[header];

      if (!rowData[headerKey]) {
        rowData[headerKey] = {};
      }

      if (headerKey === headerMap['发布时间']) {
        rowData[headerKey] = getDateStr(value.trim());
        rowData['timestamp'] = toTimestamp(rowData[headerKey]);
      } else if (headerKey === headerMap['发布者']) {
        rowData[headerKey] = value.trim();
      } else if (headerKey === headerMap['文章标题']) {
        rowData[headerKey] = value.trim();
        insertLink(getHyperlink(cell, workbook));
      } else {
        rowData[headerKey] = value.trim();
      }
    });

    rowData.type = '文字专访';
    rowData.key = `${rowData.type}_${rowData.date}_${rowData.location}_${rowData.activity}`;
    results.push(rowData);
  }

  // 写入JSON文件
  if (!fs.existsSync(path.dirname(jsonFilePath))) {
    fs.mkdirSync(path.dirname(jsonFilePath));
  }

  fs.writeFileSync(jsonFilePath, JSON.stringify(results, null, 2));
  console.log('Excel 文件已成功转换为 JSON 文件:', jsonFilePath);
};

const getBodCastList = () => {
  // 改为Excel文件路径
  const jsonFilePath = './public/output/list_bod_cast.json';

  const sheetName = workbook.SheetNames[6];
  const worksheet = workbook.Sheets[sheetName];

  // 将Excel数据转换为JSON
  const rows = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

  // 获取表头
  const headers = rows[0];
  const headerMap = {
    发布时间: 'date',
    发布者: 'location',
    备注: 'activity',
  };

  const results = [];

  // 遍历每一行数据
  for (let rowIndex = 1; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex];
    if (!row || row.length === 0) continue;

    const rowData = {};

    const insertLink = (hyperlink) => {
      rowData.links = hyperlink
        ? [...(rowData.links || []), hyperlink]
        : rowData.links;
    };

    headers.forEach((_header, index) => {
      const header = String(_header).trim();
      const cell = worksheet[xlsx.utils.encode_cell({ r: rowIndex, c: index })];
      const value = cell ? String(cell.v || '') : '';

      const headerKey = headerMap[header];

      if (!rowData[headerKey]) {
        rowData[headerKey] = {};
      }

      if (headerKey === headerMap['发布时间']) {
        rowData[headerKey] = getDateStr(value.trim());
        rowData['timestamp'] = toTimestamp(rowData[headerKey]);
      } else if (headerKey === headerMap['发布者']) {
        rowData[headerKey] = value.trim();
      } else if (headerKey === headerMap['备注']) {
        rowData[headerKey] = value.trim();
        insertLink(getHyperlink(cell, workbook));
      } else {
        rowData[headerKey] = value.trim();
      }
    });

    rowData.type = '电台播客';
    rowData.key = `${rowData.type}_${rowData.date}_${rowData.location}_${rowData.activity}`;
    results.push(rowData);
  }

  // 写入JSON文件
  if (!fs.existsSync(path.dirname(jsonFilePath))) {
    fs.mkdirSync(path.dirname(jsonFilePath));
  }

  fs.writeFileSync(jsonFilePath, JSON.stringify(results, null, 2));
  console.log('Excel 文件已成功转换为 JSON 文件:', jsonFilePath);
};

getActivityList();
getShowList();
getSongInfo();
getWebLiveList();
geVideoInterviewList();
geTextInterviewList();
getBodCastList();
