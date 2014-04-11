var Lab = require('lab');
var Moonboots = require('..');
var express = require('express');
var mainSample = __dirname + '/../sample/app/app.js';


Lab.experiment('Init', function () {
    Lab.test('Moonboots instance gets ready', function (done) {
        var moonboots = new Moonboots({
            moonboots: {
                main: mainSample
            },
            server: express()
        });

        Lab.expect(moonboots.ready).to.equal(false);
        moonboots.on('ready', function () {
            Lab.expect(moonboots.ready).to.equal(true);
            done();
        });
    });

    Lab.test('Config is passed to moonboots', function (done) {
        var moonboots = new Moonboots({
            moonboots: {
                main: mainSample,
                jsFileName: 'thisIsJS',
                cssFileName: 'thisIsCSS'
            },
            server: express()
        });

        Lab.expect(moonboots.moonboots.config.main).to.equal(mainSample);
        Lab.expect(moonboots.moonboots.config.jsFileName).to.equal('thisIsJS');
        Lab.expect(moonboots.moonboots.config.cssFileName).to.equal('thisIsCSS');
        done();
    });

    Lab.test('Default options are set', function (done) {
        var moonboots = new Moonboots({
            moonboots: {
                main: mainSample
            },
            server: express()
        });

        Lab.expect(moonboots.options.appPath).to.equal('*');
        Lab.expect(moonboots.options.cachePeriod).to.equal(86400000 * 360);
        done();
    });

    Lab.test('Cache period can be set', function (done) {
        var moonboots = new Moonboots({
            moonboots: {
                main: mainSample
            },
            cachePeriod: 1000,
            server: express()
        });

        Lab.expect(moonboots.options.cachePeriod).to.equal(1000);
        done();
    });

    Lab.test('appPath can be set', function (done) {
        var moonboots = new Moonboots({
            moonboots: {
                main: mainSample
            },
            appPath: '/app/path',
            server: express()
        });

        Lab.expect(moonboots.options.appPath).to.equal('/app/path');
        done();
    });
});

