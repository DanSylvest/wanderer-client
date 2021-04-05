/**
 * Created by Aleksey Chichenkov <cublakhan257@gmail.com> on 5/21/20.
 */

import Subscriber from "../../../utils/subscriber";
import extend from "../../../env/tools/extend";

class SubscribeAllowedMaps extends Subscriber {
    constructor(_options) {
        let base = extend({
            path: ["api", "eve", "map", "subscribeAllowedMaps"]
        }, _options);

        super(base);
    }

    _sendData() {
        return {
        }
    }

    _eventHandler(_event) {
        this.notify(_event.data)
    }
}

export default function () {
    return new SubscribeAllowedMaps({
        dispatcher: this
    });
}
