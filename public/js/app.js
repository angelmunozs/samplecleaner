//	File to deal with
var file = ''

//	Validate an e-mail
var validateEmail = function (email) {
	return  /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(email)
}

$(document).ready(function() {
	//	Get main nav height
	var navHeight = parseInt($('#nav').css('height'));
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
	$('.menu-link').click(function (e) {
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
			});
		});
	})
	//	Main functionality
	//	Step 1
	$('#dirty').on('change', function () {
		file = $('#dirty').val()
		$('#file-name').html(file)
		//	Step 2
		if(file && file.length) {
			//	Update active step title
			$('.step-header').removeClass('active')
			$('#step2-header').addClass('active')
			//	Change section
			$('#step1').hide()
			$('#step2').show()
			//	Populate select box
			var options = ''
			$.get('/api/noise/profiles', function (data) {
				console.log(data)
				for(var i in data) {
					for(var j in data[i]) {
						for(var k in data[i][j]) {
							var value = j + ' - ' + data[i][j][k]
							options += '<option value="' + value + '">' + value + '</option>'
						}
					}
				}
				$('#noise-type').html(options)
			})
		}
	})
	//	'Send' button from section 'Contact'
	$('#contact-button').on('click', function () {
		//	First, disable button
		$('#contact-button').attr('disabled', 'disabled')
		$('#contact-button').html('<i class="fa fa-spinner fa-spin"></i>')
		var contact = {
			email : $('#contact-email').val(),
			message : $('#contact-message').val().replace(/\n/gi, '<br>')
		}
		if(validateEmail(contact.email) && contact.message.length > 4) {
			$.post("/api/contact", {
				email : contact.email,
				message : contact.message
			})
			.done(function(data) {
				if(data.error) {
					$('#error-msg').css('color', '#ff0000');
					$('#error-msg').html(data.error);
					//	Re-enable button
					$('#contact-button').removeAttr('disabled')
					$('#contact-button').html('Send')
				}
				else {				
					$('#error-msg').css('color', '#58FA58');
					$('#error-msg').html('Succesfully sent. We will answer you as soon as possible.');
					//	Reset values to avoid multiple equal emails
					$('#contact-email').val('');
					$('#contact-message').val('');
					//	Re-enable button
					$('#contact-button').removeAttr('disabled')
					$('#contact-button').html('Send')
				}
			})
			.fail(function(data) {
				$('#error-msg').css('color', '#ff0000');
				$('#error-msg').html('Something went wrong. please, try again later.');
				//	Re-enable button
				$('#contact-button').removeAttr('disabled')
				$('#contact-button').html('Send')
			})
		}
		else {
			$('#error-msg').css('color', '#ff0000');
			$('#error-msg').html('Please, provide a valid e-mail address and write a message.');
			//	Re-enable button
			$('#contact-button').removeAttr('disabled')
			$('#contact-button').html('Send')
		}
	})
	//	'Join mailing list' button from section 'Footer'
	$('#list-button').on('click', function () {
		//	First, disable button
		$('#list-button').attr('disabled', 'disabled')

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
			.fail(function(data) {
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
	})
})