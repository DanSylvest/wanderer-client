/**
 * Created by Aleksey Chichenkov <cublakhan257@gmail.com> on 6/20/20.
 */
import CustomPromise from "../../../env/promise";

export default function (allianceId) {
    let p = new CustomPromise();

    let id = this.add(function (_e) {
        this.remove(id);
        _e.success ? p.resolve(_e.result) : p.reject(_e.error);
    }.bind(this));

    let obj = {};
    if(allianceId.constructor === Array) {
        obj.allianceIds = allianceId;
    } else {
        obj.allianceId = allianceId;
    }

    this.send(id, ["api", "eve", "alliance", "info"], obj);

    return p.native;
}