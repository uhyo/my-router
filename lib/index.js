var state_1 = require('./state');
var pathutil = require('./pathutil');
var Router = (function () {
    function Router() {
        this.root = new state_1["default"]();
    }
    Router.prototype.add = function (path, value) {
        var segs = pathutil.split(path);
        var st = this.root.find(segs, true);
        st.mount(value);
    };
    Router.prototype.route = function (path) {
        var segs = pathutil.split(path);
        var st = this.root.find(segs);
        if (st == null) {
            return void 0;
        }
        return st.get();
    };
    return Router;
})();
exports["default"] = Router;
