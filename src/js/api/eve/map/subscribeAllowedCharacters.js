/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 5/21/20.
 */

import Subscriber from "../../../utils/subscriber";
import extend from "../../../env/tools/extend";

class SubscribeAllowedCharacters extends Subscriber {
    constructor(_options) {
        let base = extend({
            mapId: null,
            path: ["api", "eve", "map", "subscribeAllowedCharacters"]
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

export default function (mapId) {
    return new SubscribeAllowedCharacters({
        dispatcher: this,
        mapId: mapId
    });
}
