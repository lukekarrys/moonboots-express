var path = require('path')
var Code = require('code')
var Lab = require('lab')
var lab = exports.lab = Lab.script()
var Moonboots = require('..')
var express = require('express')
var mainSample = path.join(__dirname, '..', 'sample', 'app', 'app.js')

lab.experiment('Init', function () {
  lab.test('Moonboots instance gets ready', function (done) {
    var moonboots = new Moonboots({
      moonboots: {
        main: mainSample
      },
      server: express()
    })

    Code.expect(moonboots.ready).to.equal(false)
    moonboots.on('ready', function () {
      Code.expect(moonboots.ready).to.equal(true)
      done()
    })
  })

  lab.test('Config is passed to moonboots', function (done) {
    var moonboots = new Moonboots({
      moonboots: {
        main: mainSample,
        jsFileName: 'thisIsJS',
        cssFileName: 'thisIsCSS'
      },
      server: express()
    })

    Code.expect(moonboots.moonboots.config.main).to.equal(mainSample)
    Code.expect(moonboots.moonboots.config.jsFileName).to.equal('thisIsJS')
    Code.expect(moonboots.moonboots.config.cssFileName).to.equal('thisIsCSS')
    done()
  })

  lab.test('Default options are set', function (done) {
    var moonboots = new Moonboots({
      moonboots: {
        main: mainSample
      },
      server: express()
    })

    Code.expect(moonboots.options.appPath).to.equal('*')
    Code.expect(moonboots.options.cachePeriod).to.equal(86400000 * 360)
    done()
  })

  lab.test('Cache period can be set', function (done) {
    var moonboots = new Moonboots({
      moonboots: {
        main: mainSample
      },
      cachePeriod: 1000,
      server: express()
    })

    Code.expect(moonboots.options.cachePeriod).to.equal(1000)
    done()
  })

  lab.test('appPath can be set', function (done) {
    var moonboots = new Moonboots({
      moonboots: {
        main: mainSample
      },
      appPath: '/app/path',
      server: express()
    })

    Code.expect(moonboots.options.appPath).to.equal('/app/path')
    done()
  })
})

