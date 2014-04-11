var Lab = require('lab');
var Moonboots = require('..');
var express = require('express');


Lab.experiment('Development mode', function () {
    Lab.test('Development mode sets cache to 0', function (done) {
        var moonboots = new Moonboots({
            moonboots: {
                main: __dirname + '../sample/app/app.js',
                developmentMode: true
            },
            server: express()
        });

        Lab.expect(moonboots.options.cachePeriod).to.equal(0);
        done();
    });
});

