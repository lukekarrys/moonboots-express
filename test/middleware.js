var Lab = require('lab');
var Moonboots = require('..');
var express = require('express');
var mainSample = __dirname + '/../sample/app/app.js';
var request = require('supertest');
var port = 3800;

function routeDone(err, res, done) {
    Lab.expect(err).to.equal(null);
    done();
}

function doneCount(expectCount, done) {
    var count = 0;
    return function () {
        count++;
        if (count === expectCount) {
            done();
        }
    };
}

Lab.experiment('Middlewares work as expected', function () {
    Lab.test('Setting with app.use before moonboots', function (done) {
        var server = express();

        server.use('*', function (req, res, next) {
            res.set('ETag', '12345');
            next();
        });

        new Moonboots({
            moonboots: {
                main: mainSample
            },
            server: server
        });

        server.listen(port++);

        var _done = doneCount(2, done);

        request(server)
        .get('/')
        .expect(function (res) {
            Lab.expect(res.headers.etag).to.equal('12345');
        })
        .end(function (err, res) {
            routeDone(err, res, _done);
        });

        request(server)
        .get('/app.abc123de.min.js')
        .expect(function (res) {
            Lab.expect(res.headers.etag).to.equal('12345');
        })
        .end(function (err, res) {
            routeDone(err, res, _done);
        });
    });

    Lab.test('Setting with middleware options', function (done) {
        var server = express();

        new Moonboots({
            moonboots: {
                main: mainSample
            },
            server: server,
            middleware: {
                html: function (req, res, next) {
                    res.set('ETag', '12345');
                    next();
                },
                js: function (req, res, next) {
                    res.set('ETag', '67890');
                    next();
                }
            }
        });

        var _done = doneCount(2, done);

        server.listen(port++);

        request(server)
        .get('/')
        .expect(function (res) {
            Lab.expect(res.headers.etag).to.equal('12345');
        })
        .end(function (err, res) {
            routeDone(err, res, _done);
        });

        request(server)
        .get('/app.abc123de.min.js')
        .expect(function (res) {
            Lab.expect(res.headers.etag).to.equal('67890');
        })
        .end(function (err, res) {
            routeDone(err, res, _done);
        });
    });
});

