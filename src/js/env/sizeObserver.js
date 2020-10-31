/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 2/12/20.
 */

class SizeObserver {
    constructor (_handler) {
        this._handler = _handler;
        window.addEventListener("resize", this._handler);
    }
    destructor () {
        window.removeEventListener("resize", this._handler);
    }
}

export default SizeObserver;