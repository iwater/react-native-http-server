# react-native-http-server 中文文档

> 基于 Node.js 核心 HTTP 模块改造，适配 React Native 环境的 HTTP 服务器实现

## 📖 项目简介

`react-native-http-server` 是从 Node.js 核心代码中提取并修改的 HTTP 服务器实现，专门为 React Native 环境设计。它使用纯 JavaScript 实现的 HTTP 解析器（`http-parser-js`），使得你可以在移动设备上直接运行 HTTP 服务器。

### 核心特性

- ✅ **完整的 HTTP/1.1 支持**：支持标准 HTTP 协议特性
- ✅ **纯 JavaScript 实现**：基于 `http-parser-js`，无需原生模块
- ✅ **兼容 Node.js API**：与 Node.js HTTP API 保持一致
- ✅ **支持流行框架**：可与 Koa 等 Node.js 框架集成
- ✅ **TCP 底层支持**：使用 `react-native-tcp-socket` 提供网络能力

## 📦 安装

```bash
yarn add @iwater/react-native-http-server react-native-tcp-socket @craftzdog/react-native-buffer
```

或使用 npm：

```bash
npm install @iwater/react-native-http-server react-native-tcp-socket @craftzdog/react-native-buffer
```

## 🚀 快速开始

### 基础用法

创建一个简单的 HTTP 服务器：

```javascript
import http from '@iwater/react-native-http-server';

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('X-Foo', 'bar');
  res.writeHead(200);
  res.end('你好，来自 React Native 的 HTTP 服务器！');
});

server.listen({ port: 12345, host: '0.0.0.0' }, () => {
  console.log('服务器运行在 http://0.0.0.0:12345');
});
```

### 与 Koa 框架集成

#### 1. 安装依赖

```bash
yarn add koa @iwater/react-native-stream
```

#### 2. 配置全局 Buffer

在你的 `index.js` 入口文件中添加：

```javascript
global.Buffer = require("@craftzdog/react-native-buffer").Buffer;
```

#### 3. 配置 Metro

修改 `metro.config.js`：

```javascript
module.exports = {
  resolver: {
    extraNodeModules: {
      stream: require.resolve('@iwater/react-native-stream'),
      net: require.resolve('react-native-tcp-socket'),
      http: require.resolve('@iwater/react-native-http-server'),
    }
  },
};
```

#### 4. 配置 package.json

添加依赖解析：

```json
{
  "resolutions": {
    "keygrip": "npm:@iwater/react-native-keygrip@^1.1.1",
    "destroy": "npm:@iwater/react-native-destroy@^1.2.0"
  }
}
```

然后运行：

```bash
yarn
```

#### 5. 使用 Koa

```javascript
import Koa from 'koa';
import http from '@iwater/react-native-http-server';

const app = new Koa();

// 中间件
app.use(async (ctx) => {
  ctx.body = 'Hello from Koa on React Native!';
});

const server = http.createServer(app.callback());
server.listen({ port: 12345, host: '0.0.0.0' }, () => {
  console.log('Koa 服务器运行在 http://0.0.0.0:12345');
});
```

## 📚 API 文档

### 模块导出

```javascript
import http from '@iwater/react-native-http-server';
```

默认导出对象包含以下属性：

#### `http.createServer([options], [requestListener])`

创建一个 HTTP 服务器实例。

**参数：**
- `options` (Object, 可选)
  - `IncomingMessage` (Function): 自定义请求消息类
  - `ServerResponse` (Function): 自定义响应消息类
  - `insecureHTTPParser` (Boolean): 使用宽松的 HTTP 解析器
- `requestListener` (Function, 可选): 请求监听器函数 `(req, res) => {}`

**返回值：** `Server` 实例

**示例：**

```javascript
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello World');
});
```

#### `http.Server`

HTTP 服务器类，继承自 `net.Server`。

**属性：**
- `timeout` (Number): 默认 30000ms (30秒)
- `keepAliveTimeout` (Number): 默认 5000ms (5秒)
- `maxHeadersCount` (Number): 最大请求头数量，默认 null（无限制）
- `headersTimeout` (Number): 默认 60000ms (60秒)

