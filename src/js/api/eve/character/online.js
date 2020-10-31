/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 5/21/20.
 */
import extend from "../../../env/tools/extend";
import Subscriber from "../../../utils/subscriber"

class CharacterOnlineSubscriber extends Subscriber {
    constructor (_options) {
        var base = extend({
            /** @type string */
            characterId: null,
            path: ["api", "eve", "character", "online"]
        }, _options);

        super(base);

        this._characterId = base.characterId;
    }

    _sendData () {
        return {
            characterId: this._characterId
        }
    }

    _eventHandler (_event) {
        this.notify(_event.data)
    }
}

export default function (_characterId) {
    return new CharacterOnlineSubscriber({
        dispatcher: this,
        characterId: _characterId
    });
}

