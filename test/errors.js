var path = require('path')
var Code = require('code')
var Lab = require('lab')
var lab = exports.lab = Lab.script()
var Moonboots = require('..')

lab.experiment('Errors', function () {
  lab.test('Requires an options object', function (done) {
    function noOptions () {
      // eslint-disable-next-line no-new
      new Moonboots()
    }

    Code.expect(noOptions).to.throw(Error)
    done()
  })

  lab.test('Requires a server', function (done) {
    function noServer () {
      // eslint-disable-next-line no-new
      new Moonboots({
        moonboots: {
          main: path.join(__dirname, '..', 'sample', 'app', 'app.js')
        }
      })
    }

    Code.expect(noServer).to.throw(Error)
    done()
  })
})

