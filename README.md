# koa http concat

A koa middleware for concatenating files in a given context: CSS and JS files usually.

Reference [http-cancat](https://github.com/weizs/http-concat)

## Install

``` bash
npm i koa-http-concat -S
```

## Usage

### Server Side

``` javascript
const path = require('path');
const koa = require('koa');
const koaHttpConcat = require('koa-http-concat');

const app = koa();

app.use(koaHttpConcat({
	base: path.join(__dirname, 'public'),
	path: '/'
}));

app.listen(3000);
```

### Client Side

```
http://example.com/??script1.js,script2.js,build/script.js
http://example.com/??script1.js,script2.js,build/script.js?v=2016
http://example.com/??style1.css,style2.css,build/style.css
http://example.com/??style1.css,style2.css,build/style.css?v=2016
```