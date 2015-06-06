assert = require 'assert'

Router = require('../lib/index').default

describe 'Router',->
    describe 'undefined path',->
        it 'returns null',->
            r=new Router
            assert.strictEqual r.route('/foo/bar'),null
    describe 'basic functionality',->
        it 'add & get',->
            r=new Router
            r.add '/foo/bar','foobar'
            r.add '/foo','foo'
            r.add '/foo/baz','foobaz'
            r.add '/hoge','hoge'
            r.add '/','root'
            assert.deepEqual r.route('/'),{params:{},result:'root'}
            assert.deepEqual r.route('/foo/bar'),{params:{},result:'foobar'}
            assert.deepEqual r.route('/foo/'),{params:{},result:'foo'}
            assert.deepEqual r.route('/foo/baz/'),{params:{},result:'foobaz'}
            assert.deepEqual r.route('/hoge'),{params:{},result:'hoge'}
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

            assert.deepEqual r.route('/foo/bar'),{params:{':id':'bar'},result:'idtop'}
            assert.deepEqual r.route('/foo/123/new'),{params:{':id':'123'},result:'idnew'}
            assert.strictEqual r.route('/foo/__t__/foo'), null
            assert.deepEqual r.route('/foo/aaaaa/del'),{params:{':id':'aaaaa'},result:'iddel'}
            assert.deepEqual r.route('/foo/$$$$$/'), {params:{},result:'dollar'}

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

                assert.deepEqual r.route('/foo/bar/baz'),{params:{},result:'baz'}
                assert.deepEqual r.route('/foo/hoge'), {params:{},result:'hoge'}
                assert.deepEqual r.route('/foo/piyo'), {params:{':id':'piyo'},result:'id'}
                assert.deepEqual r.route('/foo/piyo/new'), {params:{':id':'piyo'},result:'idnew'}
                assert.deepEqual r.route('/foo/bar'), {params:{':id':'bar'},result:'id'}
                assert.deepEqual r.route('/foo/bar/new'), {params:{':id':'bar'},result:'idnew'}

            it 'pattern 2',->
                r=new Router {
                    patterns:
                        ':id': /^[-_a-zA-Z0-9]+$/
                }
                r.add '/foo/:id', 'id'
                r.add '/foo/:id/new', 'idnew'
                r.add '/foo/bar/baz', 'baz'
                r.add '/foo/hoge', 'hoge'

                assert.deepEqual r.route('/foo/bar/baz'),{params:{},result:'baz'}
                assert.deepEqual r.route('/foo/hoge'), {params:{':id':'hoge'},result:'id'}
                assert.equal r.route('/foo/hoge/baz'), null
                assert.deepEqual r.route('/foo/piyo'), {params:{':id':'piyo'},result:'id'}
                assert.deepEqual r.route('/foo/piyo/new'), {params:{':id':'piyo'},result:'idnew'}
                assert.deepEqual r.route('/foo/bar'), {params:{':id':'bar'},result:'id'}
                assert.deepEqual r.route('/foo/bar/new'), {params:{':id':'bar'},result:'idnew'}

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

            assert.deepEqual r.route('/foo/bar'),{params:{':id':'bar'},result:'idtop'}
            assert.deepEqual r.route('/foo/bar/3'),{params:{':id':'bar',':num':'3'},result:'idnum'}
            assert.deepEqual r.route('/foo/bar/bar'),{params:{':id':'bar'},result:'idbar'}
            assert.equal r.route('/foo/bar/baz'),undefined
            assert.deepEqual r.route('/foo/50/bar'),{params:{':id':'50'},result:'idbar'}
            assert.deepEqual r.route('/foo/50/baz'),{params:{':num':'50'},result:'numbaz'}
            assert.deepEqual r.route('/foo/50/hoge'),{params:{':num':'50',':id':'hoge'},result:'numid'}
