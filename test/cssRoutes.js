var path = require('path')
var Code = require('code')
var Lab = require('lab')
var lab = exports.lab = Lab.script()
var Moonboots = require('..')
var express = require('express')
var mainSample = path.join(__dirname, '..', 'sample', 'app', 'app.js')
var stylesheets = [path.join(__dirname, '..', 'sample', 'stylesheets', 'style.css')]
var request = require('supertest')
var port = 3700

function validCSSRes (moonboots, res, expect) {
  Code.expect(moonboots.ready).to.equal(true)
  Code.expect(res.statusCode).to.equal(200)
  Code.expect(res.headers['content-type']).to.equal('text/css; charset=utf-8')
  Code.expect(res.headers['cache-control']).to.equal(expect.cacheControl)
  Code.expect(res.text.indexOf(expect.source)).to.equal(0)
}

function css404 (moonboots, res) {
  Code.expect(res.statusCode).to.equal(404)
}

function routeDone (err, res, done) {
  Code.expect(err).to.equal(null)
  done()
}

lab.experiment('CSS Routes', function () {
  lab.test('Moonboots css route is correct', function (done) {
    var server = express()
    var moonboots = new Moonboots({
      moonboots: {
        main: mainSample,
        stylesheets: stylesheets
      },
      server: server
    })

    server.listen(port++)

    request(server)
        .get('/styles.abc123de.min.css')
        .expect(function (res) {
          validCSSRes(moonboots, res, {
            cacheControl: 'public, max-age=' + (86400000 * 360),
            source: 'body{'
          })
        })
        .end(function (err, res) {
          routeDone(err, res, done)
        })
  })

  lab.test('Moonboots css route is correct in dev mode', function (done) {
    var server = express()
    var moonboots = new Moonboots({
      moonboots: {
        main: mainSample,
        developmentMode: true,
        stylesheets: stylesheets
      },
      server: server
    })

    server.listen(port++)

    request(server)
        .get('/styles.nonCached.css')
        .expect(function (res) {
          validCSSRes(moonboots, res, {
            cacheControl: 'no-store',
            source: '/* SAMPLE STYLESHEET */'
          })
        })
        .end(function (err, res) {
          routeDone(err, res, done)
        })
  })

  lab.test('Moonboots css route 404s properly', function (done) {
    var server = express()
    var moonboots = new Moonboots({
      moonboots: {
        main: mainSample,
        stylesheets: stylesheets
      },
      appPath: '/',
      server: server
    })

    server.listen(port++)

    request(server)
        .get('/_styles.js')
        .expect(function (res) {
          css404(moonboots, res)
        })
        .end(function (err, res) {
          routeDone(err, res, done)
        })
  })
})
