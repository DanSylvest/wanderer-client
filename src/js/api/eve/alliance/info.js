/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 6/20/20.
 */
import CustomPromise from "../../../env/promise";

export default function (_allianceId, _type) {
    let p = new CustomPromise();

    let id = this.add(function (_e) {
        this.remove(id);
        _e.success ? p.resolve(_e.result) : p.reject(_e.message);
    }.bind(this));

    this.send(id, ["api", "eve", "alliance", "info"], {
        allianceId: _allianceId,
        type: _type || "global"
    });

    return p.native;
}