var nodemailer 	= require('nodemailer')
var Sequelize 	= require('sequelize')
var async 		= require('async')
var util 		= require('util')
var path 		= require('path')
var fs 			= require('fs')
var config 		= require('../config')

//	=============================================================================================================================
//	Parameters
//	=============================================================================================================================

//	Sender
var from 	= 'Sample Cleaner'
//	Subject
var subject = 'Welcome to Sample Cleaner!'
//	Message
var text 	= 'We are proud to announce that Sample Cleaner will start working in early 2016.'
//	HTML-formatted message
var html 	= fs.readFileSync(path.join(__dirname, '../email/template.html'), 'utf8')

//	=============================================================================================================================
//	End parameters
//	=============================================================================================================================

//	Load Sequelize
var DB = new Sequelize(config.DB_NAME, config.DB_USER, config.DB_PASS, {
	dialect: config.DB_DIALECT,
	logging: console.log
})
var Query = function (sql, params) {
	return DB.query(sql, null, {raw: true,  replacements: params})
}

//	load nodemailer
var transporter = nodemailer.createTransport({
		service : config.EMAIL_SERVICE,
		auth : {
			user : config.EMAIL_USER,
			pass : config.EMAIL_PASS
		}
	})

var findEmails = function (cb) {

	Query('SELECT * FROM mailing_list WHERE disabled = 0', [])
	.then(function (rows) {

		users = rows[0]
		cb(null, users)
	})
	.catch(cb)
}

var sendEmails = function (users, cb) {

	var count = 0

	async.each(users, function(user, cb1) {
		var mailOptions = {
			from 		: from,
			subject 	: subject,
			text 		: text,
			html 		: html
		}
		//	Specify the receiver
		mailOptions.to = user.email
		//	Generate token link
		mailOptions.html = util.format(mailOptions.html, text, config.DOMAIN + '/api/list/quit/' + user.email + '/' + user.token)
		//	Send the e-mail
		transporter.sendMail(mailOptions, function (error, info) {
			if(error) {
				cb1(error)
			}
			console.log('Message sent to ' + user.email + ' (%d of %d)', ++count, users.length)
			cb1()
		})
	}, cb)
}

var main = function() {
	async.waterfall([findEmails, sendEmails], function (error) {
		if(error) {
			console.log(error)
		}
	})
}

main()