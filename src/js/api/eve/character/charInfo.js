/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 6/20/20.
 */
import CustomPromise from "../../../env/promise";

/**
 *
 * @param _characterId
 * @param {string} _type - may be "local", or "global" - when local info will be get by added character
 * default "global"
 * @returns {*}
 */
export default function (_characterId, _type) {
    let p = new CustomPromise();

    let id = this.add(function (_e) {
        this.remove(id);
        _e.success ? p.resolve(_e.result) : p.reject(_e.message);
    }.bind(this));

    this.send(id, ["api", "eve", "character", "charInfo"], {
        characterId: _characterId,
        type: _type || "global"
    });

    return p.native;
}