var path = require('path')
var glob = require('glob')
var api = require('../api')

var init = function(app){
    // Prepare the error handler
    app.use('/api/*', api.error)
    // Init the res obj in api calls
    app.all('/api/*', api.init)

    return glob(path.join(__dirname, '*.js'), function(err, files) {
        for (var idx in files) {
            var filename = files[idx]

            if (/index.js$/.test(filename))
                continue

            var router = require(filename)
            router(app)
        }
        //  Default fallback
        app.all('/api/*', api.fallback)
    })
}

module.exports = {
    mount: init
}