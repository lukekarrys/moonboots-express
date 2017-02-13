var path = require('path')
var Code = require('code')
var Lab = require('lab')
var lab = exports.lab = Lab.script()
var Moonboots = require('..')
var express = require('express')
var mainSample = path.join(__dirname, '..', 'sample', 'app', 'app.js')
var request = require('supertest')
var port = 3500

function validHTMLRes (moonboots, res, source) {
  Code.expect(moonboots.ready).to.equal(true)
  Code.expect(res.statusCode).to.equal(200)
  Code.expect(res.headers['content-type']).to.equal('text/html; charset=utf-8')
  Code.expect(res.headers['cache-control']).to.equal('no-store')
  Code.expect(res.text.indexOf(source || '<!DOCTYPE html>')).to.equal(0)
}

function html404 (moonboots, res) {
  Code.expect(res.statusCode).to.equal(404)
}

function routeDone (err, res, done) {
  Code.expect(err).to.equal(null)
  done()
}

lab.experiment('HTML Routes', function () {
  lab.test('Moonboots html route is correct', function (done) {
    var server = express()
    var moonboots = new Moonboots({
      moonboots: {
        main: mainSample
      },
      server: server
    })

    server.listen(port++)

    request(server)
        .get('/')
        .expect(function (res) {
          validHTMLRes(moonboots, res)
        })
        .end(function (err, res) {
          routeDone(err, res, done)
        })
  })

  lab.test('Specify html render function with res.send', function (done) {
    var server = express()
    var moonboots = new Moonboots({
      moonboots: {
        main: mainSample,
        developmentMode: true
      },
      server: server,
      render: function (req, res) {
        res.send('<HTML><script src="' + res.locals.resourcePrefix + res.locals.jsFileName + '">')
      }
    })

    server.listen(port++)

    request(server)
        .get('/')
        .expect(function (res) {
          validHTMLRes(moonboots, res, '<HTML><script src="/app.nonCached.js">')
        })
        .end(function (err, res) {
          routeDone(err, res, done)
        })
  })

  lab.test('Specify html render function with res.render and jade', function (done) {
    var server = express()

    server.set('views', path.join(__dirname, '..', 'sample'))
    server.set('view engine', 'jade')

    var moonboots = new Moonboots({
      moonboots: {
        main: mainSample,
        developmentMode: true,
        resourcePrefix: '/assets/'
      },
      server: server,
      render: function (req, res) {
        res.render('index')
      }
    })

    server.listen(port++)

    request(server)
        .get('/')
        .expect(function (res) {
          var resp = [
            '<!DOCTYPE html><html><head>',
            '<link rel="stylesheet" href="/assets/styles.nonCached.css">',
            '<script src="/assets/app.nonCached.js"></script>',
            '</head></html>'
          ].join('')
          validHTMLRes(moonboots, res, resp)
        })
        .end(function (err, res) {
          routeDone(err, res, done)
        })
  })

  lab.test('Moonboots html route is correct in dev mode', function (done) {
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
        .get('/')
        .expect(function (res) {
          validHTMLRes(moonboots, res)
        })
        .end(function (err, res) {
          routeDone(err, res, done)
        })
  })

  lab.test('Moonboots waits for ready event', function (done) {
    var server = express()
    var moonboots = new Moonboots({
      moonboots: {
        main: mainSample,
        beforeBuildJS: function (cb) {
          setTimeout(cb, 1500)
        }
      },
      server: server
    })

    server.listen(port++)

    request(server)
        .get('/')
        .expect(function (res) {
          validHTMLRes(moonboots, res)
        })
        .end(function (err, res) {
          routeDone(err, res, done)
        })
  })

  lab.test('Moonboots works after ready event', function (done) {
    var server = express()
    var moonboots = new Moonboots({
      moonboots: {
        main: mainSample,
        beforeBuildJS: function (cb) {
          setTimeout(cb, 1500)
        }
      },
      server: server
    })

    server.listen(port++)

    moonboots.on('ready', function () {
      request(server)
            .get('/')
            .expect(function (res) {
              validHTMLRes(moonboots, res)
            })
            .end(function (err, res) {
              routeDone(err, res, done)
            })
    })
  })

  lab.test('Default appPath', function (done) {
    var server = express()
    var moonboots = new Moonboots({
      moonboots: {
        main: mainSample
      },
      server: server
    })

    server.listen(port++)

    request(server)
        .get('/all/paths/should/work')
        .expect(function (res) {
          validHTMLRes(moonboots, res)
        })
        .end(function (err, res) {
          routeDone(err, res, done)
        })
  })

  lab.test('Specific appPath', function (done) {
    var appPath = '/only/this/path/should/work'
    var server = express()
    var moonboots = new Moonboots({
      moonboots: {
        main: mainSample
      },
      appPath: appPath,
      server: server
    })
    var doneCount = (function (expectCount) {
      var count = 0
      return function () {
        count++
        if (count === expectCount) {
          done()
        }
      }
    })(2)

    server.listen(port++)

    request(server)
        .get('/')
        .expect(function (res) {
          html404(moonboots, res)
        })
        .end(function (err, res) {
          routeDone(err, res, doneCount)
        })

    request(server)
        .get(appPath)
        .expect(function (res) {
          validHTMLRes(moonboots, res)
        })
        .end(function (err, res) {
          routeDone(err, res, doneCount)
        })
  })
})

