/**
 * Created by Aleksey Chichenkov <cublakhan257@gmail.com> on 6/20/20.
 */
import CustomPromise from "../../../env/promise";

export default function (corporationId) {
    let p = new CustomPromise();

    let id = this.add(function (_e) {
        this.remove(id);
        _e.success ? p.resolve(_e.result) : p.reject(_e.error);
    }.bind(this));

    let obj = {};
    if(corporationId.constructor === Array) {
        obj.corporationIds = corporationId;
    } else {
        obj.corporationId = corporationId;
    }

    this.send(id, ["api", "eve", "corporation", "info"], obj);

    return p.native;
}