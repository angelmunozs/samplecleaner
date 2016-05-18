$(document).ready(function() {
	$(function () {
		$('input').iCheck({
			checkboxClass: 'icheckbox_square-blue',
			radioClass: 'iradio_square-blue',
			increaseArea: '20%' // optional
		})
	})
	$('#login').click(function() {
		//	Reset error
		$('#error').addClass('hidden')
		// Parameters
		var email = $('#email').val()
		var password = $('#password').val()
		var redir = getUrlParameter('redir') || '/'
		//	Build frontend hash
		var hash = CryptoJS.SHA512(email + password).toString(CryptoJS.enc.Hex).substr(0, 30)
		//	Error control
		if(validateEmail(email) && password) {
			//	Assign new value
			$.post("/api/login", {
				email : email,
				password : hash
			})
			.done(function (data) {
				if(data.error) {
					$('#error').removeClass('hidden')
					$('#error').html(data.error)
				}
				else {
					console.log('Correct')
					window.location.href = redir
				}
			})
			.fail(function (jqXHR, textStatus, errorThrown) {
				$('#error').removeClass('hidden')
				$('#error').html(textStatus)
			})
		}
		else {
			$('#error').removeClass('hidden')
			$('#error').html('Missing parameters')
		}
	})
})
//	Get a param from URL
var getUrlParameter = function (sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=')

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1]
        }
    }
}
//	Validate an e-mail
var validateEmail = function (email) {
	return  /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(email)
}
