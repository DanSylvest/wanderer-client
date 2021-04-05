/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 5/21/20.
 */

import Subscriber from "../../../../utils/subscriber";
import extend from "../../../../env/tools/extend";

class MapSolarSystemDataSubscribe extends Subscriber {
    constructor(_options) {
        let base = extend({
            /** @type string */
            mapId: null,
            /** @type string */
            chainId: null,
            path: ["api", "eve", "map", "link", "subscribeData"]
        }, _options);

        super(base);

        this._mapId = base.mapId;
        this._chainId = base.chainId;
    }

    _sendData() {
        return {
            mapId: this._mapId,
            chainId: this._chainId,
        }
    }

    _eventHandler(_event) {
        this.notify(_event.data)
    }
}

export default function (mapId, chainId) {
    return new MapSolarSystemDataSubscribe({
        dispatcher: this,
        mapId: mapId,
        chainId: chainId,
    });
}
