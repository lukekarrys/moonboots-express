var Moonboots = require('moonboots');
var _ = require('underscore');
var Emitter = require('events').EventEmitter;


function MoonbootsExpress(options) {
    if (!_.isObject(options)) {
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
    this.options = _.omit(options, 'moonboots', 'server');

    _.defaults(this.options, {
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
    return '/' + encodeURIComponent(filename) + '.*.' + (this.moonboots.config.minify ? 'min.' : '') + ext;
};

MoonbootsExpress.prototype.attachRoutes = function () {
    this.attachRoute({
        path: this.filename(this.moonboots.config.jsFileName, 'js'),
        contentType: 'javascript',
        cachePeriod: this.options.cachePeriod,
        source: this.moonboots.jsSource
    });

    if (this.moonboots.config.stylesheets.length) {
        this.attachRoute({
            path: this.filename(this.moonboots.config.cssFileName, 'css'),
            contentType: 'css',
            cachePeriod: this.options.cachePeriod,
            source: this.moonboots.cssSource
        });
    }

    this.attachRoute({
        path: this.options.appPath,
        contentType: 'html',
        source: function (cb) {
            cb(null, this.htmlSource());
        }
    });
};

MoonbootsExpress.prototype.attachRoute = function (options) {
    var moonboots = this.moonboots;
    var sourceFn = options.source.bind(moonboots);

    this.server.get(options.path, function (req, res) {
        var sendSource = _.partial(sourceFn, function (err, source) {
            res.send(source);
        });

        res.set('Content-Type', 'text/' + options.contentType + '; charset=utf-8');
        res.set('Cache-Control', options.cachePeriod ? 'public, max-age=' + options.cachePeriod : 'no-store');

        if (this.ready) {
            sendSource();
        } else {
            moonboots.on('ready', sendSource);
        }
    }.bind(this));
};


module.exports = MoonbootsExpress;