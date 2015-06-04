assert = require 'assert'

Router = require('../lib/index').default

describe 'Router',->
    describe 'undefined path',->
        it 'returns undefined',->
            r=new Router
            assert.strictEqual r.route('/foo/bar'),undefined
    describe 'basic functionality',->
        it 'add & get',->
            r=new Router
            r.add '/foo/bar','foobar'
            r.add '/foo','foo'
            r.add '/foo/baz','foobaz'
            r.add '/hoge','hoge'
            r.add '/','root'
            assert.equal r.route('/'),'root'
            assert.equal r.route('/foo/bar'),'foobar'
            assert.equal r.route('/foo/'),'foo'
            assert.equal r.route('/foo/baz/'),'foobaz'
            assert.equal r.route('/hoge'),'hoge'
