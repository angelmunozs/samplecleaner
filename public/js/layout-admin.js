$(document).ready(function() {
	$('.btn-logout').click(function () {
		$.post("/api/logout", {})
		.done(function (data) {
			window.location.href = '/admin'
		})
	})
	$('.modal-link').click(function () {
		$('#modal-generic h2').html($(this).attr('data-title'))
		$('#modal-generic .modal-body').html($(this).attr('data-body'))
	})
})