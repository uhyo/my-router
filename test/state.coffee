# state test
assert = require 'assert'

State = require('../lib/state').default

options1=
    patternPrefix: ':'
    patterns: {}

options2=
    patternPrefix: ':'
    patterns:
        ':id': /^[-_a-zA-Z0-9]+$/
        ':num': /^[\-\+]?\d+$/

describe 'State',->
    it 'endpoint mounting',->
        st=new State options1
        assert.equal st.has(), false
        st.mount 'foo'
        assert.equal st.has(), true
        assert.equal st.get(), 'foo'
        st.mount 'bar'
        assert.equal st.has(), true
        assert.equal st.get(), 'bar'
    describe 'static paths',->
        it 'matching',->
            st=new State options1
            assert.deepEqual [],st.match ['foo']

        it 'making',->
            st=new State options1
            assert.equal 1,st.go(['foo','bar']).length
            assert.ok st.go(['foo','bar'])[0] instanceof State

        it 'midpoint matcing',->
            st=new State options1
            [st2]=st.go ['foo']
            sts=st.go(['foo','bar'])
            assert.equal 1,sts.length
            assert.deepEqual [st2],st.go(['foo'])
            assert.deepEqual sts,st.go(['foo','bar'])

    it 'defined path',->
        st=new State options1
        st.go ['foo']
        assert.equal 1,st.match(['foo']).length
        assert.ok st.match(['foo'])[0].state instanceof State
    describe 'pattern matching',->
        st=new State options2
        [st2]=st.go [':id']
        it 'match pattern',->
            assert.deepEqual [{
                params:
                    ':id':'foo-bar_baz00000'
                state:st2
            }],st.match ['foo-bar_baz00000']
        it 'do not match pattern name',->
            assert.deepEqual [],st.match [':id']
        it 'go by pattern name',->
            assert.deepEqual [st2],st.go [':id']


