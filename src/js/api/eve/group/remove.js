/**
 * Created by Aleksey Chichenkov <cublakhan257@gmail.com> on 5/21/20.
 */

import CustomPromise from "../../../env/promise";

export default function (_groupId) {
    let p = new CustomPromise();

    let id = this.add(function (_e) {
        this.remove(id);
        _e.success ? p.resolve() : p.reject(_e.error);
    }.bind(this));

    this.send(id, ["api", "eve", "group", "remove"], {
        groupId: _groupId
    });

    return p.native;
}