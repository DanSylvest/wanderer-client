/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 2/12/20.
 */

(function () {
    var moduleName = "env/magnifier";
    
    var deps = [
        "env/tools/class",
        "env/axis",
        "env/vector2",
    ];
    
    define(moduleName, deps, function () {
        var classCreator = require("env/tools/class");
        var Axis         = require("env/axis");
        var Vector2      = require("env/vector2");

        var Magnifier = classCreator("Magnifier", null, {
            constructor: function (_objects) {
                this.hAxis = new Axis(0, 1);
                this.vAxis = new Axis(0, 1);

                this.size = new Vector2(1, 1);
                this.ratio = new Vector2(1, 1);
                this.zoom = 1;

                this._objects = _objects || [];
            },
            destructor: function () {
                this.zoom = 1;

                this.hAxis = new Axis(0, 1);
                this.vAxis = new Axis(0, 1);

                this.size = new Vector2(1, 1);
                this.ratio = new Vector2(1, 1);

                this._objects = [];
            },
            addObject: function (_options) {
                this._objects.push({
                    x: _options.x,
                    y: _options.y,
                    id: _options.id,
                    isLocked: _options.isLocked,
                    fx: _options.fx,
                    fy: _options.fy,
                })
            },
            setObjects: function (_objects) {
                this._objects = _objects || [];
            },
            removeObject: function (_id) {
                this._objects.eraseByObjectKey("id", _id)
            },
            setSize: function (_x, _y) {
                var newSize = new Vector2(_x, _y);

                // найти отношение нового к старому
                var oldToNewRatio = new Vector2(newSize.x / this.size.x, newSize.y / this.size.y);

                this.hAxis.range = this.hAxis.range * oldToNewRatio.x;
                this.vAxis.range = this.vAxis.range * oldToNewRatio.y;

                this.size = newSize;
            },
            toCenter: function () {
                this.hAxis.min -= this.hAxis.range / 2;
                this.vAxis.min -= this.vAxis.range / 2;
            },
            getReal: function () {
                var out = [];

                for (var a = 0; a < this._objects.length; a++) {
                    var object = this._objects[a];

                    var x = (object.x - this.hAxis.min) / this.hAxis.range * this.size.x;
                    var y = (object.y - this.vAxis.min) / this.vAxis.range * this.size.y;

                    out.push({id: object.id, x: x, y: y});
                }

                return out;
            },
            objects: function () {
                return this._objects;
            },
            convertToReal: function (_vector) {
                return new Vector2(( _vector.x - this.hAxis.min) / this.hAxis.range * this.size.x, ( _vector.y - this.vAxis.min) / this.vAxis.range * this.size.y)
            },
            convertToVirtual: function (_vector) {
                return new Vector2(
                    _vector.x / this.size.x * this.hAxis.range + this.hAxis.min,
                    _vector.y / this.size.y * this.vAxis.range + this.vAxis.min,
                )
            },
            in: function (_vector) {
                return new Vector2(
                    _vector.x / this.size.x * this.hAxis.range,
                    _vector.y / this.size.y * this.vAxis.range,
                )
            }
        });

        return Magnifier;
    })    
})();