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
    describe 'pattern matching',->
        it 'match patterns',->
            r=new Router {
                patterns:
                    ':id': /^[-_a-zA-Z0-9]+$/
            }
            r.add '/foo/:id', 'idtop'
            r.add '/foo/:id/new', 'idnew'
            r.add '/foo/:id/del', 'iddel'
            r.add '/foo/$$$$$', 'dollar'

            assert.equal r.route('/foo/bar'),'idtop'
            assert.equal r.route('/foo/123/new'), 'idnew'
            assert.equal r.route('/foo/__t__/foo'), undefined
            assert.equal r.route('/foo/aaaaa/del'),'iddel'
            assert.equal r.route('/foo/$$$$$/'), 'dollar'
        describe 'matching order',->
            it 'pattern 1',->
                r=new Router {
                    patterns:
                        ':id': /^[-_a-zA-Z0-9]+$/
                }
                r.add '/foo/bar/baz', 'baz'
                r.add '/foo/hoge', 'hoge'
                r.add '/foo/:id', 'id'
                r.add '/foo/:id/new', 'idnew'

                assert.equal r.route('/foo/bar/baz'),'baz'
                assert.equal r.route('/foo/hoge'), 'hoge'
                assert.equal r.route('/foo/piyo'), 'id'
                assert.equal r.route('/foo/piyo/new'), 'idnew'
                assert.equal r.route('/foo/bar'), 'id'
                assert.equal r.route('/foo/bar/new'), 'idnew'

            it 'pattern 2',->
                r=new Router {
                    patterns:
                        ':id': /^[-_a-zA-Z0-9]+$/
                }
                r.add '/foo/:id', 'id'
                r.add '/foo/:id/new', 'idnew'
                r.add '/foo/bar/baz', 'baz'
                r.add '/foo/hoge', 'hoge'

                assert.equal r.route('/foo/bar/baz'),'baz'
                assert.equal r.route('/foo/hoge'), 'id'
                assert.equal r.route('/foo/piyo'), 'id'
                assert.equal r.route('/foo/piyo/new'), 'idnew'
                assert.equal r.route('/foo/bar'), 'id'
                assert.equal r.route('/foo/bar/new'), 'idnew'

        it 'multiple patterns',->
            r=new Router {
                patterns:
                    ':id': /^[-_a-zA-Z0-9]+$/
                    ':num': /^\d+$/
            }

            r.add '/foo/:id', 'idtop'
            r.add '/foo/:id/:num', 'idnum'
            r.add '/foo/:id/bar', 'idbar'
            r.add '/foo/:num/baz', 'numbaz'
            r.add '/foo/:num/:id', 'numid'

            assert.equal r.route('/foo/bar'),'idtop'
            assert.equal r.route('/foo/bar/3'),'idnum'
            assert.equal r.route('/foo/bar/bar'),'idbar'
            assert.equal r.route('/foo/bar/baz'),undefined
            assert.equal r.route('/foo/50/bar'),'idbar'
            assert.equal r.route('/foo/50/baz'),'numbaz'
            assert.equal r.route('/foo/50/hoge'),'numid'