**方法：**
- `server.listen(options, [callback])`: 启动服务器
  - `options.port` (Number): 监听端口
  - `options.host` (String): 监听地址
- `server.setTimeout(msecs, [callback])`: 设置超时时间
- `server.close([callback])`: 关闭服务器

**示例：**

```javascript
const server = new http.Server((req, res) => {
  res.end('OK');
});

server.setTimeout(60000);
server.listen({ port: 8080, host: '127.0.0.1' });
```

#### `http.IncomingMessage`

表示传入的 HTTP 请求，实现了可读流接口。

**属性：**
- `httpVersion` (String): HTTP 版本，如 '1.1'
- `httpVersionMajor` (Number): 主版本号
- `httpVersionMinor` (Number): 次版本号
- `headers` (Object): 请求头对象
- `rawHeaders` (Array): 原始请求头数组
- `method` (String): HTTP 方法，如 'GET', 'POST'
- `url` (String): 请求 URL
- `statusCode` (Number): 响应状态码（客户端模式）
- `statusMessage` (String): 响应状态消息（客户端模式）
- `socket` (Socket): 底层 socket 连接
- `complete` (Boolean): 消息是否完整接收

**示例：**

```javascript
server.on('request', (req, res) => {
  console.log(`${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  
  req.on('end', () => {
    console.log('Body:', body);
    res.end('Received');
  });
});
```

#### `http.ServerResponse`

表示 HTTP 响应，实现了可写流接口。

**属性：**
- `statusCode` (Number): HTTP 状态码，默认 200
- `statusMessage` (String): HTTP 状态消息
- `headersSent` (Boolean): 响应头是否已发送
- `sendDate` (Boolean): 是否发送 Date 头，默认 true

**方法：**
- `response.writeHead(statusCode, [statusMessage], [headers])`: 写入响应头
- `response.setHeader(name, value)`: 设置响应头
- `response.getHeader(name)`: 获取响应头
- `response.removeHeader(name)`: 移除响应头
- `response.write(chunk, [encoding], [callback])`: 写入响应数据
- `response.end([data], [encoding], [callback])`: 结束响应
- `response.writeContinue()`: 发送 HTTP/1.1 100 Continue
- `response.writeProcessing()`: 发送 HTTP/1.1 102 Processing

**示例：**

```javascript
server.on('request', (req, res) => {
  // 方式 1: 使用 writeHead
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'X-Custom-Header': 'value'
  });
  res.end(JSON.stringify({ message: 'Success' }));
  
  // 方式 2: 使用 setHeader
  res.setHeader('Content-Type', 'text/html');
  res.statusCode = 404;
  res.end('<h1>Not Found</h1>');
});
```

#### `http.OutgoingMessage`

响应消息的基类，提供了发送 HTTP 消息的核心功能。

**方法：**
- `message.setTimeout(msecs, [callback])`: 设置超时
- `message.destroy([error])`: 销毁连接
- `message.getHeaders()`: 获取所有响应头
- `message.getHeaderNames()`: 获取所有响应头名称
- `message.hasHeader(name)`: 检查响应头是否存在

#### `http.METHODS`

支持的 HTTP 方法数组（已排序）。

```javascript
console.log(http.METHODS);
// ['ACL', 'BIND', 'CHECKOUT', 'CONNECT', 'COPY', ...]
```

#### `http.STATUS_CODES`

HTTP 状态码及其对应的消息。

```javascript
console.log(http.STATUS_CODES[200]); // 'OK'
console.log(http.STATUS_CODES[404]); // 'Not Found'
console.log(http.STATUS_CODES[500]); // 'Internal Server Error'
```

**常用状态码：**
- 2xx 成功
  - `200` - OK
  - `201` - Created
  - `204` - No Content
- 3xx 重定向
  - `301` - Moved Permanently
  - `302` - Found
  - `304` - Not Modified
- 4xx 客户端错误
  - `400` - Bad Request
  - `401` - Unauthorized
  - `403` - Forbidden
  - `404` - Not Found
- 5xx 服务器错误
  - `500` - Internal Server Error
  - `502` - Bad Gateway
  - `503` - Service Unavailable

## 🔧 核心实现

### 架构概览

```mermaid
graph TB
    A[http.ts] --> B[_http_server.ts]
    A --> C[_http_incoming.ts]
    A --> D[_http_outgoing.ts]
    A --> E[_http_common.ts]
    
    B --> E
    C --> E
    D --> E
    
    E --> F[http-parser-js]
    B --> G[react-native-tcp-socket]
    C --> H[@iwater/react-native-stream]
    D --> H
    
    style A fill:#e1f5ff
    style F fill:#ffe1e1
    style G fill:#ffe1e1
    style H fill:#ffe1e1
