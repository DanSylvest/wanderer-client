/**
 * Created by Aleksey Chichenkov <cublakhan257@gmail.com> on 5/20/20.
 */
import CustomPromise from "../../env/promise";

/**
 *
 * @param _type {string} possible 'auth' and 'attach'.
 * Use auth when you want register or authorize user; attach when you want add new char
 * @returns {Promise | Promise<unknown>}
 */
export default function (_type) {
    let p = new CustomPromise();

    let id = this.add(function (_e) {
        this.remove(id);
        _e.success ? p.resolve(_e.token) : p.reject(_e.error);
    }.bind(this));

    this.send(id, ["api", "user", "getAuthToken"], {type: _type});

    return p.native;
}