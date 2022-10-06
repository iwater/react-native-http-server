# react-native-http-server

Cut off from NodeJS core and modified for running in react-native envs

## Install

```sh
$ yarn add @iwater/react-native-http-server react-native-tcp-socket @craftzdog/react-native-buffer
```

## API

### use plain http server

```js
import http from '@iwater/react-native-http-server';

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('X-Foo', 'bar');
  res.end('Hello React Native!');
});

server.listen({ port: 12345, host: '0.0.0.0' });
```

### use Koa

install other deps

```sh
$ yarn add koa readable-stream
```

modify index.js

```js
global.Buffer = require("@craftzdog/react-native-buffer").Buffer;
```

modify metro.config.js

```js
module.exports = {
  resolver: {
    extraNodeModules: {
      stream: require.resolve('readable-stream'),
      net: require.resolve('react-native-tcp-socket'),
      http: require.resolve('@iwater/react-native-http-server'),
    }
  },
};
```

modify package.json

```js
  "resolutions": {
    "keygrip": "npm:@iwater/react-native-keygrip@^1.1.1",
    "destroy": "npm:@iwater/react-native-destroy@^1.2.0"
  },
```

```sh
$ yarn
```

```js
import http from '@iwater/react-native-http-server';

const app = new Koa();

// response
app.use(ctx => {
  ctx.body = 'Hello Koa';
});

const server = http.createServer(app.callback());
server.listen({ port: 12345, host: '0.0.0.0' });
```