```

### 核心模块说明

#### 1. `http.ts` - 主入口

这是模块的主要导出文件，提供了简洁的 API 接口：

```typescript
export default {
  METHODS,           // HTTP 方法列表
  STATUS_CODES,      // 状态码映射
  IncomingMessage,   // 请求类
  OutgoingMessage,   // 响应基类
  Server,            // 服务器类
  ServerResponse,    // 服务器响应类
  createServer,      // 工厂函数
};
```

#### 2. `_http_common.ts` - 通用工具

提供 HTTP 解析和验证的核心功能：

- **HTTP 解析器管理**：基于 `http-parser-js` 的解析器池
- **头部验证**：验证 HTTP token 和头部字符的合法性
- **解析器回调**：处理头部、消息体和完成事件

关键功能：
```javascript
// 解析器分配与回收
parsers.alloc()    // 分配新解析器
freeParser(parser) // 释放解析器

// 验证函数
checkIsHttpToken(val)      // 验证 HTTP token
checkInvalidHeaderChar(val) // 验证头部字符
```

#### 3. `_http_server.ts` - 服务器实现

实现 HTTP 服务器的核心逻辑：

- **Server 类**：继承自 `net.Server`，管理 TCP 连接
- **连接处理**：`connectionListener` 为每个连接创建解析器
- **请求/响应生命周期**：管理从接收请求到发送响应的完整流程
- **Keep-Alive 支持**：维护持久连接
- **错误处理**：统一的错误处理机制

关键流程：
```javascript
// 连接建立
connectionListener(server, socket)
  ↓
// 创建解析器
parser = parsers.alloc()
  ↓
// 绑定事件处理
socket.on('data', socketOnData)
  ↓
// 解析 HTTP 消息
parser.execute(data)
  ↓
// 创建响应对象
res = new ServerResponse(req)
  ↓
// 触发 request 事件
server.emit('request', req, res)
```

#### 4. `_http_incoming.ts` - 请求处理

实现传入消息（请求）的处理：

- **IncomingMessage 类**：继承自可读流
- **头部解析**：智能处理各种 HTTP 头部
- **数据流控制**：实现背压和流控制
- **头部优化**：使用预定义映射加速常见头部处理

#### 5. `_http_outgoing.ts` - 响应处理

实现传出消息（响应）的处理：

- **OutgoingMessage 类**：继承自可写流
- **头部管理**：设置、获取、删除响应头
- **分块传输**：支持 Transfer-Encoding: chunked
- **输出缓冲**：管理未发送的数据队列
- **性能优化**：合并首个数据包与头部

### HTTP 解析器集成

本项目使用 `http-parser-js`（Node.js HTTP 解析器的纯 JS 实现）：

```javascript
const { HTTPParser } = require('http-parser-js');

// 初始化解析器
parser.initialize(HTTPParser.REQUEST, resource);

// 设置回调
parser[kOnHeaders] = parserOnHeaders;
parser[kOnHeadersComplete] = parserOnHeadersComplete;
parser[kOnBody] = parserOnBody;
parser[kOnMessageComplete] = parserOnMessageComplete;

// 执行解析
const result = parser.execute(buffer);
```

### React Native 适配要点

#### 1. Buffer 实现
使用 `@craftzdog/react-native-buffer` 替代 Node.js Buffer：

```javascript
const Buffer = require("@craftzdog/react-native-buffer").Buffer;
```

#### 2. Stream 实现
使用 `@iwater/react-native-stream` 提供流支持：

```javascript
const Stream = require('@iwater/react-native-stream');
```

#### 3. TCP Socket
使用 `react-native-tcp-socket` 提供网络层：

```javascript
import net from "react-native-tcp-socket";
```

#### 4. 移除的功能
- 异步钩子（Async Hooks）
- 某些 Node.js 特定的性能优化（如 cork/uncork）
- 部分内部模块引用

## 💡 使用示例

### RESTful API 服务器

```javascript
import http from '@iwater/react-native-http-server';

