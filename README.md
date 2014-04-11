moonboots-express
=================

[![NPM](https://nodei.co/npm/moonboots-express.png)](https://nodei.co/npm/moonboots-express/)
[![Build Status](https://travis-ci.org/lukekarrys/moonboots-express.png?branch=master)](https://travis-ci.org/lukekarrys/moonboots-express)

**Express plugin for moonboots.**

Just like [Moonboots](https://github.com/HenrikJoreteg/moonboots) but it will create the necessary HTML, JS, CSS routes for you in your express server with the correct content-types and cache-control.

## Usage

Create a new instance of `moonboots-express` and pass in the necessary options, including an express server. The `moonboots` option will be passed directly to Moonboots proper. `moonboots-express` will add the necessary routes to your express server. Outside of that, you can setup your express server however you normally would.

```js
var Moonboots = require('moonboots-express');
var express = require('express');
var app = express();

var moonboots = new Moonboots({
    server: app,
    moonboots: {
        main: __dirname + '/app.js'
    }
});

/*********
    Do whatever else to setup your express app
**********/

app.listen(process.env.PORT);
```

## API

- `appPath`: (default: '*') The default is to serve the app HTML for all routes. You can pass in a path just as you would to `app.get(path)` to change it.
- `server`: This is your express server and it is required. `moonboots-express` will add routes for HTML and JS (and CSS if necessary).
- `cachePeriod`: (default: 1 year) How long in miliseconds that you want to cache the CSS and JS when not in `developmentMode`.
- `moonboots`: This is an object that is passed directly to [Moonboots](https://github.com/HenrikJoreteg/moonboots). See the [documentation](https://github.com/HenrikJoreteg/moonboots#options) for what options are available.

## What's happening?

`moonboots-express` is doing a few things for you:

1. Create a `GET` route for your app's HTML at `options.appPath` with the correct contentType
2. Create a `GET` route for your app's JS (and CSS if necessary) with the correct contentTypes
3. If you are in `developmentMode` your JS/CSS will be re-bundled on each request
4. If you are not in `developmentMode` your JS/CSS will be cached and the cache-control headers will be set to `cachePeriod`
5. Any requests made before moonboots is ready (which can happen if you're doing complex things in the `beforeBuild` functions) will wait for it to be ready before they are served. If you want an example of this, run `node sample/server --complex` and make a request to `http://localhost:3001`. The request will wait ~5 seconds before completing, but any subsequent requests will be instant.

## Logging

`moonboots-express` will emit all the same log events that `moonboots` does, so if you wanted to log everything from moonboots you could do:

```js
var Moonboots = require('moonboots-express');
var moonboots = new Moonboots(/* OPTIONS */);

moonboots.on('log', console.log);
```

## Test

Run `npm test`

## Sample

Run `npm start` and make sure you have a grey (#ccc) background and the `Woo! View source to see what rendered me` message in your window.

#License

MIT
