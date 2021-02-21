/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 12/9/20.
 */

import CustomPromise from "../../../../env/promise";

export default function (mapId, solarSystemId, x, y) {
    let p = new CustomPromise();

    let id = this.add(function (_e) {
        this.remove(id);
        _e.success ? p.resolve() : p.reject(_e.error);
    }.bind(this));

    this.send(id, ["api", "eve", "map", "solarSystem", "addManual"], {
        mapId: mapId,
        solarSystemId: solarSystemId,
        x: x,
        y: y,
    });

    return p.native;
}