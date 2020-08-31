(function () {
    var componentId = "ui/components/currentMap/controller/link";

    var deps = [
        "env/tools/class",
        "env/tools/emitter",
        "env/tools/extend",
    ];

    define(componentId, deps, function () {
        var classCreator  = require("env/tools/class");
        var Emitter       = require("env/tools/emitter");
        var extend        = require("env/tools/extend");

        var Link = classCreator("Link", Emitter, {
            constructor: function (_controller, _map, _mapId, _linkId) {
                Emitter.prototype.constructor.call(this);

                this.controller = _controller;
                this.map = _map;
                this.mapId = _mapId;
                this.linkId = _linkId;
                this.uiLinkId = null;
                this.info = Object.create(null);
                this._inited = false;
            },
            init: function () {
                this._inited = true;
                var sourceMarkerId = this.controller.systems[this.info.solarSystemSource].markerId;
                var targetMarkerId = this.controller.systems[this.info.solarSystemTarget].markerId;
                this.uiLinkId = this.map.createLink(this.linkId, sourceMarkerId, targetMarkerId);
            },
            deinit: function () {
                if(exist(this.uiLinkId)) {
                    this.map.removeLink(this.uiLinkId);
                }

                this._inited = false;
                this.uiLinkId = null;
                this.info = Object.create(null);
                this.map = null;
                this.controller = null;
            },
            updateInfo: function (_info) {
                this.info = extend(this.info, _info);
            }
        });

        return Link;
    });
})(window);

