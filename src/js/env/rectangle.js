/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 2/12/20.
 */
import Vector2 from "./vector2";

class Rectangle {
    constructor (_lt, _rb) {
        this.lt = _lt;
        this.rb = _rb;
    }
    crossOrInside (_rectangle) {
        var p1 = _rectangle.lt;
        var p2 = new Vector2(_rectangle.rb.x, _rectangle.lt.y);
        var p3 = _rectangle.rb;
        var p4 = new Vector2(_rectangle.lt.x, _rectangle.rb.y);

        return this.isInside(p1) || this.isInside(p2) || this.isInside(p3) || this.isInside(p4);
    }
    isInside (_v2) {
        return _v2.x >= this.lt.x && _v2.x <= this.rb.x && _v2.y >= this.lt.y && _v2.y <= this.rb.y;
    }
}

export default Rectangle;