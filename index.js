module.exports = init

var readFile = require('fs').readFile
var url = require('url')

var moduleMatcher = /(\.min)?\.js$/

function init(path, opts, require) {
	if(!require) {
		require = opts
		opts = {}
	}

	if(path.substr(-1) == '/') path = path.substring(0, path.length-1)
	if(path[0] != '/') path = '/' + path
	var paramMatcher = new RegExp(path + '/([^/]+)')
	return function(req, res, next) {
		if(req.method != 'GET' && req.method != 'HEAD') return next()
		var requestedPath = url.parse(req.originalUrl).pathname
		if(requestedPath.indexOf(path) !== 0) return next()
		var param = requestedPath.match(paramMatcher)
		if(!param) return next()

		var file = param[1]
		var moduleName = file.replace(moduleMatcher, '')
		if(opts.paths && opts.paths[moduleName]) {
			moduleName = opts.paths[moduleName]
		}

		var modulePath = require.resolve(moduleName)

		readFile(modulePath, 'utf8', function(err, content) {
			if(err) return res.send(404)

			if(content[0] == '#') {
				content = '//' + content
			}
			res.set('content-type', 'application/javascript; charset=UTF-8')
			res.send(200, content)
		})
	}
}
