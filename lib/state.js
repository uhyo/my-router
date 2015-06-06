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
        var result = [];
        var fl = false; // construction needed flag */
        for (var i = 0, table = this.table, l = table.length; i < l; i++) {
            var e = table[i];
            if (e.seg === seg) {
                //match
                fl = true;
                result.push.apply(result, e.next.go(segs.slice(1)));
            }
            if (e.pattern != null && seg[0] !== this.options.patternPrefix && e.pattern.test(seg)) {
                //pattern match
                result.push.apply(result, e.next.go(segs.slice(1)));
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
                    next: res
                });
            }
            else {
                this.table.push({
                    seg: seg,
                    next: res
                });
            }
            result.push.apply(result, res.go(segs.slice(1)));
        }
        return result;
    };
    //match path
    State.prototype.match = function (segs) {
        if (segs.length === 0) {
            return [this];
        }
        var seg = segs[0];
        var result = [];
        for (var i = 0, table = this.table, l = table.length; i < l; i++) {
            var e = table[i];
            if (e.pattern != null) {
                if (e.pattern.test(seg)) {
                    result.push.apply(result, e.next.match(segs.slice(1)));
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
