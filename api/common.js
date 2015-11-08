//  Requirements
var api = require('../api')

//  Generic API response
module.exports.generic = function(req, res) {
    if(req.error)
        return res.api.error(req.error)

    res.api.ok()
}

//	API response to get data
module.exports.data = function(req, res) {
    if(req.error)
        return res.api.error(req.error)

    res.api.ok(req.data)
}
