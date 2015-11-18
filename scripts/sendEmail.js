var nodemailer 	= require('nodemailer')
var Sequelize 	= require('sequelize')
var async 		= require('async')
var util 		= require('util')
var config 		= require('../config')

//	=============================================================================================================================
//	Parameters
//	=============================================================================================================================

//	Sender
var from 	= 	'Sample Cleaner'
//	Subject
var subject = 	'Welcome to Sample Cleaner!'
//	Message
var text 	= 	'We are proud to announce that Sample Cleaner will start working in early 2016.'
//	HTML-formatted message
var html 	= 	'<img id="logo" src="http://i.imgur.com/eWEE4zI.png" style="max-height: 33px;" alt="Sample Cleaner">' +
				'<hr style="display: block; height: 1px; border: 0; border-top: 1px solid #ddd; margin-top: 16px; margin-bottom: 16px; padding: 0px;">' +
				'<div style="font-family: Arial; font-size: 15px; color: #333">' +
					'<p>' +
						text +
					'</p>' +
				'</div>' +
				'<hr style="display: block; height: 1px; border: 0; border-top: 1px solid #ddd; margin-top: 16px; margin-bottom: 16px; padding: 0px;">' +
				'<div style="font-family:Arial; font-size: 15px;">' +
					'<p>' +
						'<a href="' + config.DOMAIN + '/list/quit/%s/%s" style="font-size: 13px; color: #777; font-style: italic; text-decoration: none">' +
							'Quit mailing list' +
						'</a>' +
					'</p>' +
				'</div>'

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
		mailOptions.html = util.format(mailOptions.html, user.email, user.token)
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