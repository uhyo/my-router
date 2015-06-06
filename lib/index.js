var state_1 = require('./state');
var pathutil = require('./pathutil');
var Router = (function () {
    function Router(options) {
        this.handleOptions(options);
        this.root = new state_1["default"]({
            patternPrefix: this.options.patternPrefix,
            patterns: this.options.patterns
        });
    }
    Router.prototype.add = function (path, value) {
        var segs = pathutil.split(path);
        var sts = this.root.go(segs);
        for (var i = 0, l = sts.length; i < l; i++) {
            if (!sts[i].has()) {
                sts[i].mount(value);
            }
        }
    };
    Router.prototype.route = function (path) {
        var segs = pathutil.split(path);
        var sts = this.root.match(segs);
        if (sts.length === 0) {
            return void 0;
        }
        for (var i = 0, l = sts.length; i < l; i++) {
            if (sts[i].has()) {
                return sts[i].get();
            }
        }
        return void 0;
    };
    Router.prototype.handleOptions = function (options) {
        if (options == null) {
            options = {};
        }
        if ("string" !== typeof options.patternPrefix) {
            options.patternPrefix = ":";
        }
        else if (options.patternPrefix.length !== 1) {
            console.warn("[my-router] WARN: patternPrefix must be one character");
        }
        if (options.patterns == null) {
            options.patterns = {};
        }
        this.options = options;
    };
    return Router;
})();
exports["default"] = Router;
