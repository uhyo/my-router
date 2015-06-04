# pathutil test
assert = require 'assert'

pathutil = require '../lib/pathutil'

describe 'pathutil',->
    describe 'split',->
        it 'standard functionality',->
            assert.deepEqual pathutil.split('/foo/bar'),['foo','bar']
            assert.deepEqual pathutil.split('/3!!!!"#Ya$)JあaR\ud800\udec0/bar baz'),['3!!!!"#Ya$)JあaR\ud800\udec0','bar baz']
        it 'no prefix slash',->
            assert.deepEqual pathutil.split('foo/bar'),['foo','bar']
            assert.deepEqual pathutil.split('bar'),['bar']
        it 'no suffix slash',->
            assert.deepEqual pathutil.split('/foo/bar/'),['foo','bar']
            assert.deepEqual pathutil.split('bar/'),['bar']
        it 'duplicate slashes',->
            assert.deepEqual pathutil.split('//foo/bar/baz'),['foo','bar','baz']
            assert.deepEqual pathutil.split('///foo//bar/baz'),['foo','bar','baz']
            assert.deepEqual pathutil.split('/foo//bar//baz/////'),['foo','bar','baz']
