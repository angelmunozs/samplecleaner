var path = require('path')
var passport = require('passport')
var auth = require('../controllers/auth')
var LocalStrategy = require('passport-local').Strategy

exports.name = "Passport"
exports.order  = 1

exports.load = function(cb) {
	// Passport auth strategy
	passport.use(new LocalStrategy({
	        usernameField: 'email',
	        passwordField: 'password'
	    },
	    auth.localAuth
	))
	passport.serializeUser(auth.serializeUser)
	passport.deserializeUser(auth.deserializeUser)

    cb()
}