function validateContact (contact) {
	return  /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(contact.email) && contact.message.length > 1
}

$(document).ready(function() {
	//	Print selected file name
	$('#dirty').on('change', function () {
		file = $('#dirty').val()
		$('#file-name').html(file)
	})
	//	'Send' button from section 'Contact'
	$('#contact-button').on('click', function () {
		//	First, disable button
		$('#contact-button').attr('disabled', 'disabled')
		$('#contact-button').html('<i class="fa fa-spinner fa-spin"></i>')
		var contact = {
			email : $('#email').val(),
			message : $('#message').val()
		}
		if(validateContact(contact)) {
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
					$('#email').val('');
					$('#message').val('');
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
})