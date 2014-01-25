describe('module.js', function() {
	var module = require('../index')
	var fakeRequire

	beforeEach(function() {
		fzkes.reset()

		fakeRequire =
			{ resolve: fzkes.fake('require.resolve')
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
			middleware = module('/a/b', fakeRequire)
		})
		it('should return a middleware function', function() {
			middleware.should.be.a('function')
			middleware.should.have.length(3)
		})
	})
})
