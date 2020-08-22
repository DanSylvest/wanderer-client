/**
 * Created by Aleksey Chichenkov <rolahd@yandex.ru> on 2/12/20.
 */

(function () {
    var moduleName = "env/vector2";
    
    var deps = [
    ];
    
    define(moduleName, deps, function () {
        /**
         * Двухмерный вектор
         * @param _x
         * @param _y
         * @constructor
         */
        var Vector2 = function (_x, _y) {
            this.x = _x || 0;
            this.y = _y || 0;
        };

        Vector2.prototype = {
            addition: function (_v2) {
                this.x += _v2.x;
                this.y += _v2.y;
                return this;
            },
            subtraction: function (_v2) {
                this.x -= _v2.x;
                this.y -= _v2.y;
                return this;
            },
            clone: function () {
                return new Vector2(this.x, this.y);
            },
            multiply: function (_num) {
                this.x *= _num;
                this.y *= _num;
                return this;
            },
            divide: function (_num) {
                this.x /= _num;
                this.y /= _num;
                return this;
            },
            normalize: function () {
                var _amount = Math.sqrt(this.x * this.x + this.y * this.y);
                this.x /= _amount;
                this.y /= _amount;
                return this;
            },
            magnitude: function () {
                return Math.sqrt(this.x * this.x + this.y * this.y);
            },
            distance: function (_v2) {
                return Math.sqrt((this.x - _v2.x) * (this.x - _v2.x) + (this.y - _v2.y) * (this.y - _v2.y));
            },
            scalarBy: function (_v) {
                return this.x * _v.x + this.y * _v.y;
            },
            angleBy: function (_v) {
                return Math.acos(this.scalarBy(_v) / (this.magnitude() * _v.magnitude())) / Math.PI * 180
            },
            copy: function () {
                return new Vector2(this.x, this.y);
            },
            "+": function (_v) {
                var c = this.copy();
                c.x += _v.x;
                c.y += _v.y;
                return c;
            },
            "+=": function (_v) {
                this.x += _v.x;
                this.y += _v.y;
                return this;
            },
            "i+": function (_n) {
                var c = this.copy();
                c.x += _n;
                c.y += _n;
                return c;
            },
            "i+=": function (_n) {
                this.x += _n;
                this.y += _n;
                return this;
            },
            "-": function (_v) {
                var c = this.copy();
                c.x -= _v.x;
                c.y -= _v.y;
                return c;
            },
            "-=": function (_v) {
                this.x -= _v.x;
                this.y -= _v.y;
                return this;
            },
            "*": function (_number) {
                var c = this.copy();
                c.x *= _number;
                c.y *= _number;
                return c;
            },
            "*=": function (_number) {
                this.x *= _number;
                this.y *= _number;
                return this;
            },
            "/": function (_number) {
                var c = this.copy();
                c.x /= _number;
                c.y /= _number;
                return c;
            },
            "/=": function (_number) {
                this.x /= _number;
                this.y /= _number;
                return this;
            },
            "==": function (_v) {
                return this.x === _v.x && this.y === _v.y;
            },
            "!=": function (_v) {
                return this.x !== _v.x || this.y !== _v.y;
            },

            ">": function (_v) {
                return this.y > _v.y || (this.y === _v.y && this.x > _v.x);
            },
            "<": function (_v) {
                return this.y < _v.y || (this.y === _v.y && this.x < _v.x);
            },
            ">=": function (_v) {
                return this[">"](_v) || this["=="](_v);
            },
            "<=": function (_v) {
                return this["<"](_v) || this["=="](_v);
            },
            isInsideRect: function (x, y, w, h) {
                return this.x >= x && this.x < x + w && this.y >= y && this.y < y + h;
            }
        };
        Vector2.addition = function (_v1, _v2) {
            return new Vector2(_v1.x + _v2.x, _v1.y + _v2.y);
        };
        Vector2.subtraction = function (_v1, _v2) {
            return new Vector2(_v1.x - _v2.x, _v1.y - _v2.y);
        };
        Vector2.divide = function (_v1, _num) {
            return new Vector2(_v1.x / _num, _v1.y / _num);
        };

        // для нахождения с какой стороны находится точка
        Vector2.equationDirect = function (_v1, _v2, _v3) {
            var vector = Vector2.subtraction(_v2, _v1);
            var C = vector.y * _v1.x - vector.x * _v1.y;
            return -vector.y * _v3.x + vector.x * _v3.y + C;
        };

        Vector2.crossLine = function (a, b, c, d) {
            var v = Vector2.subtraction(b, a);
            var w = Vector2.subtraction(d, c);
            var x = (v.y * a.x / v.x - a.y - w.y * c.x / w.x + c.y) / ((v.y / v.x) - (w.y / w.x));
            var y = (v.y / v.x) * x - (v.y * a.x / v.x - a.y);
            return new Vector2(x, y);
        };

        Vector2.checkSegment = function (_crossPoint, _v1, _v2) {
            var a = new Vector2(Math.min(_v1.x, _v2.x), Math.min(_v1.y, _v2.y));
            var b = new Vector2(Math.max(_v1.x, _v2.x), Math.max(_v1.y, _v2.y));
            var hor = _crossPoint.x >= a.x && _crossPoint.x <= b.x;
            var vert = _crossPoint.y >= a.y && _crossPoint.y <= b.y;
            return hor && vert;

        };

        Vector2.findCrossLine = function (_v1, _v2, _v3, _v4) {
            var v = Vector2.subtraction(_v2, _v1);
            var w = Vector2.subtraction(_v4, _v3);

            var crossPoint = Vector2.crossLine(_v1, _v2, _v3, _v4);
            var isCrossSegmentA = Vector2.checkSegment(crossPoint, _v1, _v2);
            var isCrossSegmentB = Vector2.checkSegment(crossPoint, _v3, _v4);

            return {
                isParallel: v.x / w.x === v.y / w.y,
                isCrossSegment: isCrossSegmentA && isCrossSegmentB,
                crossPoint: crossPoint
            }
        };

        Vector2.findCrossingInPolygon = function (_polygon, _p1, _p2) {
            var crossCount = 0;
            var a = 0;
            while (a < _polygon.length) {
                var point1 = _polygon[a];
                var point2 = _polygon[a + 1];
                if (a === _polygon.length - 1) {
                    point2 = _polygon[0];
                }

                var cross = Vector2.findCrossLine(_p1, _p2, point1, point2);
                if (!cross.isParallel && cross.isCrossSegment) {
                    crossCount++;
                }
                a++;
            }
            return crossCount % 2 === 1;
        };

        /**
         * Поворот вектора на угол
         * @param _v2
         * @param _angle
         */
        Vector2.rotate = function (_v2, _angle) {
            var rv2 = new Vector2(0, 0);
            var a = _angle / 180 * Math.PI;
            rv2.x = _v2.x * Math.cos(a) - _v2.y * Math.sin(a);
            rv2.y = _v2.x * Math.sin(a) + _v2.y * Math.cos(a);
            return rv2;
        };

        Vector2.rotate_rad = function (_v2, _angle) {
            var rv2 = new Vector2(0, 0);
            rv2.x = _v2.x * Math.cos(_angle) - _v2.y * Math.sin(_angle);
            rv2.y = _v2.x * Math.sin(_angle) + _v2.y * Math.cos(_angle);
            return rv2;
        };

        Vector2.findAngle = function (A, B, C) {
            var a = B.distance(C);
            var b = A.distance(C);
            var c = A.distance(B);

            return Math.acos((b * b + c * c - a * a) / (2 * b * c));
        };

        Vector2.pointOnLine = function (_point, _lineA, _lineB) {
            var angleFirst = Vector2.findAngle(_lineA, _point, _lineB);
            var angleSecond = Vector2.findAngle(_lineB, _lineA, _point);

            if(angleFirst > Math.PI / 2 || angleSecond > Math.PI / 2) {
                return false;
            }

            return (angleFirst + angleSecond) / Math.PI < 0.15;
        };

        Vector2.angleBetween = function (source, target) {
            var side = target["-"](source).x > 0 ? 1: -1

            var A = source.copy();
            var B = target.copy();
            var C = new Vector2(A.x, A.y + 10);
            var angleByTarget = Vector2.findAngle(A, B, C) / Math.PI * 180;
            angleByTarget !== angleByTarget && (angleByTarget = 180);
            angleByTarget *= -side;

            if(angleByTarget < 0) {
                angleByTarget = 180 + (180 - Math.abs(angleByTarget))
            }

            return angleByTarget
        }

        return Vector2;
    })    
})();