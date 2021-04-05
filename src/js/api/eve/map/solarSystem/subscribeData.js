/**
 * Created by Aleksey Chichenkov <cublakhan257@gmail.com> on 5/21/20.
 */

import Subscriber from "../../../../utils/subscriber";
import extend from "../../../../env/tools/extend";

class MapSolarSystemDataSubscribe extends Subscriber {
    constructor(_options) {
        let base = extend({
            /** @type string */
            mapId: null,
            /** @type string */
            solarSystemId: null,
            path: ["api", "eve", "map", "solarSystem", "subscribeData"]
        }, _options);

        super(base);

        this._mapId = base.mapId;
        this._solarSystemId = base.solarSystemId;
    }

    _sendData() {
        return {
            mapId: this._mapId,
            solarSystemId: this._solarSystemId,
        }
    }

    _eventHandler(_event) {
        this.notify(_event.data)
    }
}

export default function (mapId, solarSystemId) {
    return new MapSolarSystemDataSubscribe({
        dispatcher: this,
        mapId: mapId,
        solarSystemId: solarSystemId,
    });
}
