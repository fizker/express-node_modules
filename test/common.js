global.chai = require('chai')
global.expect = chai.expect
chai.should()

global.fzkes = require('fzkes')
chai.use(fzkes)

fzkes.fake(require('fs'), 'readFile')
