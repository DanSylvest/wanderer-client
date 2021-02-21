/**
 * Created by Aleksey Chichenkov <a.chichenkov@initi.ru> on 12/23/20.
 */

import CustomPromise from "../../../../env/promise";

export default function (mapId, solarSystemId) {
    let p = new CustomPromise();

    let id = this.add(function (_e) {
        this.remove(id);
        _e.success ? p.resolve(_e.data) : p.reject(_e.error);
    }.bind(this));

    this.send(id, ["api", "eve", "map", "routes", "list"], {
        mapId: mapId,
        solarSystemId: solarSystemId
    });

    return p.native;
}