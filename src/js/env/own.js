/**
 * Created by Aleksey Chichenkov <cublakhan257@gmail.com> on 10/24/20.
 */
 
const isOwn = function (_object, _element) {
    // eslint-disable-next-line no-prototype-builtins
    return !_object.hasOwnProperty || _object.hasOwnProperty(_element);
}

export default isOwn;