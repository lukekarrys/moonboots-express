var Moonboots = require('moonboots');
var Emitter = require('events').EventEmitter;
var defaults = require('defaults');
var partial = require('partial');
var extend = require('xtend');


function MoonbootsExpress(options) {
    if (options !== Object(options)) {
        throw new Error('Invalid options');
    } else if (!options.server) {
        throw new Error('You must supply an express `server` in your options.');
    }

    Emitter.call(this);

    this.ready = false;
    this.moonboots = new Moonboots(options.moonboots);
    this.moonboots.on('ready', this.onReady.bind(this));
    this.moonboots.on('log', this.emitPassThrough.bind(this, 'log'));

    this.server = options.server;
    this.render = options.render;
    this.middleware = options.middleware || {};
    this.options = options;

    defaults(this.options, {
        cachePeriod: 86400000 * 360,
        appPath: '*'
    });

    defaults(this.middleware, {
        js: [],
        css: [],
        html: []
    });

    // Force cachePeriod to 0 in developmentMode
    if (this.moonboots.config.developmentMode) {
        this.options.cachePeriod = 0;
    }

    this.attachRoutes();

    return this;
}

MoonbootsExpress.prototype = Object.create(Emitter.prototype, {
    constructor: {
        value: MoonbootsExpress
    }
});

MoonbootsExpress.prototype.onReady = function () {
    this.ready = true;
    this.emitPassThrough('ready', arguments);
};

MoonbootsExpress.prototype.emitPassThrough = function () {
    this.emit.apply(this, arguments);
};

MoonbootsExpress.prototype.path = function (filename, ext) {
    return [
        this.moonboots.config.resourcePrefix,
        encodeURIComponent(filename),
        '.',
        (this.moonboots.config.cache ? '[a-z0-9]{8}' : 'nonCached'),
        '.',
        (this.moonboots.config.minify ? 'min.' : ''),
        ext
    ].join('');
};

MoonbootsExpress.prototype.jsPath = function () {
    return this.path(this.moonboots.config.jsFileName, 'js');
};

MoonbootsExpress.prototype.cssPath = function () {
    return this.path(this.moonboots.config.cssFileName, 'css');
};

MoonbootsExpress.prototype.attachRoutes = function () {
    var moonboots = this.moonboots;

    this.attachAssetRoute({
        path: this.jsPath(),
        contentType: 'javascript',
        cachePeriod: this.options.cachePeriod,
        source: moonboots.jsSource,
        middleware: this.middleware.js
    });

    if (moonboots.config.stylesheets.length) {
        this.attachAssetRoute({
            path: this.cssPath(),
            contentType: 'css',
            cachePeriod: this.options.cachePeriod,
            source: moonboots.cssSource,
            middleware: this.middleware.css
        });
    }

    this.attachHTMLRoute({
        path: this.options.appPath,
        contentType: 'html',
        middleware: this.middleware.html
    });
};

MoonbootsExpress.prototype.attachHTMLRoute = function (options) {
    var self = this;
    var moonboots = this.moonboots;
    var source = function (req, res) {
        if (self.render) {
            var context = moonboots.htmlContext();
            for (var ctx in context) {
                res.locals[ctx] = context[ctx];
            }
            res.locals.resourcePrefix = moonboots.config.resourcePrefix;
            self.render(req, res);
        } else {
            res.send(moonboots.htmlSource());
        }
    };

    this.attachRoute(extend(options, {
        source: source
    }));
};

MoonbootsExpress.prototype.attachAssetRoute = function (options) {
    var moonboots = this.moonboots;
    // The route will respond with moonboots' css/js source fn
    var source = function (req, res) {
        options.source.call(moonboots, function (err, src) {
            res.send(src);
        });
    };

    this.attachRoute(extend(options, {
        source: source
    }));
};


MoonbootsExpress.prototype.attachRoute = function (options) {
    this.server.get(options.path, options.middleware, function (req, res) {
        var sendSource = partial(options.source, req, res);

        res.set('Content-Type', 'text/' + options.contentType + '; charset=utf-8');
        res.set('Cache-Control', options.cachePeriod ? 'public, max-age=' + options.cachePeriod : 'no-store');

        this.ready ? sendSource() : this.moonboots.on('ready', sendSource);
    }.bind(this));
};


module.exports = MoonbootsExpress;