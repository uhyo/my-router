//State with value & params
var State = (function () {
    function State(options) {
        this.options = options;
        this.staticTable = [];
        this.patternTable = [];
        this.value = void 0;
        this.params = {};
        this.requirements = {};
        this.isset = false;
    }
    //go path
    State.prototype.go = function (segs, patterns, requirements) {
        if (patterns === void 0) { patterns = {}; }
        if (requirements === void 0) { requirements = {}; }
        var ppx = this.options.patternPrefix;
        var newrequirements = clone(requirements);
        if (segs.length === 0) {
            return [this];
        }
        var isendpoint = segs.length === 1;
        var seg = segs[0];
        var fl = false; //construction needed flag
        var result = [];
        if (seg[0] !== ppx) {
            //static segment
            for (var i = 0, table = this.staticTable, l = table.length; i < l; i++) {
                var e = table[i];
                if (e.seg === seg) {
                    //match
                    fl = true;
                    result.push.apply(result, e.next.go(segs.slice(1), patterns, newrequirements));
                    break;
                }
            }
        }
        else {
            //pattern segment
            var pent = patterns[seg];
            if (pent != null) {
                for (var i = 0, table = this.patternTable, l = table.length; i < l; i++) {
                    var e = table[i];
                    if (e.patternid === pent.id) {
                        //name matches
                        fl = true;
                        //update requirements
                        newrequirements[seg] = true;
                        result.push.apply(result, e.next.go(segs.slice(1), patterns, newrequirements));
                        break;
                    }
                }
            }
        }
        if (fl === false) {
            var targets = [];
            //find matching patterns if static
            if (seg[0] !== ppx) {
                for (var i = 0, table = this.patternTable, l = table.length; i < l; i++) {
                    var e = table[i];
                    if (e.pattern.test(seg)) {
                        //pattern match
                        targets.push(e);
                    }
                }
            }
            //new state for seg
            var res = new State(this.cloneMyOptions());
            var p = seg[0] === ppx ? patterns[seg] : null;
            //make transition (this -> seg)
            if (p != null) {
                // pattern is provided for this seg
                this.patternTable.push({
                    seg: seg,
                    pattern: p.pattern,
                    patternid: p.id,
                    params: null,
                    next: res
                });
            }
            else {
                this.staticTable.push({
                    seg: seg,
                    params: null,
                    next: res
                });
            }
            if (p != null) {
                newrequirements[seg] = true;
            }
            // set requirements of res
            if (isendpoint) {
                res.requirements = clone(newrequirements);
            }
            // modify res
            for (var i = 0, l = targets.length; i < l; i++) {
                var target = targets[i];
                var tan = target.next;
                // this -> (targets[i]) -> tan  and
                // this -> res
                //copy value to res
                if (!res.has() && tan.has()) {
                    res.params = this.params ? clone(this.params) : {};
                    if (!(target.seg in res.params)) {
                        res.params[target.seg] = seg;
                    }
                    res.mount(tan.get());
                }
                //copy requirements to res
                if (i === 0) {
                    //only first match!
                    for (var key in tan.requirements) {
                        res.requirements[key] = true;
                    }
                }
                //copy static transitions onto res
                var tb = tan.staticTable;
                for (var j = 0, m = tb.length; j < m; j++) {
                    var pe = tb[j];
                    //with additional matching info
                    var pa = pe.params ? clone(pe.params) : {};
                    if (p == null) {
                        if (!(target.seg in pa)) {
                            pa[target.seg] = seg;
                        }
                    }
                    res.staticTable.push({
                        seg: pe.seg,
                        params: pa,
                        next: pe.next
                    });
                }
                //copy pattern trasitions onto res
                tb = tan.patternTable;
                for (var j = 0, m = tb.length; j < m; j++) {
                    var pe = tb[j];
                    //with additional matching info
                    var pa = pe.params ? clone(pe.params) : {};
                    if (p == null) {
                        if (!(target.seg in pa)) {
                            pa[target.seg] = seg;
                        }
                    }
                    res.patternTable.push({
                        seg: pe.seg,
                        pattern: pe.pattern,
                        params: pa,
                        next: pe.next
                    });
                }
            }
            result.push.apply(result, res.go(segs.slice(1), patterns, newrequirements));
        }
        return result;
    };
    //match path
    State.prototype.match = function (segs) {
        if (segs.length === 0) {
            var params = {}, tp = this.params || {};
            //cut off unrequired params
            for (var key in this.requirements) {
                params[key] = tp[key]; //undefined if none
            }
            return [{
                    params: params,
                    state: this
                }];
        }
        var seg = segs[0];
        var result = [];
        // match with static transition
        for (var i = 0, table = this.staticTable, l = table.length; i < l; i++) {
            var e = table[i];
            if (e.seg === seg) {
                var objs = e.next.match(segs.slice(1));
                for (var j = 0, m = objs.length; j < m; j++) {
                    var _a = objs[j], params = _a.params, state = _a.state;
                    if (e.params != null) {
                        for (var key in e.params) {
                            if (key in params) {
                                params[key] = e.params[key];
                            }
                        }
                    }
                    if (this.params != null) {
                        for (var key in this.params) {
                            if (key in params) {
                                params[key] = this.params[key];
                            }
                        }
                    }
                    result.push({
                        params: params,
                        state: state
                    });
                }
            }
        }
        for (var i = 0, table = this.patternTable, l = table.length; i < l; i++) {
            var e = table[i];
            if (e.pattern.test(seg)) {
                var objs = e.next.match(segs.slice(1));
                for (var j = 0, m = objs.length; j < m; j++) {
                    var o = objs[j];
                    var params = clone(o.params);
                    if (e.params != null) {
                        for (var key in e.params) {
                            if (key in params) {
                                params[key] = e.params[key];
                            }
                        }
                    }
                    if (e.seg in params) {
                        params[e.seg] = seg;
                    }
                    if (this.params != null) {
                        for (var key in this.params) {
                            if (key in params) {
                                params[key] = this.params[key];
                            }
                        }
                    }
                    result.push({
                        params: params,
                        state: o.state
                    });
                }
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
    State.prototype.setParams = function (params) {
        this.params = clone(params);
    };
    State.prototype.cloneMyOptions = function () {
        return {
            patternPrefix: this.options.patternPrefix
        };
        /*function dict<T>(obj:{[key:string]:T}):{[key:string]:T}{
            var result=<{[key:string]:T}>{};
            for(var key in obj){
                result[key]=obj[key];
            }
            return result;
        }*/
    };
    return State;
})();
exports["default"] = State;
function clone(obj) {
    if ("object" !== typeof obj || obj == null || obj instanceof RegExp || obj instanceof Date) {
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
