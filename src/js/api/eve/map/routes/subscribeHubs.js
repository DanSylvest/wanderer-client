/**
 * Created by Aleksey Chichenkov <cublakhan257@gmail.com> on 5/21/20.
 */

import Subscriber from "../../../../utils/subscriber";
import extend from "../../../../env/tools/extend";

class SubscribeHubs extends Subscriber {
    constructor(_options) {
        let base = extend({
            /** @type string */
            mapId: null,
            path: ["api", "eve", "map", "routes", "subscribeHubs"]
        }, _options);

        super(base);

        this._mapId = base.mapId;
    }

    _sendData() {
        return {
            mapId: this._mapId,
        }
    }

    _eventHandler(_event) {
        this.notify(_event.data)
    }
}

export default function (mapId) {
    return new SubscribeHubs({
        dispatcher: this,
        mapId: mapId
    });
}
