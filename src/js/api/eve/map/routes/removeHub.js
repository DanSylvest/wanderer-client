/**
 * Created by Aleksey Chichenkov <cublakhan257@gmail.com> on 12/23/20.
 */

import CustomPromise from "../../../../env/promise";

export default function (mapId, solarSystemId) {
    let p = new CustomPromise();

    let id = this.add(function (_e) {
        this.remove(id);
        _e.success ? p.resolve(_e.result) : p.reject(_e.error);
    }.bind(this));

    this.send(id, ["api", "eve", "map", "routes", "removeHub"], {
        mapId: mapId,
        solarSystemId: solarSystemId
    });

    return p.native;
}