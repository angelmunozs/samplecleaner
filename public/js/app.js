$(document).ready(function() {
	$('#dirty').on('change', function() {
		file = $('#dirty').val()
		$('#file-name').html(file)
	})
})