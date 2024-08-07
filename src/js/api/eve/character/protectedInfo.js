/**
 * Created by Aleksey Chichenkov <cublakhan257@gmail.com> on 6/20/20.
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
        _e.success ? p.resolve(_e.result) : p.reject(_e.error);
    }.bind(this));

    this.send(id, ["api", "eve", "character", "protectedInfo"], {
        characterId: _characterId
    });

    return p.native;
}