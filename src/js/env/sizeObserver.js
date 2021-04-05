/**
 * Created by Aleksey Chichenkov <cublakhan257@gmail.com> on 2/12/20.
 */

import exists from "./tools/exists";

class SizeObserver {
    constructor (_element, _handler) {
        if(!exists(_element)) _element = window;

        this._handler = _handler;
        this._element = _element;
        this._element.addEventListener("resize", this._handler);
    }
    destructor () {
        this._element.removeEventListener("resize", this._handler);
        delete this._element;
        delete this._handler;
    }
}

export default SizeObserver;