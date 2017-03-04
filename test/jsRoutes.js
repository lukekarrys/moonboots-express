var path = require('path')
var Code = require('code')
var Lab = require('lab')
var lab = exports.lab = Lab.script()
var Moonboots = require('..')
var express = require('express')
var mainSample = path.join(__dirname, '..', 'sample', 'app', 'app.js')
var request = require('supertest')
var port = 3600

function validJSRes (moonboots, res, expect) {
  Code.expect(moonboots.ready).to.equal(true)
  Code.expect(res.statusCode).to.equal(200)
  Code.expect(res.headers['content-type']).to.equal('text/javascript; charset=utf-8')
  Code.expect(res.headers['cache-control']).to.equal(expect.cacheControl)
  Code.expect(res.text.indexOf(expect.source)).to.equal(0)
}

function js404 (moonboots, res) {
  Code.expect(res.statusCode).to.equal(404)
}

function routeDone (err, res, done) {
  Code.expect(err).to.equal(null)
  done()
}

lab.experiment('JS Routes', function () {
  lab.test('Moonboots js route is correct', function (done) {
    var server = express()
    var moonboots = new Moonboots({
      moonboots: {
        main: mainSample
      },
      server: server
    })

    server.listen(port++)

    request(server)
        .get('/app.abc123de.min.js')
        .expect(function (res) {
          validJSRes(moonboots, res, {
            cacheControl: 'public, max-age=' + (86400000 * 360),
            source: '!function'
          })
        })
        .end(function (err, res) {
          routeDone(err, res, done)
        })
  })

  lab.test('Moonboots js route is correct in dev mode', function (done) {
    var server = express()
    var moonboots = new Moonboots({
      moonboots: {
        main: mainSample,
        developmentMode: true
      },
      server: server
    })

    server.listen(port++)

    request(server)
        .get('/app.nonCached.js')
        .expect(function (res) {
          validJSRes(moonboots, res, {
            cacheControl: 'no-store',
            source: ';(function'
          })
        })
        .end(function (err, res) {
          routeDone(err, res, done)
        })
  })

  lab.test('Moonboots js route 404s properly', function (done) {
    var server = express()
    var moonboots = new Moonboots({
      moonboots: {
        main: mainSample
      },
      appPath: '/',
      server: server
    })

    server.listen(port++)

    request(server)
        .get('/_app.js')
        .expect(function (res) {
          js404(moonboots, res)
        })
        .end(function (err, res) {
          routeDone(err, res, done)
        })
  })
})
