/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 6/20/20.
 */
import CustomPromise from "../../../env/promise";

/**
 *
 * @param _characterId
 * @returns {*}
 */
export default function (_characterId) {
    let p = new CustomPromise();

    let id = this.add(function (_e) {
        this.remove(id);
        _e.success ? p.resolve(_e.data) : p.reject(_e.message);
    }.bind(this));

    this.send(id, ["api", "eve", "character", "getName"], {
        characterId: _characterId
    });

    return p.native;
}