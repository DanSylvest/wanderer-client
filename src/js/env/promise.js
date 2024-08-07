/**
 * Created by Aleksey Chichenkov <cublakhan257@gmail.com> on 1/28/20.
 */

class CustomPromise{
  constructor (promise) {
    const data = {
      is_cancel: false,
    };

    let resolve = null;
    let reject = null;

    this.native = new Promise((_resolve, _reject) => {
      resolve = _resolve;
      reject = _reject;
    });

    this.native.cancel = this._cancel.bind(this, data);
    this.native.then = this._then.bind(this, data);
    this.native.catch = this._catch.bind(this, data);

    this.resolve = function () {
      !data.is_cancel && resolve.apply(this.native, arguments);
    };

    this.reject = function () {
      !data.is_cancel && reject.apply(this.native, arguments);
    };

    if (promise) {
      promise.then(this.resolve.bind(this), this.reject.bind(this));
    }
  }

  _canceledPromise () {
    const pr = new CustomPromise();
    pr.native.cancel();
    return pr.native;
  }

  _process_callback (_data, _callback, _event) {
    if (!_data.is_cancel) {
      return _callback(_event);
    } else {
      return this._canceledPromise();
    }
  }

  _catch (_data, _a) {
    if (_data.is_cancel) {
      return this._canceledPromise();
    }
    _data.is_catched = true;
    return Promise.prototype.catch.call(this.native, this._process_callback.bind(this, _data, _a));
  }

  _then (_data, _a, _b) {
    if (_data.is_cancel) {
      return this._canceledPromise();
    }
    if (_data.is_catched) {
      _data.is_catched = false;
      return Promise.prototype.then.call(this.native, this._process_callback.bind(this, _data, _b));
    }
    return Promise.prototype.then.call(this.native, this._process_callback.bind(this, _data, _a), this._process_callback.bind(this, _data, _b));
  }

  _cancel (_data) {
    _data.is_cancel = true;
  }
}

Promise.queue = function (_arr) {
  var out_pr = new CustomPromise();
  var q = _arr.concat();
  var result = [];

  var success = function (_result) {
    result.push(_result);
    exec();
  };

  var failure = function (_err) {
    out_pr.reject(_err);
  };

  var exec = function () {
    if (q.length === 0) {
      out_pr.resolve(result);
      return;
    }

    var el = q.shift();
    if (el instanceof Promise)
      el.then(success, failure);
    else {
      result.push(el);
      exec();
    }

  };

  exec();

  return out_pr.native;
};

export default CustomPromise;
