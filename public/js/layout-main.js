//	File data
var file, name, size, type = ''
//	Name of clean song
var clean = ''
var allowedTypes = ['audio/x-wav', 'audio/wav', 'audio/vnd.wav', 'audio/mpeg']
//	Timed events
var hideErrorMsg, hideStatusIcon

//	Validate an e-mail
var validateEmail = function (email) {
	return  /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(email)
}

$(document).ready(function() {
	//	Get main nav height
	var navHeight = parseInt($('#nav').css('height'));
	//	Set checkbox unchecked
	$('#advanced-settings').attr('checked', false)
	//	Enable tooltips
	$(document).ready(function(){
		$('[data-toggle="tooltip"]').tooltip()
	})
	//	Muestra el mensaje de las cookies si no se ha aceptado ya
	if(!localStorage.cookiesAccepted) {
		$('#cookie-message').fadeIn()
	}
	$('.accept-cookies').on('click', function () {
		console.log('Cookie policy accepted')
		localStorage.cookiesAccepted = true
		$('#cookie-message').fadeOut()
	})
	//	Positions of page sections
	var positions = [
		{
			section : 'cleaner',
			offset : $('#section-cleaner').offset().top - navHeight - 1
		},
		{
			section : 'howitworks',
			offset : $('#section-howitworks').offset().top - navHeight - 1
		},
		{
			section : 'contact',
			offset : $('#section-contact').offset().top - navHeight - 1
		},
		{
			section : '',
			offset : $(document).height()
		}
	]
	//	Change section of page depending on the offset
	var changeSection = function(offset) {
		//	Take actual position
		var actualPos = $(document).scrollTop()
		if(actualPos < positions[0].offset) {
			$(".navbar-nav li.active").removeClass("active")
		}
		//	Check intervals
		for(var i = 0; i < positions.length - 1; i++) {
			if(actualPos >= positions[i].offset && actualPos < positions[i + 1].offset) {
				$(".navbar-nav li.active").removeClass("active")
				$('#section-' + positions[i].section + '-li').addClass('active')
				window.location.hash = '#' + positions[i].section
				return true
			}
		}
	}
	//	Actualización de link pulsado conforme se desciende por la página
	$(document).on('scroll', function() {
		return changeSection(navHeight)
	})
	//	Menu links
	$('.menu-link').off('click').click(function (e) {
		//	Prevent default behavior
		e.preventDefault()
		//	Deactivate scrolling
		$(document).off("scroll")
		//	Update element with class 'active'
		$(".navbar-nav li.active").removeClass("active")
		$(this).parent().addClass('active')
		//	Locate target
		var target = $(this).attr('href')
		var target_clean = target.split('-')[1]
		//	Animate scrolling
		$('html, body').stop().animate({
			'scrollTop': $(target).offset().top - navHeight
		}, 400, 'swing', function() {
			//	Update hash
			window.location.hash = target_clean
			//	Reactivate scrolling
			$(document).on('scroll', function() {
				return changeSection(navHeight)
			})
		})
	})
	//	File selected with input
	$(':file').change(function () {
		file = this.files[0]
		var fileReader = new FileReader()

		fileReader.onload = (function(file) {
			name = file.name
			size = file.size
			type = file.type
			section1()		
		})(file)

		fileReader.readAsDataURL(file)
	})
	//	File dragging
	$.event.props.push('dataTransfer')
	$('#step1').on({
		dragenter: function(event) {
			event.stopPropagation()
			event.preventDefault()
			$('#step1').css('background-color', '#e9e9e9')
		},
		dragleave: function(event) {
			event.stopPropagation()
			event.preventDefault()
			$('#step1').css('background-color', '#fff')
		},
		drop: function(event) {
			event.stopPropagation()
			event.preventDefault()
			console.log('Dropped!')
			$('#step1').css('background-color', '#fff')

			file = event.dataTransfer.files[0]
			var fileReader = new FileReader()

			fileReader.onload = (function(file) {
				name = file.name
				size = file.size
				type = file.type
				section1()	
			})(file)

			fileReader.readAsDataURL(file)
		}
	})	
	//	'Send' button from section 'Contact'
	$('#contact-button').on('click', function () {
		//	First, disable button
		$('#contact-button').attr('disabled', 'disabled')
		$('#contact-button').html('<i class="fa fa-spinner fa-spin"></i>')
		//	Then, clear timeout
		clearTimeout(hideErrorMsg)

		var contact = {
			email : $('#contact-email').val(),
			message : $('#contact-message').val().replace(/\n/gi, '<br>')
		}
		if(validateEmail(contact.email) && contact.message.length > 4) {
			$.post("/api/contact", {
				email : contact.email,
				message : contact.message
			})
			.done(function (data) {
				if(data.error) {
					$('#error-msg').css('color', '#ff0000')
					$('#error-msg').html(data.error)
					//	Re-enable button
					$('#contact-button').removeAttr('disabled')
					$('#contact-button').html('Send')
				}
				else {				
					$('#error-msg').css('color', '#58FA58')
					$('#error-msg').html('Succesfully sent. We will answer you as soon as possible.')
					//	Reset values to avoid multiple equal emails
					$('#contact-email').val('')
					$('#contact-message').val('')
					//	Re-enable button
					$('#contact-button').removeAttr('disabled')
					$('#contact-button').html('Send')
				}
			})
			.fail(function () {
				$('#error-msg').css('color', '#ff0000')
				$('#error-msg').html('Something went wrong. please, try again later.')
				//	Re-enable button
				$('#contact-button').removeAttr('disabled')
				$('#contact-button').html('Send')
			})
		}
		else {
			$('#error-msg').css('color', '#ff0000')
			$('#error-msg').html('Please, provide a valid e-mail address and write a message.')
			//	Re-enable button
			$('#contact-button').removeAttr('disabled')
			$('#contact-button').html('Send')
		}
		hideErrorMsg = setTimeout(function () {
			$('#error-msg').html('')
		}, 10000)
	})
	//	'Join mailing list' button from section 'Footer'
	$('#list-button').on('click', function () {
		//	First, disable button
		$('#list-button').attr('disabled', 'disabled')
		//	Then, clear timeout
		$('#status-icon').show()
		clearTimeout(hideStatusIcon)

		var email = $('#list-email').val()

		if(validateEmail(email)) {
			$.post("/api/list/enter", {
				email : email
			})
			.done(function(data) {
				if(data.error) {
					$('#status-icon').css('color', '#999')
					$('#status-icon').html('<i class="fa fa-times"></i>')
					//	Re-enable button
					$('#list-button').removeAttr('disabled')
				}
				else {
					$('#status-icon').css('color', '#58FA58')	
					$('#status-icon').html('<i class="fa fa-check"></i>')
					//	Reset values to avoid multiple equal emails
					$('#list-email').val('')
					//	Re-enable button
					$('#list-button').removeAttr('disabled')
				}
			})
			.fail(function () {
				$('#status-icon').css('color', '#999')
				$('#status-icon').html('<i class="fa fa-times"></i>')
				//	Re-enable button
				$('#list-button').removeAttr('disabled')
			})
		}
		else {
			$('#status-icon').css('color', '#999')
			$('#status-icon').html('<i class="fa fa-times"></i>')
			//	Re-enable button
			$('#list-button').removeAttr('disabled')
		}
		hideStatusIcon = setTimeout(function () {
			$('#status-icon').fadeOut('slow')
		}, 2000)
	})
	$('#step4-tip1').off('click').click(function () {
		//	Reset input type 'file'
		$('#file').replaceWith($('#file').val('').clone(true))
		//	Reset values
		file = ''
		name = ''
		size = ''
		type = ''
		$('#file-name').html(name)
		//	Reset roundSliders
		$("#noise-year").roundSlider('setValue', 90)
		$("#noise-profile").roundSlider('setValue', 1)
		$('#reduce-gain').roundSlider('setValue', 20)
		$('#smoothing-bands').roundSlider('setValue', 2)
		//	Disable roundSliders
		$("#noise-year").roundSlider('disable')
		$("#noise-profile").roundSlider('disable')
		$('#reduce-gain').roundSlider('disable')
		$('#smoothing-bands').roundSlider('disable')
		//	Disable 'Clean it!' button
		$('#go').attr('disabled', 'disabled')
		//	Reset audio player
		$('#player').html('')
		$('#player').removeAttr('src')
		//	Reset sliders info
		$('#year-desc').html('')
		$('#profile-desc').html('')
		//	Uncheck advanced settings
		$("#advanced-settings").attr("checked", false);
		//	Update active step title
		$('.step-header').removeClass('active')
		$('#step1-header').addClass('active')
		//	Change section
		$('.step-container').hide()
		$('#step1').show()
		section1()
	})
	$('#modal-button').on('click', function () {
		//	First, disable button
		$('#modal-button').attr('disabled', 'disabled')
		$('#modal-button').html('<i class="fa fa-spinner fa-spin"></i>')

		var message = $('#modal-message').val().replace(/\n/gi, '<br>')

		if(message.length > 4) {
			//	Build definitive message
			message = '<p><i>Cleaning failed: ID #' + clean.id + '</i></p><p>' + message + '</p>'
			//	Call the API
			$.post("/api/contact", {
				email : 'Anonymous',
				message : message
			})
			.done(function (data) {
				if(data.error) {
					$('#error-modal').css('color', '#ff0000')
					$('#error-modal').html(data.error)
					//	Re-enable button
					$('#modal-button').html('Send')
				}
				else {				
					$('#error-modal').css('color', '#58FA58')
					$('#error-modal').html('Succesfully sent. Thanks for collaborating!')
					//	Reset values to avoid multiple equal emails
					$('#modal-message').val('')
					//	Re-enable button
					$('#modal-button').html('Send')
				}
			})
			.fail(function () {
				$('#error-modal').css('color', '#ff0000')
				$('#error-modal').html('Something went wrong. please, try again later.')
				//	Re-enable button
				$('#modal-button').html('Send')
			})
		}
		else {
			$('#error-modal').css('color', '#ff0000')
			$('#error-modal').html('Please, write a message.')
			//	Re-enable button
			$('#modal-button').removeAttr('disabled')
			$('#modal-button').html('Send')
		}
	})

	//	Section 1 behavior
	var section1 = function () {
		//	Reset textarea value from modal
		$('#modal-message').val('')
		$('#error-modal').html('')
		//	Jump to next section
		if(name && size != 0 && allowedTypes.indexOf(type.toLowerCase()) != -1) {
			//	Call to next step
			section2()
		}
		else {
			if(name.length > 1) {
				$('#section-error-1').html(type + ' is not a supported audio file')
			}
		}
		return
	}
	//	Section 2 behavior
	var section2 = function () {
		//	Update active step title
		$('.step-header').removeClass('active')
		$('#step2-header').addClass('active')
		//	Change section
		$('.step-container').hide()
		$('#step2').show()
		//	File name
		$('#file-name').html(name)
		//	Populate select box
		var options = ''
		$.get('/api/noise/profiles')
		.done(function (data) {
			//	Get info from API
			var years = Object.keys(data.data)
			//	Default year selected
			var defaultValue = 90
			//	DOM elements
			var noiseYear = $("#noise-year")
			var noiseProfile = $("#noise-profile")
			var reduceGain = $('#reduce-gain')
			var smoothingBands = $('#smoothing-bands')
			//	Noise year
			noiseYear.roundSlider({
				min: Number(years[0]),
				max: Number(years[years.length - 1]),
				step: 10,
				value: defaultValue,
				sliderType: "min-range",
				handleShape: "square",
				handleSize: '16,8',
				radius: 55,
				width: 10,
				editableTooltip: false
			})
			//	Noise profile
			noiseProfile.roundSlider({
				min: 1,
				max: data.data[defaultValue].length,
				step: 1,
				value: 1,
				sliderType: "min-range",
				handleShape: "square",
				handleSize: '16,8',
				radius: 55,
				width: 10,
				editableTooltip: false
			})
			//	Re-enable roundSliders
			noiseYear.roundSlider('enable')
			noiseProfile.roundSlider('enable')
			//	Re-enable button
			$('#go').removeAttr('disabled')
			//	Retrieve data from sliders
			var year = noiseYear.roundSlider('getValue')
			var profile = noiseProfile.roundSlider('getValue')
			//	Player variables
			var audio_location = '/api/noise/wav/' + year + '/' + profile
			var player_html = 	'<source src="' + audio_location + '" type="audio/wav">Your browser does not support the audio element.'
			//	Reduce gain (advanced)
			reduceGain.roundSlider({
				min: 10,
				max: 40,
				step: 1,
				value: 20,
				sliderType: "min-range",
				handleShape: "square",
				handleSize: '12,6',
				width: 6,
				radius: 38,
				disabled: true,
				editableTooltip: false
			})
			//	Smoothing bands (advanced)
			smoothingBands.roundSlider({
				min: 0,
				max: 5,
				step: 1,
				value: 2,
				sliderType: "min-range",
				handleShape: "square",
				handleSize: '12,6',
				width: 6,
				radius: 38,
				disabled: true,
				editableTooltip: false
			})
			//	Audio player					
			$('#player').attr('src', audio_location)
			//	$('#player').html(player_html)
			//	APIs to get info
			$.get('/api/info/year/' + year)
			.done(function (info) {
				$('#year-desc').html(info.data)
			})
			$.get('/api/info/profile/' + year + '/' + profile)
			.done(function (info) {
				$('#profile-desc').html(info.data)
			})
			//	Change functionality
			noiseYear.change(function () {
				var year = noiseYear.roundSlider('getValue')
				var profile = 1 //	Always reset profile slider when year changes
				var audio_location = '/api/noise/wav/' + year + '/' + profile
				var player_html = 	'<source src="' + audio_location + '" type="audio/wav">Your browser does not support the audio element.'
				//	Audio player						
				$('#player').attr('src', audio_location)
				//	$('#player').html(player_html)
				//	Set profile value to 1
				noiseProfile.roundSlider({
					min: 1,
					max: data.data[year].length,
					step: 1,
					value: profile,
					sliderType: "min-range",
					handleShape: "square",
					handleSize: '16,8',
					radius: 55,
					width: 10,
					editableTooltip: false
				})
				//	Update year info
				$.get('/api/info/year/' + year)
				.done(function (info) {
					$('#year-desc').html(info.data)
				})
				//	Update profile info
				$.get('/api/info/profile/' + year + '/' + profile)
				.done(function (info) {
					$('#profile-desc').html(info.data)
				})
			})
			//	Change functionality
			noiseProfile.change(function () {
				var year = noiseYear.roundSlider('getValue')
				var profile = noiseProfile.roundSlider('getValue')
				var audio_location = '/api/noise/wav/' + year + '/' + profile
				var player_html = 	'<source src="' + audio_location + '" type="audio/wav">Your browser does not support the audio element.'
				//	Audio player						
				$('#player').attr('src', audio_location)
				//	$('#player').html(player_html)
				//	Update profile info
				$.get('/api/info/profile/' + year + '/' + profile)
				.done(function (info) {
					$('#profile-desc').html(info.data)
				})
			})
			//	Enable/disable advanced settings
			$('#advanced-settings').change(function () {
				if($(this).is(":checked")) {
					//	Color of the title
					$('.rslider-tip-advanced').css('color', '#555')
					//	Enable sliders
					reduceGain.roundSlider('enable')
					smoothingBands.roundSlider('enable')
				}
				else {
					//	Color of the title
					$('.rslider-tip-advanced').css('color', '#aaa')
					//	Reset values
					reduceGain.roundSlider('setValue', 20)
					smoothingBands.roundSlider('setValue', 2)
					//	Disable sliders
					reduceGain.roundSlider('disable')
					smoothingBands.roundSlider('disable')
				}
			})
			$('#go').off('click').click(function () {
				//	DOM elements
				var noiseYear = $("#noise-year")
				var noiseProfile = $("#noise-profile")
				var reduceGain = $('#reduce-gain')
				var smoothingBands = $('#smoothing-bands')
				
				//	Get values from roundSlider
				var noiseYear = noiseYear.roundSlider('getValue')
				var noiseProfile = noiseProfile.roundSlider('getValue')
				var reduceGain = reduceGain.roundSlider('getValue')
				var smoothingBands = smoothingBands.roundSlider('getValue')

				//	Some validation
				var validateNoiseYear = /[4-9]{1,1}[0]{1,1}/.test(noiseYear) // 40, 50, 60, 70, 80 or 90
				var validateNoiseProfile = /[1-9]{1,2}/.test(noiseProfile) // 1-19
				var validateReduceGain = Number(reduceGain) >= 10 && Number(reduceGain) <= 40 // 10-40
				var validateSmoothingBands = /[0-5]{1,1}/.test(smoothingBands) // 0-5

				//	Jump to next section
				if(validateNoiseYear && validateNoiseProfile && validateReduceGain && validateSmoothingBands) {
					//	Call to next step
					section3()
				}
				else {
					alert('Wrong fields')
				}
			})
		})
		return
	}
	//	Section 3 behavior
	var section3 = function () {
		//	Update active step title
		$('.step-header').removeClass('active')
		$('#step3-header').addClass('active')
		//	Change section
		$('.step-container').hide()
		$('#step3').show()
		//	Reset html
		$('#section-3-msg').html('We\'re working on it... This process takes about 12 seconds per minute of audio')
		$('#step3-icon').removeClass('fa-times')
		$('#step3-icon').addClass('fa-spinner')
		$('#step3-icon').addClass('fa-spin')
		$('#step3-tip').hide()
		$('#section-error-3').html('')
		//	Form data class
		var formData = new FormData()
		formData.append('file', file)
		//	DOM elements
		var noiseYear = $("#noise-year")
		var noiseProfile = $("#noise-profile")
		var reduceGain = $('#reduce-gain')
		var smoothingBands = $('#smoothing-bands')
		formData.append('noiseYear', noiseYear.roundSlider('getValue'))
		formData.append('noiseProfile', noiseProfile.roundSlider('getValue'))
		formData.append('reduceGain', reduceGain.roundSlider('getValue'))
		formData.append('smoothingBands', smoothingBands.roundSlider('getValue'))
		//	Wait for the server to return the file
		$.ajax({
			url : '/api/clean',
			type : 'POST',
			success : function (data) {
				if(data.error) {
					$('#section-error-3').html(data.error)
					$('#step3-tip').show()
					$('#section-3-msg').html('There was an error while processing your request')
					$('#step3-icon').removeClass('fa-spinner')
					$('#step3-icon').removeClass('fa-spin')
					$('#step3-icon').addClass('fa-times')
				}
				else {
					clean = data.data
					$('#section-3-msg').html('We\'re working on it... This process may take about 1-2 minutes')
					$('#step3-icon').removeClass('fa-times')
					$('#step3-icon').addClass('fa-spinner')
					$('#step3-icon').addClass('fa-spin')
					//	Call to next step
					section4()
				}
			},
			error : function (error) {
				console.log(error)
				$('#section-error-3').html('There was an error while processing your request. Please, try again later.')
			},
			data : formData,
			cache : false,
			contentType : false,
			processData : false
		})
		return
	}
	//	Section 4 behavior
	var section4 = function () {
		//	Update form action
		$('#download').attr('href', '/api/song/' + clean.id)
		$('#download').attr('download', clean.name)
		//	Enable button from modal
		$('#modal-button').removeAttr('disabled')
		//	Update active step title
		$('.step-header').removeClass('active')
		$('#step4-header').addClass('active')
		//	Change section
		$('.step-container').hide()
		$('#step4').show()
	}
})