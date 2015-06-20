# state test
assert = require 'assert'

State = require('../lib/state').default

options=
    patternPrefix: ':'

describe 'State',->
    describe 'endpoint functionality',->
        it 'mounting',->
            st=new State options
            assert.equal st.has(), false
            st.mount 'foo'
            assert.equal st.has(), true
            assert.equal st.get(), 'foo'
            st.mount 'bar'
            assert.equal st.has(), true
            assert.equal st.get(), 'bar'
        it 'endpoint params',->
            st=new State options
            st.mount 'foo'
            st.params=
                ':id':'bar'
            st.requirements=
                ':id':true
            assert.deepEqual st.match([]),[{
                params:
                    ':id':'bar'
                state: st
            }]
        it 'endpoint params (no requirements)',->
            st=new State options
            st.mount 'foo'
            st.params=
                ':id':'bar'
            st.requirements={}
            assert.deepEqual st.match([]),[{
                params:{}
                state: st
            }]
    describe 'static paths',->
        it 'no matching',->
            st=new State options
            assert.deepEqual [],st.match ['foo']

        it 'making',->
            st=new State options
            assert.equal 1,st.go(['foo','bar']).length
            assert.ok st.go(['foo','bar'])[0] instanceof State

        it 'midpoint branching',->
            st=new State options
            [st2]=st.go ['foo']
            sts=st.go(['foo','bar'])
            assert.equal 1,sts.length
            assert.deepEqual [st2],st.go(['foo'])
            assert.deepEqual sts,st.go(['foo','bar'])

        it 'matching',->
            st=new State options
            st.go ['foo']
            assert.equal 1,st.match(['foo']).length
            assert.ok st.match(['foo'])[0].state instanceof State

        it 'matching with endpoint params',->
            st=new State options
            [st2]=st.go ['foo']
            
            result=st.match ['foo']
            assert.deepEqual result[0].params,{}
            assert.ok result[0].state instanceof State

    describe 'pattern matching',->
        st=new State options
        patterns=
            ':id':
                pattern: /^[-_a-zA-Z0-9]+$/
                id: 1
        [st2]=st.go [':id'],patterns

        it 'match pattern',->
            assert.deepEqual [{
                params:
                    ':id':'foo-bar_baz00000'
                state:st2
            }],st.match ['foo-bar_baz00000']
        it 'match requirements',->
            st=new State options
            [st2]=st.go [':id'],patterns
            st2.requirements={}
            assert.deepEqual st.match(['hoge']),[{
                params:{}
                state:st2
            }]
        it 'do not match pattern name',->
            assert.deepEqual [],st.match [':id']
        it 'go by pattern name',->
            assert.deepEqual [st2],(st.go [':id'],patterns)


