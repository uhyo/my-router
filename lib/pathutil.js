/* path parsing utility */
function split(path) {
    var s = 0, st = 0;
    var result = [];
    for (var i = 0, l = path.length; i < l; i++) {
        var c = path[i];
        if (s === 0) {
            // parse first /
            s = 1;
            if (c !== '/') {
                continue;
            }
            st++;
        }
        else if (s === 1) {
            // parse segment
            if (c === '/') {
                if (st !== i) {
                    result.push(path.slice(st, i));
                }
                st = i + 1;
            }
        }
    }
    if (st !== i) {
        result.push(path.slice(st));
    }
    return result;
}
exports.split = split;
