var State = (function () {
    function State(options) {
        this.options = options;
        this.table = [];
        this.value = void 0;
        this.isset = false;
    }
    //go path
    State.prototype.go = function (segs) {
        if (segs.length === 0) {
            return [this];
        }
        var seg = segs[0];
        var fl = false; //construction needed flag
        var result = [];
        var targets = [];
        for (var i = 0, table = this.table, l = table.length; i < l; i++) {
            var e = table[i];
            if (e.seg === seg) {
                //match
                fl = true;
                result.push.apply(result, e.next.go(segs.slice(1)));
            }
            if (e.pattern != null && seg[0] !== this.options.patternPrefix && e.pattern.test(seg)) {
                //pattern match
                targets.push(e);
            }
        }
        //no match
        if (fl === false) {
            var res = new State(this.cloneMyOptions());
            var p = seg[0] === this.options.patternPrefix ? this.options.patterns[seg] : null;
            if (p != null) {
                // pattern is provided for this seg
                this.table.push({
                    seg: seg,
                    pattern: p,
                    params: null,
                    next: res
                });
            }
            else {
                this.table.push({
                    seg: seg,
                    params: null,
                    next: res
                });
            }
            // modify res
            var t = res.table;
            for (var i = 0, l = targets.length; i < l; i++) {
                var tb = targets[i].next.table;
                for (var j = 0, m = tb.length; j < m; j++) {
                    var pe = tb[j];
                    var pa = pe.params ? clone(pe.params) : {};
                    if (p == null) {
                        pa[pe.seg] = seg;
                    }
                    t.push({
                        seg: pe.seg,
                        pattern: pe.pattern,
                        params: pa,
                        next: pe.next
                    });
                }
            }
            result.push.apply(result, res.go(segs.slice(1)));
        }
        return result;
    };
    //match path
    State.prototype.match = function (segs) {
        if (segs.length === 0) {
            return [{
                    params: {},
                    state: this
                }];
        }
        var seg = segs[0];
        var result = [];
        for (var i = 0, table = this.table, l = table.length; i < l; i++) {
            var e = table[i];
            if (e.pattern != null) {
                if (e.pattern.test(seg)) {
                    var objs = e.next.match(segs.slice(1));
                    for (var j = 0, m = objs.length; j < m; j++) {
                        var o = objs[j];
                        var params = clone(o.params);
                        if (e.params != null) {
                            for (var key in e.params) {
                                params[key] = e.params[key];
                            }
                        }
                        if (!(e.seg in params)) {
                            params[e.seg] = seg;
                        }
                        result.push({
                            params: params,
                            state: o.state
                        });
                    }
                }
            }
            else if (e.seg === seg) {
                result.push.apply(result, e.next.match(segs.slice(1)));
            }
        }
        return result;
    };
    //get value
    State.prototype.get = function () {
        return this.value;
    };
    //has value
    State.prototype.has = function () {
        return this.isset;
    };
    State.prototype.mount = function (value) {
        this.value = value;
        this.isset = true;
    };
    State.prototype.cloneMyOptions = function () {
        return {
            patternPrefix: this.options.patternPrefix,
            patterns: dict(this.options.patterns)
        };
        function dict(obj) {
            var result = {};
            for (var key in obj) {
                result[key] = obj[key];
            }
            return result;
        }
    };
    return State;
})();
exports["default"] = State;
function clone(obj) {
    if ("object" !== typeof obj || obj instanceof RegExp || obj instanceof Date) {
        return obj;
    }
    else if (Array.isArray(obj)) {
        return obj.map(function (x) { return x; });
    }
    var result = {};
    var ks = Object.getOwnPropertyNames(obj);
    for (var i = 0, l = ks.length; i < l; i++) {
        var k = ks[i];
        result[k] = clone(obj[k]);
    }
    return result;
}
