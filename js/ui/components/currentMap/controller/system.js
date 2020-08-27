(function () {
    var componentId = "ui/components/currentMap";

    var deps = [
        "env/tools/class",
        "env/tools/emitter",
    ];

    define(componentId, deps, function () {
        var classCreator  = require("env/tools/class");
        var Emitter       = require("env/tools/emitter");

        var SolarSystem = classCreator("System", Emitter, {
            constructor: function (_controller, _map, _mapId, _systemId) {
                Emitter.prototype.constructor.call(this);

                this.controller = _controller;
                this.map = _map;
                this.mapId = _mapId;
                this.systemId = _systemId;
                this._inited = false;
                this.position = null;
                this.info = Object.create(null);
            },
            init: function () {
                this._inited = true;

                this.info.x = this.info.position.x;
                this.info.y = this.info.position.y;

                this.markerId = this.map.createMarker(this.systemId, this.info);
            },
            deinit: function () {
                if(exist(this.markerId)) {
                    this.map.removeMarker(this.markerId);
                }

                this._inited = false;
                this.map = null;
                this.controller = null;
            },
            setPosition: function (_position) {
                this.position = _position;
            },
            updateInfo: function (_info) {
                this.info = extend(this.info, _info);
                this._inited && this.map.updateMarker(this.markerId, this.info);
            },
            updatePosition: function (_position) {
                this.position = _position;
                this.map.updateMarker(this.markerId, {
                    position: _position
                })
            }
        });

        return SolarSystem;
    });
})(window);

