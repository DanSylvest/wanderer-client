/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 5/20/20.
 */
import CustomPromise from "../../env/promise";

/**
 *
 * @param token {string}
 */
export default function (token) {
    let p = new CustomPromise();

    let id = this.add(function (_e) {
        this.remove(id);
        _e.success ? p.resolve(_e.type) : p.reject(_e.message);
    }.bind(this));

    this.send(id, ["api", "user", "getAuthType"], {token: token});

    return p.native;
}