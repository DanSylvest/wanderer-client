import Emitter from "../../../../js/env/tools/emitter";
import extend from "../../../../js/env/tools/extend";
import exists from "../../../../js/env/tools/exists";

class System extends Emitter {
    constructor (_controller, _map, _mapId, _systemId) {
        super();

        this.controller = _controller;
        this.map = _map;
        this.mapId = _mapId;
        this.systemId = _systemId;
        this._inited = false;
        this.position = null;
        this.info = Object.create(null);
    }
    init () {
        this._inited = true;

        this.info.x = this.info.position.x;
        this.info.y = this.info.position.y;

        this.markerId = this.map.createMarker(this.systemId, this.info);
    }
    deinit () {
        if(exists(this.markerId)) {
            this.map.removeMarker(this.markerId);
        }

        this._inited = false;
        this.map = null;
        this.controller = null;
    }
    setPosition (_position) {
        this.position = _position;
    }
    updateInfo (_info) {
        this.info = extend(this.info, _info);
        this._inited && this.map.updateMarker(this.markerId, _info);
    }
    updatePosition (_position) {
        this.position = _position;
        this.map.updateMarker(this.markerId, {
            position: _position
        })
    }
}

export default System;