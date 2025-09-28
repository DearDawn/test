const http = require('http');
const net = require('net');
const { URL } = require('url');

const TARGET_HOST = 'localhost';
const TARGET_PORT = 3000;
const PROXY_PORT = 7777;

// 创建 HTTP 代理服务器
const server = http.createServer();

// 处理 HTTP 请求
server.on('request', (clientReq, clientRes) => {
  const targetPath =
    new URL(clientReq.url).pathname + new URL(clientReq.url).search;

  // 配置目标服务器选项
  const options = {
    hostname: TARGET_HOST,
    port: TARGET_PORT,
    path: targetPath,
    method: clientReq.method,
    headers: {
      ...clientReq.headers,
      host: `${TARGET_HOST}:${TARGET_PORT}`, // 覆盖原始 Host 头
      connection: 'close', // 禁用 keep-alive 减少内存占用
    },
  };

  // 移除可能引起问题的代理头部
  delete options.headers['proxy-connection'];
  delete options.headers['x-forwarded-for'];

  // 添加请求日志
  console.log(
    `[${new Date().toISOString()}] ${clientReq.method} ${clientReq.url}`
  );
  console.log('请求头:', JSON.stringify(options.headers, null, 2));

  // 创建到目标服务器的请求
  const proxyReq = http.request(options, (proxyRes) => {
    // 添加响应日志
    console.log(
      `[${new Date().toISOString()}] 响应状态: ${proxyRes.statusCode}`
    );
    console.log('响应头:', JSON.stringify(proxyRes.headers, null, 2));

    // 将目标服务器响应转发给客户端
    clientRes.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(clientRes);
  });

  // 错误处理
  proxyReq.on('error', (err) => {
    console.error(`[${new Date().toISOString()}] 代理请求错误:`, err);
    if (!clientRes.headersSent) {
      clientRes.writeHead(500);
      clientRes.end('Proxy request failed');
    }
  });

  // 处理 POST 请求体数据
  if (clientReq.method === 'POST') {
    let body = [];
    clientReq
      .on('data', (chunk) => {
        body.push(chunk);
      })
      .on('end', () => {
        const requestBody = Buffer.concat(body).toString();
        console.log(`[${new Date().toISOString()}] POST 请求体:`, requestBody);
        proxyReq.write(Buffer.concat(body));
        proxyReq.end();
      });
  } else {
    // 将客户端请求数据转发给目标服务器
    clientReq.pipe(proxyReq);
  }
});

// 处理 HTTPS 隧道请求 (CONNECT)
server.on('connect', (clientReq, clientSocket, head) => {
  // 建立到目标服务器的连接
  const proxySocket = net.connect(TARGET_PORT, TARGET_HOST, () => {
    // 通知客户端隧道已建立
    clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');

    // 建立双向数据流
    proxySocket.write(head);
    clientSocket.pipe(proxySocket);
    proxySocket.pipe(clientSocket);
  });

  // 错误处理
  proxySocket.on('error', (err) => {
    console.error(`[${new Date().toISOString()}] HTTPS 隧道错误:`, err);
    clientSocket.end();
  });

  clientSocket.on('error', () => {
    proxySocket.end();
  });
});

// 启动代理服务器
server.listen(PROXY_PORT, () => {
  console.log(`⚡️ 代理服务器运行在 http://localhost:${PROXY_PORT}`);
  console.log(`🔀 所有请求将转发到 http://${TARGET_HOST}:${TARGET_PORT}`);
  console.log(`📛 注意: 此代理不记录任何请求/响应数据`);
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n关闭代理服务器...');
  server.close(() => process.exit());
});
