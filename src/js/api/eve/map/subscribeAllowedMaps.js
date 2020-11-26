/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 5/21/20.
 */

import Subscriber from "../../../utils/subscriber";
import extend from "../../../env/tools/extend";

class SubscribeAllowedMaps extends Subscriber {
    constructor(_options) {
        let base = extend({
            /** @type string */
            characterId: null,
            path: ["api", "eve", "map", "subscribeAllowedMaps"]
        }, _options);

        super(base);

        this._mapId = base.mapId;
    }

    _sendData() {
        return {
            mapId: this._mapId
        }
    }

    _eventHandler(_event) {
        this.notify(_event.data)
    }
}

export default function (_mapId) {
    return new SubscribeAllowedMaps({
        dispatcher: this,
        mapId: _mapId
    });
}