describe('module.js', function() {
	var fs = require('fs')
	var module = require('../index')
	var fakeRequire

	beforeEach(function() {
		fzkes.reset()

		var resolve = fzkes.fake('require.resolve')
			.calls(function(moduleName) { return '/path/to/' + moduleName })

		fakeRequire =
			{ resolve: resolve
			}
	})

	it('should return a function', function() {
		module.should.be.a('function')
	})

	describe('When calling the module without arguments', function() {
		it('should throw', function() {
			(function() { module() }).should.throw(/path.+required/i)
		})
	})

	describe('When calling the module with only a path', function() {
		it('should throw', function() {
			(function() { module('/a/b') })
				.should.throw(/require.+required/i)
		})
	})

	describe('When calling the module with a path and a require', function() {
		var middleware
		beforeEach(function() {
			middleware = module('/a', fakeRequire)
		})
		it('should return a middleware function', function() {
			middleware.should.be.a('function')
			middleware.should.have.length(3)
		})

		describe('and the middleware gets a `GET` request', function() {
			var req
			var res
			var next
			beforeEach(function() {
				req =
					{ method: 'GET'
					}
				res =
					{ send: fzkes.fake('res.send')
					, set: fzkes.fake('res.set')
					}
				next = fzkes.fake('next')
			})

			describe('with a url with components matching the path', function() {
				beforeEach(function() {
					req.originalUrl = '/a/module/component'
					middleware(req, res, next)
				})
				it('should ask `require.resolve` for the module', function() {
					fakeRequire.resolve
						.should.have.been.calledWith('module/component')
				})
			})

			describe('with a matching url ending with `.js`', function() {
				beforeEach(function() {
					req.originalUrl = '/a/module.js'
					middleware(req, res, next)
				})
				it('should strip the extension before asking require', function() {
					fakeRequire.resolve
						.should.have.been.calledWith('module')
				})
			})

			describe('with a url matching the path', function() {
				beforeEach(function() {
					req.originalUrl = '/a/module'
					middleware(req, res, next)
				})
				it('should ask `require.resolve` for the module', function() {
					fakeRequire.resolve
						.should.have.been.calledWith('module')
				})
				it('should ask `fs.readFile` for the file', function() {
					fs.readFile
						.should.have.been.calledWith('/path/to/module')
				})

				describe('and `fs.readFile` returns a file', function() {
					beforeEach(function(done) {
						fs.readFile.callsArg(
							{ now: true
							, arguments:
							  [ null, 'content of file' ]
							, notify: done
							}
						)
					})
					it('should return the contents of the file', function() {
						res.send
							.should.have.been.calledWith(200, 'content of file')
					})
					it('should set `content-type` to `application/javascript`', function() {
						res.set
							.should.have.been.calledWith(
								'content-type',
								'application/javascript; charset=UTF-8'
							)
					})
				})

				describe('and require finds no module', function() {
					beforeEach(function() {
						fakeRequire.resolve.throws(new Error)
						middleware(req, res, next)
					})
					it('should send 404', function() {
						res.send
							.should.have.been.calledWith(404)
					})
					it('should not set any headers', function() {
						res.set
							.should.not.have.been.called
					})
				})
			})

			describe('with a url that does not match the path', function() {
				beforeEach(function() {
					req.originalUrl = '/abc'
					middleware(req, res, next)
				})
				it('should call the `next` function', function() {
					next.should.have.been.called
				})
				it('should not output anything', function() {
					res.send
						.should.not.have.been.called
					res.set
						.should.not.have.been.called
				})
			})
		})
	})

	describe('When calling the module with a path, a paths-option and a require', function() {
		var middleware
		beforeEach(function() {
			var paths =
				{ module: 'real-module'
				}
			middleware = module('/a', { paths: paths }, fakeRequire)
		})
		it('should return a middleware function', function() {
			middleware.should.be.a('function')
			middleware.should.have.length(3)
		})

		describe('and the middleware gets a `GET` request', function() {
			var req
			var res
			var next
			beforeEach(function() {
				req =
					{ method: 'GET'
					}
				res =
					{ send: fzkes.fake('res.send')
					, set: fzkes.fake('res.set')
					}
				next = fzkes.fake('next')
			})

			describe('with a matching url ending with `.js`', function() {
				beforeEach(function() {
					req.originalUrl = '/a/module.js'
					middleware(req, res, next)
				})
				it('should strip the extension before asking require', function() {
					fakeRequire.resolve
						.should.have.been.calledWith('real-module')
				})
			})

			describe('with a url where multiple components match the path', function() {
				beforeEach(function() {
					req.originalUrl = '/a/module/module'
					middleware(req, res, next)
				})
				it('should ask require for the right module', function() {
					fakeRequire.resolve
						.should.have.been.calledWith('real-module/module')
				})
			})

			describe('with a url with components matching the path', function() {
				beforeEach(function() {
					req.originalUrl = '/a/module/component'
					middleware(req, res, next)
				})
				it('should ask `require.resolve` for the module', function() {
					fakeRequire.resolve
						.should.have.been.calledWith('real-module/component')
				})
			})

			describe('with a url matching the path', function() {
				beforeEach(function() {
					req.originalUrl = '/a/module'
					middleware(req, res, next)
				})
				it('should ask `require.resolve` for the module', function() {
					fakeRequire.resolve
						.should.have.been.calledWith('real-module')
				})
			})
		})
	})
})
