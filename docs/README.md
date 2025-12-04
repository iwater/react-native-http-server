# react-native-http-server Documentation

> A modified Node.js HTTP module adapted for React Native environments

## 📖 Introduction

`react-native-http-server` is an HTTP server implementation extracted and modified from Node.js core, specifically designed for React Native environments. It uses a pure JavaScript HTTP parser (`http-parser-js`), enabling you to run an HTTP server directly on mobile devices.

### Core Features

- ✅ **Full HTTP/1.1 Support**: Supports standard HTTP protocol features
- ✅ **Pure JavaScript Implementation**: Based on `http-parser-js`, no native modules required
- ✅ **Node.js API Compatible**: Maintains consistency with Node.js HTTP API
- ✅ **Popular Framework Support**: Integrates with Node.js frameworks like Koa
- ✅ **TCP Layer Support**: Uses `react-native-tcp-socket` for network capabilities

## 📦 Installation

```bash
yarn add @iwater/react-native-http-server react-native-tcp-socket @craftzdog/react-native-buffer
```

Or using npm:

```bash
npm install @iwater/react-native-http-server react-native-tcp-socket @craftzdog/react-native-buffer
```

## 🚀 Quick Start

### Basic Usage

Create a simple HTTP server:

```javascript
import http from '@iwater/react-native-http-server';

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('X-Foo', 'bar');
  res.writeHead(200);
  res.end('Hello from React Native HTTP Server!');
});

server.listen({ port: 12345, host: '0.0.0.0' }, () => {
  console.log('Server running at http://0.0.0.0:12345');
});
```

### Integration with Koa Framework

#### 1. Install Dependencies

```bash
yarn add koa @iwater/react-native-stream
```

#### 2. Configure Global Buffer

Add to your `index.js` entry file:

```javascript
global.Buffer = require("@craftzdog/react-native-buffer").Buffer;
```

#### 3. Configure Metro

Modify `metro.config.js`:

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

#### 4. Configure package.json

Add dependency resolutions:

```json
{
  "resolutions": {
    "keygrip": "npm:@iwater/react-native-keygrip@^1.1.1",
    "destroy": "npm:@iwater/react-native-destroy@^1.2.0"
  }
}
```

Then run:

```bash
yarn
```

#### 5. Use Koa

```javascript
import Koa from 'koa';
import http from '@iwater/react-native-http-server';

const app = new Koa();

// Middleware
app.use(async (ctx) => {
  ctx.body = 'Hello from Koa on React Native!';
});

const server = http.createServer(app.callback());
server.listen({ port: 12345, host: '0.0.0.0' }, () => {
  console.log('Koa server running at http://0.0.0.0:12345');
});
```

## 📚 API Documentation

### Module Exports

```javascript
import http from '@iwater/react-native-http-server';
```

The default export object contains the following properties:

#### `http.createServer([options], [requestListener])`

Creates an HTTP server instance.

**Parameters:**
- `options` (Object, optional)
  - `IncomingMessage` (Function): Custom request message class
  - `ServerResponse` (Function): Custom response message class
  - `insecureHTTPParser` (Boolean): Use lenient HTTP parser
- `requestListener` (Function, optional): Request listener function `(req, res) => {}`

**Returns:** `Server` instance

**Example:**

```javascript
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello World');
});
```

#### `http.Server`

HTTP server class, extends `net.Server`.

**Properties:**
- `timeout` (Number): Default 30000ms (30 seconds)
- `keepAliveTimeout` (Number): Default 5000ms (5 seconds)
- `maxHeadersCount` (Number): Maximum header count, default null (unlimited)
- `headersTimeout` (Number): Default 60000ms (60 seconds)

**Methods:**
- `server.listen(options, [callback])`: Start the server
  - `options.port` (Number): Port to listen on
  - `options.host` (String): Address to listen on
- `server.setTimeout(msecs, [callback])`: Set timeout
- `server.close([callback])`: Close the server

**Example:**

```javascript
const server = new http.Server((req, res) => {
  res.end('OK');
});

server.setTimeout(60000);
server.listen({ port: 8080, host: '127.0.0.1' });
```

#### `http.IncomingMessage`

Represents an incoming HTTP request, implements readable stream interface.

**Properties:**
- `httpVersion` (String): HTTP version, e.g., '1.1'
- `httpVersionMajor` (Number): Major version number
- `httpVersionMinor` (Number): Minor version number
- `headers` (Object): Request headers object
- `rawHeaders` (Array): Raw headers array
- `method` (String): HTTP method, e.g., 'GET', 'POST'
- `url` (String): Request URL
- `statusCode` (Number): Response status code (client mode)
- `statusMessage` (String): Response status message (client mode)
- `socket` (Socket): Underlying socket connection
- `complete` (Boolean): Whether message is completely received

