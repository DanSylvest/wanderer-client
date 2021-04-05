/**
 * Created by Aleksey Chichenkov <cublakhan257@gmail.com> on 2/12/20.
 */

/* eslint-disable no-prototype-builtins */

var extend = function(_left, _right) {
    var target = _left || {};

    if(_right === undefined) return target;

    for (var key in _right) {
        if (!_right.hasOwnProperty || _right.hasOwnProperty(key)) {
            if (_right[key] instanceof Object && (_right[key] && _right[key].constructor === Object)) {
                if (_left[key] && _left[key] instanceof Object)
                    target[key] = extend(_left[key], _right[key]);
                else
                    target[key] = extend({}, _right[key]);
            } else
                target[key] = _right[key];
        }
    }

    return target;
};

export default extend;