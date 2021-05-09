/**
 * Created by Aleksey Chichenkov <cublakhan257@gmail.com> on 6/20/20.
 */
import CustomPromise from "../../../env/promise";

/**
 *
 * @param {string|Array<string>} characterId
 * @returns {*}
 */
export default function (characterId) {
    let p = new CustomPromise();

    let id = this.add(function (_e) {
        this.remove(id);
        _e.success ? p.resolve(_e.result) : p.reject(_e.error);
    }.bind(this));

    let obj = {};
    if(characterId.constructor === Array) {
        obj.characterIds = characterId;
    } else {
        obj.characterId = characterId;
    }

    this.send(id, ["api", "eve", "character", "publicInfo"], obj);

    return p.native;
}