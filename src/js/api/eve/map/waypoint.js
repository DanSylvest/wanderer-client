/**
 * Created by Aleksey Chichenkov <cublakhan257@gmail.com> on 10/1/20.
 */

import CustomPromise from "../../../env/promise";

export default function (_characterId, _type, _destinationSolarSystemId) {
    let p = new CustomPromise();

    let id = this.add(function (_e) {
        this.remove(id);
        _e.success ? p.resolve(_e.data) : p.reject(_e.error);
    }.bind(this));

    this.send(id, ["api", "eve", "map", "waypoint"], {
        type: _type,
        characterId: _characterId,
        destinationSolarSystemId: _destinationSolarSystemId
    });

    return p.native;
}