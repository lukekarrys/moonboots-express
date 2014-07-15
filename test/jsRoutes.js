var Lab = require('lab');
var Moonboots = require('..');
var express = require('express');
var mainSample = __dirname + '/../sample/app/app.js';
var request = require('supertest');
var port = 3600;

function validJSRes(moonboots, res, expect) {
    Lab.expect(moonboots.ready).to.equal(true);
    Lab.expect(res.statusCode).to.equal(200);
    Lab.expect(res.headers['content-type']).to.equal('text/javascript; charset=utf-8');
    Lab.expect(res.headers['cache-control']).to.equal(expect.cacheControl);
    Lab.expect(res.text.indexOf(expect.source)).to.equal(0);
}

function js404(moonboots, res) {
    Lab.expect(res.statusCode).to.equal(404);
}

function routeDone(err, res, done) {
    Lab.expect(err).to.equal(null);
    done();
}

Lab.experiment('JS Routes', function () {
    Lab.test('Moonboots js route is correct', function (done) {
        var server = express();
        var moonboots = new Moonboots({
            moonboots: {
                main: mainSample
            },
            server: server
        });

        server.listen(port++);

        request(server)
        .get('/app.abc123de.min.js')
        .expect(function (res) {
            validJSRes(moonboots, res, {
                cacheControl: 'public, max-age=' + 86400000 * 360,
                source: '!function'
            });
        })
        .end(function (err, res) {
            routeDone(err, res, done);
        });
    });

    Lab.test('Moonboots js route is correct in dev mode', function (done) {
        var server = express();
        var moonboots = new Moonboots({
            moonboots: {
                main: mainSample,
                developmentMode: true
            },
            server: server
        });

        server.listen(port++);

        request(server)
        .get('/app.nonCached.js')
        .expect(function (res) {
            validJSRes(moonboots, res, {
                cacheControl: 'no-store',
                source: ';(function'
            });
        })
        .end(function (err, res) {
            routeDone(err, res, done);
        });
    });

    Lab.test('Moonboots js route 404s properly', function (done) {
        var server = express();
        var moonboots = new Moonboots({
            moonboots: {
                main: mainSample
            },
            appPath: '/',
            server: server
        });

        server.listen(port++);

        request(server)
        .get('/_app.js')
        .expect(function (res) {
            js404(moonboots, res);
        })
        .end(function (err, res) {
            routeDone(err, res, done);
        });
    });
});

