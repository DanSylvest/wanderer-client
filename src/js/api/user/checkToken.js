/**
 * Created by Aleksey Chichenkov <cublakhan257@gmail.com> on 5/21/20.
 */

import CustomPromise from "../../env/promise";

export default function (_token) {
    let p = new CustomPromise();

    let id = this.add(function (_e) {
        this.remove(id);
        _e.success ? p.resolve() : p.reject();
    }.bind(this));

    this.send(id, ["api", "user", "checkToken"], {token: _token});

    return p.native;
}