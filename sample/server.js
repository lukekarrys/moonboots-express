var path = require('path')
var express = require('express')
var MoonbootsExpress = require('..')
var app = express()

// A flag to sample what happens with long before build functions
var complex = process.argv.join(' ').indexOf('--complex') > -1

var moonboots = new MoonbootsExpress({
  moonboots: {
    main: path.join(__dirname, 'app', 'app.js'),
    developmentMode: !complex,
    timingMode: complex,
    libraries: [
      path.join(__dirname, 'libraries', 'jquery-2.1.0.js')
    ],
    stylesheets: [
      path.join(__dirname, 'stylesheets', 'style.css')
    ],
    beforeBuildJS: function (cb) {
      if (complex) {
        setTimeout(cb, 5000)
      } else {
        cb()
      }
    },
    beforeBuildCSS: function (cb) {
      if (complex) {
        setTimeout(cb, 5000)
      } else {
        cb()
      }
    }
  },
  server: app
})

moonboots.on('log', console.log)

app.listen(3001)