**Example:**

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

Represents an HTTP response, implements writable stream interface.

**Properties:**
- `statusCode` (Number): HTTP status code, default 200
- `statusMessage` (String): HTTP status message
- `headersSent` (Boolean): Whether headers have been sent
- `sendDate` (Boolean): Whether to send Date header, default true

**Methods:**
- `response.writeHead(statusCode, [statusMessage], [headers])`: Write response headers
- `response.setHeader(name, value)`: Set response header
- `response.getHeader(name)`: Get response header
- `response.removeHeader(name)`: Remove response header
- `response.write(chunk, [encoding], [callback])`: Write response data
- `response.end([data], [encoding], [callback])`: End response
- `response.writeContinue()`: Send HTTP/1.1 100 Continue
- `response.writeProcessing()`: Send HTTP/1.1 102 Processing

**Example:**

```javascript
server.on('request', (req, res) => {
  // Method 1: Using writeHead
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'X-Custom-Header': 'value'
  });
  res.end(JSON.stringify({ message: 'Success' }));
  
  // Method 2: Using setHeader
  res.setHeader('Content-Type', 'text/html');
  res.statusCode = 404;
  res.end('<h1>Not Found</h1>');
});
```

#### `http.OutgoingMessage`

Base class for response messages, provides core functionality for sending HTTP messages.

**Methods:**
- `message.setTimeout(msecs, [callback])`: Set timeout
- `message.destroy([error])`: Destroy connection
- `message.getHeaders()`: Get all response headers
- `message.getHeaderNames()`: Get all response header names
- `message.hasHeader(name)`: Check if response header exists

#### `http.METHODS`

Array of supported HTTP methods (sorted).

```javascript
console.log(http.METHODS);
// ['ACL', 'BIND', 'CHECKOUT', 'CONNECT', 'COPY', ...]
```

#### `http.STATUS_CODES`

HTTP status codes and their corresponding messages.

```javascript
console.log(http.STATUS_CODES[200]); // 'OK'
console.log(http.STATUS_CODES[404]); // 'Not Found'
console.log(http.STATUS_CODES[500]); // 'Internal Server Error'
```

**Common Status Codes:**
- 2xx Success
  - `200` - OK
  - `201` - Created
  - `204` - No Content
- 3xx Redirection
  - `301` - Moved Permanently
  - `302` - Found
  - `304` - Not Modified
- 4xx Client Errors
  - `400` - Bad Request
  - `401` - Unauthorized
  - `403` - Forbidden
  - `404` - Not Found
- 5xx Server Errors
  - `500` - Internal Server Error
  - `502` - Bad Gateway
  - `503` - Service Unavailable

## 🔧 Core Implementation

### Architecture Overview

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

### Core Module Description

#### 1. `http.ts` - Main Entry Point

This is the main export file of the module, providing a concise API interface:

```typescript
export default {
  METHODS,           // List of HTTP methods
  STATUS_CODES,      // Status code mapping
  IncomingMessage,   // Request class
  OutgoingMessage,   // Response base class
  Server,            // Server class
  ServerResponse,    // Server response class
  createServer,      // Factory function
};
```

#### 2. `_http_common.ts` - Common Utilities

Provides core functionality for HTTP parsing and validation:

- **HTTP Parser Management**: Parser pool based on `http-parser-js`
- **Header Validation**: Validates HTTP tokens and header characters
- **Parser Callbacks**: Handles headers, body, and completion events

Key Functions:
```javascript
// Parser allocation and recycling
parsers.alloc()    // Allocate new parser
freeParser(parser) // Free parser

// Validation functions
checkIsHttpToken(val)      // Validate HTTP token
checkInvalidHeaderChar(val) // Validate header characters
```

#### 3. `_http_server.ts` - Server Implementation

Implements core HTTP server logic:

- **Server Class**: Extends `net.Server`, manages TCP connections
- **Connection Handling**: `connectionListener` creates a parser for each connection
- **Request/Response Lifecycle**: Manages complete flow from receiving requests to sending responses
- **Keep-Alive Support**: Maintains persistent connections
- **Error Handling**: Unified error handling mechanism

Key Flow:
```javascript
// Connection establishment
connectionListener(server, socket)
  ↓
// Create parser
parser = parsers.alloc()
  ↓
// Bind event handlers
socket.on('data', socketOnData)
  ↓
// Parse HTTP message
parser.execute(data)
  ↓
// Create response object
res = new ServerResponse(req)
  ↓
// Trigger request event
server.emit('request', req, res)
```

#### 4. `_http_incoming.ts` - Request Handling

Implements incoming message (request) handling:

