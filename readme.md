express-node_modules
====================

A simple handler for loading libraries from node_modules to clients

How to use
----------

Setting it up is easy:

	var module = require('express-node_modules')
	app.use(module('/lib', require))

From this point on, any url looking like `/lib/some-module` will attempt to load
`some-module` with the require-function that was handed in.
