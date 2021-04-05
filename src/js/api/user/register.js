/**
 * Created by Aleksey Chichenkov <cublakhan257@gmail.com> on 5/21/20.
 */

import CustomPromise from "../../env/promise";

export default function (code) {
    let p = new CustomPromise();

    let id = this.add(function (_e) {
        this.remove(id);
        _e.success ? p.resolve(_e) : p.reject(_e.error);
    }.bind(this));

    this.send(id, ["api", "user", "register"], {
        code: code
    });

    return p.native;
}