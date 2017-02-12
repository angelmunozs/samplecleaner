var nodemailer 	= require('nodemailer')
var Sequelize 	= require('sequelize')
var async 		= require('async')
var util 		= require('util')
var path 		= require('path')
var fs 			= require('fs')
var config 		= require('./config')
var date 		= require('./tools/dates')

//	=============================================================================================================================
//	Parameters
//	=============================================================================================================================

//	Receivers
var receivers 	= [{email: 'angel.munoz.sagaseta@gmail.com', name: 'Ángel'}]
//	Sender
var from 		= 'Recordatorios huerto'

//	=============================================================================================================================
//	End parameters
//	=============================================================================================================================

//	Load Sequelize
var DB = new Sequelize('huerto', config.DB_USER, config.DB_PASS, {
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

var getNotifications = function (cb) {

	var sql = 	'SELECT n.id_notification, p.name AS planta, m.message, n.comments, n.date_from, n.active, i.url AS image_url ' +
	'FROM plants p ' +
	'INNER JOIN notifications n ON n.id_plant = p.id_plant ' +
	'INNER JOIN messages m ON m.id_message = n.id_message ' +
	'LEFT JOIN images i ON i.id_image = n.id_plant ' +
	'WHERE n.active = 1 ' +
	'AND n.date_from < ? ' +
	'ORDER BY n.date_from ASC'

	Query(sql, [date.toMysql(new Date())])
	.then(function (rows) {
		notifications = rows[0]
		cb(null, notifications)
	})
	.catch(cb)
}

var sendEmail = function (notifications, cb) {

	if(notifications.length) {

		var subject = buildEmailSubject(notifications)
		var html = buildEmailBody(notifications)
		var text = ''

		console.log(subject + '\n\n')
		console.log(html)
		cb()

		async.each(receivers, function(receiver, cb1) {
			var mailOptions = {
				from 		: from,
				subject 	: subject,
				text 		: text,
				html 		: html,
				to 			: receiver.email
			}
			//	Send the e-mail
			transporter.sendMail(mailOptions, function (error, info) {
				if(error) {
					cb1(error)
				}
				console.log('Message sent to ' + receiver.email + ' (%d of %d)', ++count, notifications.length)
				cb1()
			})
		}, cb)
	} else {
		cb('No se han encontrado notificaciones')
	}
}

var buildEmailSubject = function(notifications) {
	var subject = 'Mi huerto: hoy toca '
	for(var i in notifications) {
		var notification = notifications[i]
		subject += notification.message.toLowerCase() + ' ' + notification.planta.toLowerCase() + (i == notifications.length - 1 ? '' : ', ')
	}
	return subject
}

var buildEmailBody = function(notifications) {
	var date_now = date.toMysql(new Date())

	var html = '' +
	'<!DOCTYPE html>' +
	'<html style="margin-top: 0px; margin-bottom: 0px; margin-left: 0px; margin-right: 0px;">' +
	'<head>' +
	'	<meta charset="UTF-8">' +
	'	<title></title>' +
	'</head>' +
	'<body style="margin-top: 0px; margin-bottom: 0px; margin-left: 0px; margin-right: 0px; padding-top: 20px; font-family: Helvetica;">' +
	'	<!-- Container -->' +
	'	<div style="width: 500px; margin-left: auto; margin-right: auto; margin-top: 0px; margin-bottom: 0px; padding-top: 18px; padding-bottom: 18px; padding-left: 18px; padding-right: 18px; border: 1px solid #ccc; text-align: left;">' +
	'		<!-- Header -->' +
	'		<div style="width: 100%; padding-top: 0px; padding-bottom: 0px; padding-left: 0px; padding-right: 0px; margin-bottom: 10px;">' +
	'			<img src="http://www.agromatica.es/wp-content/uploads/2016/08/El-huerto-en-agosto-750x300.jpg" alt="Mi huerto" title="Mi huerto" style="max-width: 100%;">' +
	'		</div><!-- /Header -->' +
	'		<!-- Titulo -->' +
	'		<div style="padding-top: 0px; padding-bottom: 0px; padding-left: 0px; padding-right: 0px; margin-bottom: 20px;">' +
	'			<h3 style="color: rgb(134,60,67); font-size: 19px; margin-bottom: 0px; margin-top: 0px; border-bottom: 2px solid rgb(134,60,67);">Recordatorios de mi huerto <span style="padding-left: 4px; font-size: 10px; font-family: Arial; color: #333">' + date_now.split(' ')[0] + '</span></h3>' +
	'		</div><!-- /Titulo -->' +
	'		<!-- Cuerpo -->' +
	'		<div style="padding-top: 0px; padding-bottom: 0px; padding-left: 10px; padding-right: 10px; margin-bottom: 10px; font-size: 14px;">' +
	'			<table width="100%" cellspacing="0px" cellpadding="5px">' +
	'				<tr>' +
	'					<th width="100px" style="border-bottom: 1px solid #ccc; text-align: center;">Planta</th>' +
	'					<th style="border-bottom: 1px solid #ccc; text-align: center;">Tienes que...</th>' +
	'					<th style="border-bottom: 1px solid #ccc; text-align: center;">Desde</th>' +
	'					<th style="border-bottom: 1px solid #ccc; text-align: center;">Marcar como...</th>' +
	'				</tr>'

	for(var i in notifications) {
		var notification = notifications[i]

		html += '' +
		'				<tr>' +
		'					<td width="100px" valign="middle" style="border-bottom: 1px solid #ccc; text-align: center;">' +
		'						<img src="' + (notification.image_url || '') + '" title="' + (notification.planta || '') + '" alt="' + (notification.planta || '') + '" style="max-width: 100px;">' +
		'					</td>' +
		'					<td valign="middle" style="border-bottom: 1px solid #ccc; font-weight: bold; text-align: center;">' +
		'						<div style="font-weight: bold;">' + (notification.message || '') + '</div>' +
		'						<div style="font-size: 10px; color: #333; width: 150px; margin-top: 8px;">' + (notification.comments || '') + '</div>' +
		'					</td>' +
		'					<td valign="middle" style="border-bottom: 1px solid #ccc; text-align: center;">' +
		'						' + (notification.date_from.split(' ')[0] || '') + 
		'					</td>' +
		'					<td valign="middle" style="border-bottom: 1px solid #ccc; text-align: center;">' +
		'						<a href="' + path.join(config.DOMAIN, 'huerto', 'hecho', notification.id_notification.toString()) + '" style="padding-top: 9px; padding-bottom: 9px; padding-left: 17px; padding-right: 17px; background-color: rgb(134,60,67); color: white; text-decoration: none;">Hecho</a>' +
		'					</td>' +
		'				</tr>'
	}

	html += '' +
	'			</table>' +
	'		</div><!-- /Cuerpo -->' +
	'		<!-- Footer -->' +
	'		<div style="padding-top: 0px; padding-bottom: 0px; padding-left: 0px; padding-right: 0px; margin-bottom: 20px; font-size: 13px; color: #888;">' +
	'			* Mensaje enviado automáticamente desde http://samplecleaner.com' +
	'		</div><!-- /Footer -->' +
	'	</div><!-- /Container -->' +
	'</body>' +
	'</html>'
	
	return html
}

var main = function() {
	async.waterfall([getNotifications, sendEmail], function (error) {
		if(error) {
			console.log(error)
		}
	})
}

main()