/**
 * Created by Aleksey Chichenkov <cublakhan257@gmail.com> on 2/12/20.
 */

(function () {
    var moduleName = "env/polygon";
    
    var deps = [
        "env/vector2",
        "env/tools/class"
    ];
    
    define(moduleName, deps, function () {
        var Vector2      = require("env/vector2");
        var classCreator = require("env/tools/class");

        var Polygon = classCreator("Polygon", null, {
            constructor: function (_arr) {
                this.data = _arr;
            },
            intersectsWithPolygon: function (_polygon) {
                var isIntersects = false;
                this.each(function (aFirst, aSecond) {
                    _polygon.each(function (bFirst, bSecond) {
                        if (!isIntersects)
                            isIntersects = Polygon.intersects(aFirst.x, aFirst.y, aSecond.x, aSecond.y, bFirst.x, bFirst.y, bSecond.x, bSecond.y);

                        return isIntersects;
                    });
                    return isIntersects;
                });

                return isIntersects;
            },
            each: function (_callback) {
                for (var a = 1; a < this.data.length; a++) {
                    var pointFirst = this.data[a - 1];
                    var pointSecond = this.data[a];

                    if(this.data.length - 1 === a) {
                        pointFirst = this.data[a];
                        pointSecond = this.data[0];
                    }

                    if(_callback(pointFirst, pointSecond))
                        return;
                }
            }
        });

        Polygon.intersects = function (a,b,c,d,p,q,r,s) {
            var det, gamma, lambda;
            det = (c - a) * (s - q) - (r - p) * (d - b);
            if (det === 0) {
                return false;
            } else {
                lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
                gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
                return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
            }
        };

        return Polygon;
    })    
})();