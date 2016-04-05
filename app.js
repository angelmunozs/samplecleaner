//  Requirements
var express         = require('express')
var path            = require('path')
var favicon         = require('serve-favicon')
var cookieParser    = require('cookie-parser')
var bodyParser      = require('body-parser')
var async           = require('async')
var partials        = require('express-partials')
var session         = require('express-session')
var morgan          = require('morgan')
var passport        = require('passport')
var site            = require('./controllers')
var modules         = require('./modules')
var config          = require('./config')

var router      = require('./router')
var app         = express()

//  Returns the response code escaped by a ANSII color:
//      * 2XX: Green
//      * 3XX: Cyan
//      * 4XX: Yellow
//      * 5XX: Red
var responseColor = function(req, res) {
    var status = res.statusCode
    var color = 32

    if (status >= 500)
        color = 31
    else if (status >= 400)
        color = 33
    else if (status >= 300)
        color = 36

    return '\x1b[' + color + 'm' + status + '\x1b[0m'
}
//  Express session options
var sessionOptions = {
  resave: true,
  saveUninitialized: false,
  secret: config.SESSION_SECRET,
  cookie: {
    maxAge: null // do not expire client side
  }
}

//  Views engine
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

//  Modules
app.use(favicon(__dirname + '/public/favicon.ico'))
morgan.token('status', responseColor)
app.use(morgan('tiny'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use('/components', express.static(path.join(__dirname, 'bower_components')))
app.use(site.prerender)
app.use(partials())
app.use(session(sessionOptions))
app.use(passport.initialize())
app.use(passport.session())
router.mount(app)
modules.load()

//  Development error handler
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500)
    res.render('error', {
      message: err.message,
      error: err
    })
  })
}

//  Production error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500)
  res.render('error', {
    message: err.message,
    error: {}
  })
})

module.exports = app