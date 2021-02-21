/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 5/21/20.
 */
import CustomPromise from "../../../../env/promise";

export default function (_mapId, _systemIds) {
    let p = new CustomPromise();

    let id = this.add(function (_e) {
        this.remove(id);
        _e.success ? p.resolve() : p.reject(_e.error);
    }.bind(this));

    this.send(id, ["api", "eve", "map", "solarSystem", "remove"], {
        mapId: _mapId,
        systemIds: _systemIds
    });

    return p.native;
}