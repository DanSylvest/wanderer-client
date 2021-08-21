import Subscriber from "../../../utils/subscriber";
import extend from "../../../env/tools/extend";

class SubscribeOnlineCharacters extends Subscriber {
    constructor(_options) {
        let base = extend({
            /** @type string */
            mapId: null,
            path: ["api", "eve", "map", "subscribeOnlineCharacters"]
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
    return new SubscribeOnlineCharacters({
        dispatcher: this,
        mapId: _mapId
    });
}
