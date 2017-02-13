var path = require('path')
var Code = require('code')
var Lab = require('lab')
var lab = exports.lab = Lab.script()
var Moonboots = require('..')
var express = require('express')

lab.experiment('Development mode', function () {
  lab.test('Development mode sets cache to 0', function (done) {
    var moonboots = new Moonboots({
      moonboots: {
        main: path.join(__dirname, '..', 'sample', 'app', 'app.js'),
        developmentMode: true
      },
      server: express()
    })

    Code.expect(moonboots.options.cachePeriod).to.equal(0)
    done()
  })
})

