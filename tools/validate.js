module.exports = {
	email : function (email) {
		return /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(email)
	},
	audio : function (type, extension) {
		var allowedTypes = ['audio/x-wav', 'audio/wav', 'audio/vnd.wav', 'audio/mpeg']
		var allowedExtensions = ['.wav', '.mp3']

		return (allowedExtensions.indexOf(extension) != -1 && allowedTypes.indexOf(type) != -1)
	}
}