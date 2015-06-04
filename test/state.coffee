# state test
assert = require 'assert'

State = require('../lib/state').default

describe 'State',->
    it 'endpoint mounting',->
        st=new State
        st.mount 'foo'
        assert.equal st.get(), 'foo'
        st.mount 'bar'
        assert.equal st.get(), 'bar'
    describe 'undefined path',->
        it 'finding',->
            st=new State
            assert.strictEqual null,st.find ['foo']
        it 'making',->
            st=new State
            assert.ok st.find(['foo'],true) instanceof State
    it 'defined path',->
        st=new State
        st.find ['foo'],true
        assert.ok st.find(['foo']) instanceof State

