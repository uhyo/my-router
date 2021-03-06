# my-router v2.0.0

`my-router` is my simple router for me.

`my-router` routes everything by URL path.

## Installation
```sh
npm install my-router
```

## Usage

```js
var Router = require('my-router').Router;

var router=new Router({
    patterns:{
        ':id': /^\w+$/
    }
});

// Add values to router
router.add('/foo', 'foo');
router.add('/foo/bar', 'foobar');
router.add('/:id', 'id');
router.add('/:id/bar', 'idbar');

router.addPattern(':num', /^\d+$/);
router.add('/:id/:num', 'idnum');

// Route by paths

console.log(router.route('/foo'));
/* returns
    {
        'params':{},
        'result': 'foo'
    } */

console.log(router.route('/foo/bar'));
/* returns
    {
        'params':{},
        'result': 'foobar'
    } */

console.log(router.route('/hoge'));
/* returns
    {
        'params':{
            ':id': 'hoge'
        },
        'result': 'id'
    } */

console.log(router.route('/hoge/bar'));
/* returns
    {
        'params':{
            ':id': 'hoge'
        },
        'result': 'idbar'
    } */

console.log(router.route('/hoge/baz'));
/* returns null */

console.log(router.route('/foo/123'));
/* returns
    {
        'params':{
            ':num': '123',
            ':id': 'foo'
        },
        'result': 'idnum'
    } */
```

## TypeScript declaration
Available.

Note that `Router` is of type `Router<T>`, where `T` is the type of values routed.

## APIs

### router = new Router([options])
Creates new router.

* `options.patternPrefix` a character which is prefixed with the name of pattern-match segment. Defaults to `:`
* `options.patterns` a dictionary from the name of pattern-match segment to RegExp

### router.add(path,value)
Mounts `value` to `path`.

### result = router.route(path)
Gets value mounted at `path`. Returns `null` if none.

If value is available, returned object has:

* `params` dictionary of pattern matching results.
* `result` value.

### result = router.addPattern(seg,pattern)
Adds new pattern-match segment definition to `router`.

### Changelog
* v1.1.0 (2015-06-20)
    * Add `router.addPattern` for me.
* v1.0.0
## License
MIT
