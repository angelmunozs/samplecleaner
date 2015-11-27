//  Requirements
var Errores = require('../tools/errores')
var crypt = require('../tools/crypt')
var utils = require('../tools/utils')
var async = require('async')
var passport = require('passport')

//  Log in
module.exports.login = function(req, res, next) {

    passport.authenticate('local', function(error_passport, user, info) {

        if (error_passport) {
            //  console.log('WARNING! %s', error_passport)
            req.error = error_passport
            return next()
        }
        if (!user) {
            //  console.log('WARNING! %s', '!user')
            req.error = Errores.ACCESO_DENEGADO
            return next()
        }
        //  Realiza login
        req.login(user, function(error_login) {
            if (error_login) {
                console.log('WARNING! %s', error_login)
                req.error = Errores.ERROR_LOGIN
                return next()
            }
            //  Actualiza las fechas de login y la IP
            async.series([
                //  Update last login and last IP
                function ultimoLogin (cb) {
                    Query('UPDATE users SET lastLogin = ?, lastIP = ? WHERE idUser = ?', [new Date(), req.ip, user.idUser])
                    .then(function() {
                        cb()
                    })
                    .catch(cb)
                },
                //  Update last times logged in
                // function timesLoggedIn (cb) {
                //     Query('UPDATE users SET timesLoggedIn = timesLoggedIn + 1 WHERE idUser = ?', [user.idUser])
                //     .then(function() {
                //         cb()
                //     })
                //     .catch(cb)
                // },
                //  Update first login and first IP, if first time logged in
                function primerLogin (cb) {
                    if(!user.firstIP && !user.firstLogin) {
                        Query('UPDATE users SET firstLogin = lastLogin, firstIP = lastIP WHERE idUser = ?', [user.idUser])
                        .then(function() {
                            cb()
                        })
                        .catch(cb)
                    }
                    else {
                        cb()
                    }
                }
            //  When completed
            ], function(error_updates) {
                if(error_updates) {
                    req.error = error_updates
                }
                return next()
            })
        })
    })(req, res, next)
}

//  Log out
module.exports.logout = function(req, res, next) {
    req.logout()
    next()
}

//  Auth strategy, coming from passport.js
module.exports.localAuth = function(email, password, done) {
    Query("SELECT * FROM users WHERE email = ?", [email])
     .then(function(users) {

        var user = users[0][0] || null
        //  Not found
        if(!user) {
            return done(Errores.USUARIO_NO_VALIDO)
        }
        //  Incorrect password
        if(user.password != crypt.backend(email + password)) {
            return done(Errores.PASSWORD_INCORRECTO)
        }
        //  Disabled user
        if(user.disabled != 0) {
            return done(Errores.USUARIO_BLOQUEADO)
        }

        return done(null, user)

    })
    .catch(function(error){
        return done(error)
    })
}

//  Serielize user
module.exports.serializeUser = function(user, done) {
    done(null, user.idUser)
}
//  Deserialize user
module.exports.deserializeUser = function(id, done) {
    Query("SELECT idUser AS id, email, name AS name FROM users WHERE idUser = ?", [id])
    .then(function(users) {

        var user = users[0][0] || null

        if (user) {
            //  Get groups
            Query('SELECT g.group FROM `groups` g INNER JOIN user_groups u ON u.idGroup = g.idGroup WHERE u.idUser = ?', [user.id])
            .then(function(groups) {
                user.groups = []
                for(var i in groups[0]){
                    user.groups.push(groups[0][i].group)
                }
                done(null, user)
            })
            .catch(function(error) {
                done(error) 
            })
        }
        else {
            done(Errores.USUARIO_NO_VALIDO)
        }
    })
    .catch(function(error) {
        done(error)
    })
}