const users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' }
];

const server = http.createServer((req, res) => {
  const { method, url } = req;
  
  // 设置 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  // 路由处理
  if (method === 'GET' && url === '/api/users') {
    res.writeHead(200);
    res.end(JSON.stringify(users));
  } 
  else if (method === 'GET' && url.startsWith('/api/users/')) {
    const id = parseInt(url.split('/')[3]);
    const user = users.find(u => u.id === id);
    
    if (user) {
      res.writeHead(200);
      res.end(JSON.stringify(user));
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'User not found' }));
    }
  } 
  else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen({ port: 3000, host: '0.0.0.0' });
```

### 静态文件服务器

```javascript
import http from '@iwater/react-native-http-server';
import { readFile } from 'react-native-fs';

const server = http.createServer(async (req, res) => {
  try {
    // 注意：这只是示例，实际需要更完善的路径处理和安全检查
    const filePath = `/path/to/static${req.url}`;
    const content = await readFile(filePath);
    
    // 根据文件扩展名设置 Content-Type
    const ext = req.url.split('.').pop();
    const contentTypes = {
      'html': 'text/html',
      'css': 'text/css',
      'js': 'application/javascript',
      'json': 'application/json',
      'png': 'image/png',
      'jpg': 'image/jpeg',
    };
    
    res.setHeader('Content-Type', contentTypes[ext] || 'text/plain');
    res.writeHead(200);
    res.end(content);
  } catch (error) {
    res.writeHead(404);
    res.end('File not found');
  }
});

server.listen({ port: 8080, host: '0.0.0.0' });
```

### WebSocket 升级（配合其他库）

```javascript
import http from '@iwater/react-native-http-server';

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('HTTP Server');
});

server.on('upgrade', (req, socket, head) => {
  console.log('WebSocket upgrade request');
  // 这里可以集成 WebSocket 库处理升级
});

server.listen({ port: 8080, host: '0.0.0.0' });
```

## ⚠️ 注意事项

### 性能考虑

1. **移动设备限制**：移动设备的 CPU 和内存比服务器有限，请控制并发连接数
2. **电池消耗**：长时间运行服务器会显著消耗电量
3. **网络环境**：移动网络不稳定，需要做好错误处理

### 安全性

1. **仅限本地网络**：不建议将服务器暴露到公网
2. **输入验证**：务必验证所有输入数据
3. **权限控制**：实现适当的认证和授权机制
4. **HTTPS**：考虑使用 TLS（需要额外配置）

### 兼容性

- ✅ iOS 和 Android 均支持
- ✅ 与大多数 Node.js HTTP 客户端兼容
- ⚠️ 某些 Node.js 特定功能不可用（如 async_hooks）

## 🐛 故障排查

### 服务器无法启动

```javascript
// 检查端口是否被占用
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log('端口已被占用，尝试其他端口');
  }
});
```

### 请求超时

```javascript
// 增加超时时间
server.setTimeout(60000); // 60秒
```

### 内存泄漏

```javascript
// 确保正确关闭连接
res.on('finish', () => {
  console.log('响应已完成');
});

// 设置最大头部数量
server.maxHeadersCount = 100;
```

## 📄 许可证

本项目继承自 Node.js 核心代码，使用 MIT 许可证。

```
Copyright Joyent, Inc. and other Node contributors.
Modified by iwater@gmail.com for react-native envs
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📚 相关资源

- [Node.js HTTP 文档](https://nodejs.org/api/http.html)
- [http-parser-js](https://github.com/creationix/http-parser-js)
- [react-native-tcp-socket](https://github.com/Rapsssito/react-native-tcp-socket)
- [Koa 框架](https://koajs.com/)

## 🔗 链接

- **GitHub**: https://github.com/iwater/react-native-http-server
- **npm**: https://www.npmjs.com/package/@iwater/react-native-http-server
- **维护者**: iwater@gmail.com
