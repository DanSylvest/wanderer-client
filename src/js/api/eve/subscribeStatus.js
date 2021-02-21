/**
 * Created by Aleksey Chichenkov <a.chichenkov@initi.ru> on 2/14/21.
 */

import extend from "../../env/tools/extend";
import Subscriber from "../../utils/subscriber";

class SubscribeStatus extends Subscriber {
    constructor(_options) {
        let base = extend({
            path: ["api", "eve", "subscribeStatus"]
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
    return new SubscribeStatus({
        dispatcher: this
    });
}
