/**
 * Created by Aleksey Chichenkov <cublakhan257@gmail.com> on 6/19/20.
 */
var SpamFilter = function (_method, _delay, _delayForce) {
    this._method = _method;
    this._delay = _delay;
    this._delayForce = typeof _delayForce === "number" ? _delayForce : null;
    this._args = [];
    this._tid = -1;
    this._ftid = -1;
};

SpamFilter.prototype.destructor = function () {
    this._method = null;
    this._delay = null;
    this.stop();
};

SpamFilter.prototype._tick = function (_force) {
    if(_force) {
        this._ftid = -1;
        this._tid !== -1 && clearTimeout(this._tid);
    }

    this._tid = -1;
    this._method.apply(null, this._args);

    this._args = [];
};

SpamFilter.prototype.call = function () {
    this._args = arguments;

    if(this._delayForce !== null && this._ftid === -1) {
        this._ftid = setTimeout(this._tick.bind(this, true), this._delayForce);
    }

    this._tid !== -1 && clearTimeout(this._tid);
    this._tid = setTimeout(this._tick.bind(this, false), this._delay);
};

SpamFilter.prototype.stop = function () {
    this._tid !== -1 && clearTimeout(this._tid);
    this._tid = -1;

    this._ftid !== -1 && clearTimeout(this._ftid);
    this._ftid = -1;

    this._args = [];
};

export default SpamFilter;