var State = (function () {
    function State() {
        this.table = {};
        this.value = void 0;
    }
    //find
    State.prototype.find = function (segs, make) {
        if (segs.length === 0) {
            return this;
        }
        var seg = segs[0];
        var res = this.table[seg];
        if (res == null) {
            if (make === true) {
                //init new state
                res = new State();
                this.table[seg] = res;
                return res.find(segs.slice(1), make);
            }
            else {
                return null;
            }
        }
        return res.find(segs.slice(1), make);
    };
    //get value
    State.prototype.get = function () {
        return this.value;
    };
    State.prototype.mount = function (value) {
        this.value = value;
    };
    return State;
})();
exports["default"] = State;
