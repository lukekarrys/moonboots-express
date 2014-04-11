var Lab = require('lab');
var Moonboots = require('..');
var express = require('express');
var mainSample = __dirname + '/../sample/app/app.js';
var stylesheets = [__dirname + '/../sample/stylesheets/style.css'];
var request = require('supertest');
var port = 3700;

function validCSSRes(moonboots, res, cacheControl) {
    Lab.expect(moonboots.ready).to.equal(true);
    Lab.expect(res.statusCode).to.equal(200);
    Lab.expect(res.headers['content-type']).to.equal('text/css; charset=utf-8');
    Lab.expect(res.headers['cache-control']).to.equal(cacheControl);
    if (cacheControl === 'no-store') {
        Lab.expect(res.text.indexOf('/* SAMPLE STYLESHEET */')).to.equal(0);
    } else {
        Lab.expect(res.text.indexOf('body{')).to.equal(0);
    }
}

function css404(moonboots, res) {
    Lab.expect(res.statusCode).to.equal(404);
}

function routeDone(err, res, done) {
    Lab.expect(err).to.equal(null);
    done();
}

Lab.experiment('CSS Routes', function () {
    Lab.test('Moonboots css route is correct', function (done) {
        var server = express();
        var moonboots = new Moonboots({
            moonboots: {
                main: mainSample,
                stylesheets: stylesheets
            },
            server: server
        });

        server.listen(port++);

        request(server)
        .get('/styles.HASH.min.css')
        .expect(function (res) {
            validCSSRes(moonboots, res, 'public, max-age=' + 86400000 * 360);
        })
        .end(function (err, res) {
            routeDone(err, res, done);
        });
    });

    Lab.test('Moonboots css route is correct in dev mode', function (done) {
        var server = express();
        var moonboots = new Moonboots({
            moonboots: {
                main: mainSample,
                developmentMode: true,
                stylesheets: stylesheets
            },
            server: server
        });

        server.listen(port++);

        request(server)
        .get('/styles.nonCached.css')
        .expect(function (res) {
            validCSSRes(moonboots, res, 'no-store');
        })
        .end(function (err, res) {
            routeDone(err, res, done);
        });
    });

    Lab.test('Moonboots css route 404s properly', function (done) {
        var server = express();
        var moonboots = new Moonboots({
            moonboots: {
                main: mainSample,
                stylesheets: stylesheets
            },
            appPath: '/',
            server: server
        });

        server.listen(port++);

        request(server)
        .get('/_styles.js')
        .expect(function (res) {
            css404(moonboots, res);
        })
        .end(function (err, res) {
            routeDone(err, res, done);
        });
    });
});