- **IncomingMessage Class**: Extends readable stream
- **Header Parsing**: Intelligently handles various HTTP headers
- **Data Flow Control**: Implements backpressure and flow control
- **Header Optimization**: Uses predefined mappings to accelerate common header processing

#### 5. `_http_outgoing.ts` - Response Handling

Implements outgoing message (response) handling:

- **OutgoingMessage Class**: Extends writable stream
- **Header Management**: Set, get, delete response headers
- **Chunked Transfer**: Supports Transfer-Encoding: chunked
- **Output Buffering**: Manages queue of unsent data
- **Performance Optimization**: Merges first packet with headers

### HTTP Parser Integration

This project uses `http-parser-js` (pure JS implementation of Node.js HTTP parser):

```javascript
const { HTTPParser } = require('http-parser-js');

// Initialize parser
parser.initialize(HTTPParser.REQUEST, resource);

// Set callbacks
parser[kOnHeaders] = parserOnHeaders;
parser[kOnHeadersComplete] = parserOnHeadersComplete;
parser[kOnBody] = parserOnBody;
parser[kOnMessageComplete] = parserOnMessageComplete;

// Execute parsing
const result = parser.execute(buffer);
```

### React Native Adaptation Points

#### 1. Buffer Implementation
Uses `@craftzdog/react-native-buffer` to replace Node.js Buffer:

```javascript
const Buffer = require("@craftzdog/react-native-buffer").Buffer;
```

#### 2. Stream Implementation
Uses `@iwater/react-native-stream` to provide stream support:

```javascript
const Stream = require('@iwater/react-native-stream');
```

#### 3. TCP Socket
Uses `react-native-tcp-socket` to provide network layer:

```javascript
import net from "react-native-tcp-socket";
```

#### 4. Removed Features
- Async Hooks
- Some Node.js-specific performance optimizations (e.g., cork/uncork)
- Some internal module references

## 💡 Usage Examples

### RESTful API Server

```javascript
import http from '@iwater/react-native-http-server';

const users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' }
];

const server = http.createServer((req, res) => {
  const { method, url } = req;
  
  // Set CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  // Route handling
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

### Static File Server

```javascript
import http from '@iwater/react-native-http-server';
import { readFile } from 'react-native-fs';

const server = http.createServer(async (req, res) => {
  try {
    // Note: This is just an example, actual implementation needs better path handling and security checks
    const filePath = `/path/to/static${req.url}`;
    const content = await readFile(filePath);
    
    // Set Content-Type based on file extension
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

### WebSocket Upgrade (with other libraries)

```javascript
import http from '@iwater/react-native-http-server';

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('HTTP Server');
});

server.on('upgrade', (req, socket, head) => {
  console.log('WebSocket upgrade request');
  // Integrate WebSocket library here to handle upgrade
});

server.listen({ port: 8080, host: '0.0.0.0' });
```

## ⚠️ Considerations

### Performance Considerations

1. **Mobile Device Limitations**: Mobile devices have limited CPU and memory compared to servers, control concurrent connections
2. **Battery Consumption**: Running server for extended periods significantly drains battery
3. **Network Environment**: Mobile networks are unstable, implement proper error handling

### Security

1. **Local Network Only**: Not recommended to expose server to public internet
2. **Input Validation**: Always validate all input data
3. **Access Control**: Implement appropriate authentication and authorization
4. **HTTPS**: Consider using TLS (requires additional configuration)

### Compatibility

- ✅ Supports both iOS and Android
- ✅ Compatible with most Node.js HTTP clients
- ⚠️ Some Node.js-specific features unavailable (e.g., async_hooks)

## 🐛 Troubleshooting

### Server Cannot Start

```javascript
// Check if port is in use
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log('Port already in use, try another port');
  }
});
```

### Request Timeout

```javascript
// Increase timeout
server.setTimeout(60000); // 60 seconds
```

### Memory Leak

```javascript
// Ensure connections are properly closed
res.on('finish', () => {
  console.log('Response completed');
});

// Set maximum header count
server.maxHeadersCount = 100;
```

## 📄 License

This project inherits from Node.js core code and uses the MIT license.

```
Copyright Joyent, Inc. and other Node contributors.
Modified by iwater@gmail.com for react-native envs
```

## 🤝 Contributing

Issues and Pull Requests are welcome!

## 📚 Related Resources

- [Node.js HTTP Documentation](https://nodejs.org/api/http.html)
- [http-parser-js](https://github.com/creationix/http-parser-js)
- [react-native-tcp-socket](https://github.com/Rapsssito/react-native-tcp-socket)
- [Koa Framework](https://koajs.com/)

## 🔗 Links

- **GitHub**: https://github.com/iwater/react-native-http-server
- **npm**: https://www.npmjs.com/package/@iwater/react-native-http-server
- **Maintainer**: iwater@gmail.com
