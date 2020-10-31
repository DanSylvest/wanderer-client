/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 5/21/20.
 */

import CustomPromise from "../../../env/promise";

export default function (_mapId, _systemIds) {
    let p = new CustomPromise();

    let id = this.add(function (_e) {
        this.remove(id);
        _e.success ? p.resolve(_e.data) : p.reject(_e.message);
    }.bind(this));

    this.send(id, ["api", "eve", "map", "systemsRemove"], {
        mapId: _mapId,
        systemIds: _systemIds
    });

    return p.native;
}