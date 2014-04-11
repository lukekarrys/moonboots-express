var Lab = require('lab');
var Moonboots = require('..');
var express = require('express');
var mainSample = __dirname + '/../sample/app/app.js';
var request = require('supertest');
var port = 3500;

function validHTMLRes(moonboots, res) {
    Lab.expect(moonboots.ready).to.equal(true);
    Lab.expect(res.statusCode).to.equal(200);
    Lab.expect(res.headers['content-type']).to.equal('text/html; charset=utf-8');
    Lab.expect(res.headers['cache-control']).to.equal('no-store');
    Lab.expect(res.text.indexOf('<!DOCTYPE html>')).to.equal(0);
}

function html404(moonboots, res) {
    Lab.expect(res.statusCode).to.equal(404);
}

function routeDone(err, res, done) {
    Lab.expect(err).to.equal(null);
    done();
}

Lab.experiment('HTML Routes', function () {
    Lab.test('Moonboots html route is correct', function (done) {
        var server = express();
        var moonboots = new Moonboots({
            moonboots: {
                main: mainSample
            },
            server: server
        });

        server.listen(port++);

        request(server)
        .get('/')
        .expect(function (res) {
            validHTMLRes(moonboots, res);
        })
        .end(function (err, res) {
            routeDone(err, res, done);
        });
    });

    Lab.test('Moonboots html route is correct in dev mode', function (done) {
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
        .get('/')
        .expect(function (res) {
            validHTMLRes(moonboots, res);
        })
        .end(function (err, res) {
            routeDone(err, res, done);
        });
    });

    Lab.test('Moonboots waits for ready event', function (done) {
        var server = express();
        var moonboots = new Moonboots({
            moonboots: {
                main: mainSample,
                beforeBuildJS: function (cb) {
                    setTimeout(cb, 1500);
                }
            },
            server: server
        });

        server.listen(port++);

        request(server)
        .get('/')
        .expect(function (res) {
            validHTMLRes(moonboots, res);
        })
        .end(function (err, res) {
            routeDone(err, res, done);
        });
    });

    Lab.test('Moonboots works after ready event', function (done) {
        var server = express();
        var moonboots = new Moonboots({
            moonboots: {
                main: mainSample,
                beforeBuildJS: function (cb) {
                    setTimeout(cb, 1500);
                }
            },
            server: server
        });

        server.listen(port++);

        moonboots.on('ready', function () {
            request(server)
            .get('/')
            .expect(function (res) {
                validHTMLRes(moonboots, res);
            })
            .end(function (err, res) {
                routeDone(err, res, done);
            });
        });
    });

    Lab.test('Default appPath', function (done) {
        var server = express();
        var moonboots = new Moonboots({
            moonboots: {
                main: mainSample
            },
            server: server
        });

        server.listen(port++);

        request(server)
        .get('/all/paths/should/work')
        .expect(function (res) {
            validHTMLRes(moonboots, res);
        })
        .end(function (err, res) {
            routeDone(err, res, done);
        });
    });

    Lab.test('Specific appPath', function (done) {
        var appPath = '/only/this/path/should/work';
        var server = express();
        var moonboots = new Moonboots({
            moonboots: {
                main: mainSample
            },
            appPath: appPath,
            server: server
        });
        var doneCount = (function (expectCount) {
            var count = 0;
            return function () {
                count++;
                if (count === expectCount) {
                    done();
                }
            };
        })(2);

        server.listen(port++);

        request(server)
        .get('/')
        .expect(function (res) {
            html404(moonboots, res);
        })
        .end(function (err, res) {
            routeDone(err, res, doneCount);
        });

        request(server)
        .get(appPath)
        .expect(function (res) {
            validHTMLRes(moonboots, res);
        })
        .end(function (err, res) {
            routeDone(err, res, doneCount);
        });
    });
});

