/**
 * Created by Aleksey Chichenkov <cublakhan257@gmail.com> on 12/23/20.
 */

import CustomPromise from "../../../../env/promise";

export default function (mapId, solarSystemId, hubs) {
    let p = new CustomPromise();

    let id = this.add(function (_e) {
        this.remove(id);
        _e.success ? p.resolve(_e.data) : p.reject(_e.error);
    }.bind(this));

    this.send(id, ["api", "eve", "map", "routes", "getRoutes"], {
        mapId: mapId,
        solarSystemId: solarSystemId,
        hubs: hubs
    });

    return p.native;
}