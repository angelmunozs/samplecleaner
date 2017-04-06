var assert = require('chai').assert;

var assert200Err = function (error, response, body, cmp) {
	//	console.log('\tHTTP status: \t%s', response.statusCode)
	console.log('\tbody: \t%s', JSON.stringify(body))

	if(body instanceof String){
		body = JSON.parse(body)
	}

	assert.equal(response.statusCode, 200, 'should return HTTP 200 OK')
	if(cmp) {
		assert.equal(body.code, cmp.code, 'should return specific code')
		//	assert.equal(body.error, cmp.message, 'should return specific error message')
	}
	else {
		assert.equal(body.code, 1, 'should return code 1')
		assert.notEqual(body.error, null, 'should return code 1')
	}
}

var assert200OK = function (error, response, body) {
	//	console.log('\tHTTP status: \t%s', response.statusCode)
	console.log('\tbody: \t%s', JSON.stringify(body))

	if(body instanceof String){
		body = JSON.parse(body)
	}

	assert.notEqual(body, null, 'should not return empty body')
	assert.equal(response.statusCode, 200, 'should return HTTP 200 OK')
	assert.equal(body.code, 0, 'should return code 0')
	assert.equal(body.error, null, 'should return empty error message')
}

var api200OK = function (done) {
	return function (error, response, body) {
		assert200OK(error, response, body)
		done()
	}
}

var api200Err = function (done, msg) {
	return function (error, response, body) {
		assert200Err(error, response, body, msg)
		done()
	}
}

module.exports = {
	assert200Err : assert200Err,
	assert200OK : assert200OK,
	api200OK : api200OK,
	api200Err : api200Err
}