# react-native-http-server

Cut off from NodeJS core and modified for running in react-native envs

## Install

```sh
$ yarn add @iwater/react-native-http-server react-native-tcp-socket @craftzdog/react-native-buffer
```

## API

```js
import http from '@iwater/react-native-http-server';

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('X-Foo', 'bar');
  res.end('Hello React Native!');
});

server.listen({ port: 12345, host: '0.0.0.0' });
```