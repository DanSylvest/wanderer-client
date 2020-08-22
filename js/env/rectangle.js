/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 2/12/20.
 */

(function () {
    var moduleName = "env/rectangle";
    
    var deps = [
        "env/vector2",
        "env/tools/class"
    ];
    
    define(moduleName, deps, function () {
        var Vector2      = require("env/vector2");
        var classCreator = require("env/tools/class");

        var Rectangle = classCreator("Rectangle", null, {
            constructor: function (_lt, _rb) {
                this.lt = _lt;
                this.rb = _rb;
            },
            crossOrInside: function (_rectangle) {
                var p1 = _rectangle.lt;
                var p2 = new Vector2(_rectangle.rb.x, _rectangle.lt.y);
                var p3 = _rectangle.rb;
                var p4 = new Vector2(_rectangle.lt.x, _rectangle.rb.y);

                return this.isInside(p1) || this.isInside(p2) || this.isInside(p3) || this.isInside(p4);
            },
            isInside: function (_v2) {
                return _v2.x >= this.lt.x && _v2.x <= this.rb.x && _v2.y >= this.lt.y && _v2.y <= this.rb.y;
            }
        });

        return Rectangle;
    })    
})();