var Lab = require('lab');
var Moonboots = require('..');


Lab.experiment('Errors', function () {
    Lab.test('Requires an options object', function (done) {
        function noOptions() {
            new Moonboots();
        }

        Lab.expect(noOptions).to.throw(Error);
        done();
    });

    Lab.test('Requires a server', function (done) {
        function noServer() {
            new Moonboots({
                moonboots: {
                    main: __dirname + '../sample/app/app.js'
                }
            });
        }

        Lab.expect(noServer).to.throw(Error);
        done();
    });
});

