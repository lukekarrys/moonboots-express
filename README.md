moonboots-express
=================

[![NPM](https://nodei.co/npm/moonboots-express.png)](https://nodei.co/npm/moonboots-express/)
[![Build Status](https://travis-ci.org/lukekarrys/moonboots-express.png?branch=master)](https://travis-ci.org/lukekarrys/moonboots-express)

**Express plugin for moonboots.**

Just like [Moonboots](https://github.com/HenrikJoreteg/moonboots) but it will create the necessary HTML, JS, CSS routes for you in your Express server with the correct content-types and cache-control.


## Install

`npm install moonboots-express --save`


## Usage

Create a new instance of `moonboots-express` and pass in the necessary options, including an express server. The `moonboots` option will be passed directly to Moonboots proper. `moonboots-express` will add the necessary routes to your express server. Outside of that, you can setup your express server however you normally would.

```js
var Moonboots = require('moonboots-express');
var express = require('express');
var app = express();

/*********
    Configure your express app
**********/

var moonboots = new Moonboots({
    server: app,
    moonboots: {
        main: __dirname + '/clientapp/app.js'
    }
});

app.listen(process.env.PORT);
```


## API

- `appPath`: (default: `*`) The default is to serve the app HTML for all routes. You can pass in a path just as you would to `app.get(path)` to change it.
- `server`: This is your Express server and it is required. `moonboots-express` will add routes for HTML and JS (and CSS if necessary).
- `cachePeriod`: (default: `1 year`) How long in miliseconds that you want to cache the CSS and JS when `developmentMode: false`.
- `middleware`: An object with `js`, `css`, and/or `html` properties. Each can be a single function or an array of functions and will be used as middleware for that particular route. See the [Express routing documentation](http://expressjs.com/3x/api.html#app.VERB) for more information.
- `render`: A function with the signature `(req, res)` that will be called to set the response of the HTML route. It will have `resourcePrefix`, `cssFileName`, and `jsFileName` set on `res.locals`. By default this will just do `res.send` with the [default Moonboots HTML source](https://github.com/HenrikJoreteg/moonboots/blob/master/index.js#L176-L180).
- `moonboots`: This is an object that is passed directly to [Moonboots](https://github.com/HenrikJoreteg/moonboots). See the [documentation](https://github.com/HenrikJoreteg/moonboots#options) for what options are available.


## What's happening?

`moonboots-express` is doing a few things for you:

1. Create a `GET` route for your app's HTML at `options.appPath` with the correct contentType
2. Create a `GET` route for your app's JS (and CSS if necessary) with the correct contentType
3. If you are in `developmentMode` your JS/CSS will be re-bundled on each request
4. If you are not in `developmentMode` your JS/CSS will be cached and the cache-control headers will be set to `cachePeriod`
5. Any requests made before moonboots is ready (which can happen if you're doing complex things in the `beforeBuild` functions) will wait for it to be ready before they are served. If you want an example of this, run `node sample/server --complex` and make a request to `http://localhost:3001`. The request will wait ~5 seconds before completing, but any subsequent requests will be instant.


## HTML Route Rendering

If you don't want your HTML to be the default content served by Moonboots you can use the `render` option. Here's an example where a jade file is rendered using the variables from `res.locals`.

**views/index.jade**
```jade
doctype html
html
  head
    link(rel='stylesheet', href=locals.resourcePrefix + locals.cssFileName)
    script(src=locals.resourcePrefix + locals.jsFileName)
```

**server.js**
```js
var express = require('express');
var Moonboots = require('moonboots-express');
var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

var moonboots = new Moonboots({
    moonboots: {
        main: __dirname + '/clientapp/app.js',
        resourcePrefix: '/assets/'
    },
    server: app,
    render: function (req, res) {
        // necessary res.locals are set by moonboots-express
        res.render('index');
    }
});
```


## Configuring Express

### Routes

You should almost always set your routes **before** creating your `moonboots-express` instance. This is because the default `appPath` is `*`, so this route will take precedence over anything created after it. Here's an example of a **Bad Idea**:

```js
var express = require('express');
var Moonboots = require('moonboots-express');
var app = express();

// The route should go here

new Moonboots({
    moonboots: { main: __dirname + '/clientapp/app.js' },
    server: app
});

app.get('/my-static-page', function (req, res) {
    // Whoops, this is unreachable!
});
```

### Middleware

Since `moonboots-express` is just attaching a few routes to your server, you can use `app.use` as you normally would to set Express middleware functions. Here's an example where a header is set for all routes, including the ones created by `moonboots-express`.

```js
var express = require('express');
var Moonboots = require('moonboots-express');
var app = express();

app.use('*', function (req, res, next) {
    res.set('my-special-header', 'header-content');
    next();
});

new Moonboots({
    moonboots: { main: __dirname + '/clientapp/app.js' },
    server: app
});
```

If you want to run route specific middleware use the `middleware` config option. Here's an example where a different header is set for each route:

```js
var express = require('express');
var Moonboots = require('moonboots-express');
var app = express();

new Moonboots({
    moonboots: { main: mainSample },
    server: app,
    middleware: {
        html: function (req, res, next) {
            res.set('my-special-html-header', 'header-content');
            next();
        },
        css: function (req, res, next) {
            res.set('my-special-css-header', 'header-content');
            next();
        },
        js: function (req, res, next) {
            res.set('my-special-js-header', 'header-content');
            next();
        }
    }
});
```

## Logging

`moonboots-express` will emit all the same log events that `moonboots` does, so if you wanted to log everything from Moonboots you could do:

```js
var Moonboots = require('moonboots-express');
var moonboots = new Moonboots(options);

moonboots.on('log', console.log);
```

## Test

Run `npm test`

## Sample

Run `npm start` and make sure you have a grey (`#ccc`) background and the `Woo! View source to see what rendered me.` message in your window.

#License

MIT
