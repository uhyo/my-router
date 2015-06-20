var state_1 = require('./state');
var pathutil = require('./pathutil');
var Router = (function () {
    function Router(options) {
        this.handleOptions(options);
        this.patterns = {};
        this.patternid = 1;
        this.root = new state_1["default"]({
            patternPrefix: this.patternPrefix
        });
        if (options != null && options.patterns != null) {
            for (var key in options.patterns) {
                this.addPattern(key, options.patterns[key]);
            }
        }
    }
    Router.prototype.add = function (path, value) {
        var segs = pathutil.split(path);
        var sts = this.root.go(segs, this.patterns);
        for (var i = 0, l = sts.length; i < l; i++) {
            if (!sts[i].has()) {
                sts[i].mount(value);
            }
        }
    };
    Router.prototype.route = function (path) {
        var segs = pathutil.split(path);
        var objs = this.root.match(segs);
        if (objs.length === 0) {
            return null;
        }
        for (var i = 0, l = objs.length; i < l; i++) {
            var o = objs[i];
            if (o.state.has()) {
                return {
                    params: o.params,
                    result: o.state.get()
                };
            }
        }
        return null;
    };
    Router.prototype.addPattern = function (seg, regexp) {
        this.patterns[seg] = {
            pattern: regexp,
            id: this.patternid++
        };
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
        this.patternPrefix = options.patternPrefix;
    };
    return Router;
})();
exports["default"] = Router;
