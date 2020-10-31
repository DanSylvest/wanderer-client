import Emitter from "../../../../js/env/tools/emitter";
import extend from "../../../../js/env/tools/extend";
import exists from "../../../../js/env/tools/exists";

class Link extends Emitter {
    constructor (_controller, _map, _mapId, _linkId) {
        super();

        this.controller = _controller;
        this.map = _map;
        this.mapId = _mapId;
        this.linkId = _linkId;
        this.uiLinkId = null;
        this.info = Object.create(null);
        this._inited = false;
    }
    init () {
        this._inited = true;
        let sourceMarkerId = this.controller.systems[this.info.solarSystemSource].markerId;
        let targetMarkerId = this.controller.systems[this.info.solarSystemTarget].markerId;
        this.uiLinkId = this.map.createLink(this.linkId, sourceMarkerId, targetMarkerId);
        this.map.updateLink(this.uiLinkId, this.info);
    }
    deinit () {
        if(exists(this.uiLinkId)) {
            this.map.removeLink(this.uiLinkId);
        }

        this._inited = false;
        this.uiLinkId = null;
        this.info = Object.create(null);
        this.map = null;
        this.controller = null;
    }
    updateInfo (_info) {
        this.info = extend(this.info, _info);
        this._inited && this.map.updateLink(this.uiLinkId, _info);
    }
}

export default Link;
