/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 5/21/20.
 */

import CustomPromise from "../../../env/promise";

export default function (_mapId) {
    let p = new CustomPromise();

    let id = this.add(function (_e) {
        this.remove(id);
        _e.success ? p.resolve(_e) : p.reject(_e.message);
    }.bind(this));

    this.send(id, ["api", "eve", "map", "remove"], {
        mapId: _mapId
    });

    return p.native;
}