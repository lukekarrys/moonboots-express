var Moonboots = require('moonboots');
var Emitter = require('events').EventEmitter;
var defaults = require('defaults');
var partial = require('partial');


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
    this.handlers = options.handlers || {};
    this.options = options;

    defaults(this.options, {
        cachePeriod: 86400000 * 360,
        appPath: '*'
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

MoonbootsExpress.prototype.filename = function (filename, ext) {
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

MoonbootsExpress.prototype.attachRoutes = function () {
    this.attachRoute({
        path: this.filename(this.moonboots.config.jsFileName, 'js'),
        contentType: 'javascript',
        cachePeriod: this.options.cachePeriod,
        source: this.handlers.js || this.moonboots.jsSource
    });

    if (this.moonboots.config.stylesheets.length) {
        this.attachRoute({
            path: this.filename(this.moonboots.config.cssFileName, 'css'),
            contentType: 'css',
            cachePeriod: this.options.cachePeriod,
            source: this.handlers.css || this.moonboots.cssSource
        });
    }

    this.attachRoute({
        path: this.options.appPath,
        contentType: 'html',
        source: this.handlers.html || function (cb) {
            cb(null, this.htmlSource());
        }
    });
};

MoonbootsExpress.prototype.attachRoute = function (options) {
    var moonboots = this.moonboots;
    var source = function (res) {
        options.source.call(moonboots, function (err, src) {
            res.send(src);
        });
    };

    this.server.get(options.path, function (req, res) {
        var sendSource = partial(source, res);

        res.set('Content-Type', 'text/' + options.contentType + '; charset=utf-8');
        res.set('Cache-Control', options.cachePeriod ? 'public, max-age=' + options.cachePeriod : 'no-store');

        this.ready ? sendSource() : moonboots.on('ready', sendSource);
    }.bind(this));
};


module.exports = MoonbootsExpress;