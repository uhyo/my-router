var State = (function () {
    function State() {
        this.table = [];
        this.value = void 0;
    }
    //find
    State.prototype.find = function (segs, make) {
        if (segs.length === 0) {
            return this;
        }
        var seg = segs[0];
        for (var i = 0, table = this.table, l = table.length; i < l; i++) {
            var e = table[i];
            if (e.seg === seg) {
                //match
                return e.next.find(segs.slice(1), make);
            }
        }
        //no match
        if (make === true) {
            //init new state
            var res = new State();
            this.table.push({
                seg: seg,
                next: res
            });
            return res.find(segs.slice(1), make);
        }
        else {
            return null;
        }
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
