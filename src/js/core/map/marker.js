/**
 * Created by Aleksey Chichenkov <cublakhan257@gmail.com> on 8/31/20.
 */
import Emitter from "../../env/tools/emitter";
import extend from "../../env/tools/extend";
import _ui from "../../env/ui";
import MouseObserver from "../../env/mouseObserver";
import exists from "../../env/tools/exists";
import printf from "../../env/tools/printf";
import environment from "./environment";
import ActionObserver from "../../env/actionObserver.js";

class Marker extends Emitter{
    constructor (_options) {
        super();

        this.data = extend({
            shade: false
        }, _options);

        this._enableActions = true;

        this.markerTouchStartHandler = this._onMarkerTouchStart.bind(this);
        this.markerDownHandler = this._onMarkerDown.bind(this);
        this.markerContextHandler = this._onMarkerContext.bind(this);
        this.createMarker();
        this.createMouseObserver();
    }
    destructor () {
        this.mo.destructor();
        this.mo = null;

        Emitter.prototype.destructor.call(this);
    }
    createMarker () {
        this.wrapper = _ui.fromText(`
            <div class="eve-marker">
                <div class="eve-marker-body">
                    <div class="eve-marker-first-row off-events">
                        <div class="effect-color hidden"></div>
                        <div class="system-type"></div>
                        <div class="system-name"></div>
                        <div class="system-tag"></div>
                    </div>
                    <div class="eve-marker-second-row off-events">
                        <div class="extra">
                            <div class="locked hidden"></div>
                            <div class="marked-as-hub hidden"></div>
                            <div class="online hidden">
                                <div class="online-icon"></div>    
                                <div class="online-count">${Number.randomInt(0, 199)}</div>                           
                            </div>
                        </div>
                        <div class="wormhole-statics"></div>
                    </div>
                </div>
            </div>
        `);

        this.wrapper.el.addEventListener("touchstart", this.markerTouchStartHandler);
        this.wrapper.el.addEventListener("mousedown", this.markerDownHandler);
        this.wrapper.el.addEventListener("contextmenu", this.markerContextHandler);
    }
    createMouseObserver () {
        this.mo = new MouseObserver(this.wrapper.el, 300);
        this.mo.on("mouseIn", this._onMouseIn.bind(this));
        this.mo.on("mouseOut", this._onMouseOut.bind(this));

        this.moLazy = new MouseObserver(this.wrapper.el, 1000);
        this.moLazy.on("mouseIn", this._onMouseInLazy.bind(this));
        this.moLazy.on("mouseOut", this._onMouseOutLazy.bind(this));
    }

    /**
     *
     * @param _data {Object}
     * @param _data.tag {string}
     * @param _data.isLocked {boolean}
     * @param _data.name {string}
     * @param _data.security {string}
     * @param _data.systemType {number}
     * @param _data.onlineCount {number}
     * @param _data.effectType {number}
     * @param _data.typeName {number}
     * @param _data.statics {Array}
     */
    update (_data) {
        let markerData = this.data;
        let markerEl = this.wrapper;

        if(!exists(_data.position) && !exists(markerData.position)) {
            markerEl.classAdd("hidden");
        }

        if(exists(_data.position)) {
            markerEl.classRemove("hidden")
        }

        if (exists(_data.name) && _data.name !== markerData.name) {
            let systemNameEl = _ui.fromElement(markerEl.el.querySelector(".system-name"));
            systemNameEl.text(_data.name);
        }

        if (exists(_data.tag) && _data.tag !== markerData.tag) {
            let systemTagEl = _ui.fromElement(markerEl.el.querySelector(".system-tag"));
            systemTagEl.text(_data.tag);
        }

        if (exists(_data.onlineCount) && _data.onlineCount !== markerData.onlineCount) {
            let onlineEl = _ui.fromElement(markerEl.el.querySelector(".online"))
            let onlineCountEl = _ui.fromElement(markerEl.el.querySelector(".online-count"));
            onlineCountEl.text(_data.onlineCount);
            _data.onlineCount === 0 ? onlineEl.classAdd("hidden") : onlineEl.classRemove("hidden");
        }

        if(exists(_data.status)) {
            markerEl.classRemove.apply(markerEl, environment.statuses.map(x => `system-status-${x.id}`));
            markerEl.classAdd(`system-status-${environment.statuses[_data.status].id}`);
        }

        if(exists(_data.isHub)) {
            let hubEl = _ui.fromElement(markerEl.el.querySelector(".marked-as-hub"));
            _data.isHub ? hubEl.classRemove("hidden") : hubEl.classAdd("hidden");
        }

        if(_data.effectType !== "") {
            if (exists(_data.systemType) && _data.systemType === 3) {
                let effectEl = _ui.fromElement(markerEl.el.querySelector(".effect-color"));
                effectEl.classAdd(printf("eve-wh-effect-color-%s", _data.effectType));
                effectEl.classRemove("hidden");
            }

            let bodyEl;
            switch(_data.effectType) {
                case "dazhLiminalityLocus":
                    bodyEl = _ui.fromElement(markerEl.el.querySelector(".eve-marker-body"));
                    bodyEl.classRemove("edencom");
                    bodyEl.classAdd("triglavian");
                    break;
                case "imperialStellarObservatory":
                case "stateStellarObservatory":
                case "republicStellarObservatory":
                case "federalStellarObservatory":
                    bodyEl = _ui.fromElement(markerEl.el.querySelector(".eve-marker-body"));
                    bodyEl.classRemove("triglavian");
                    bodyEl.classAdd("edencom");
                    break;
            }
        }

        if (exists(_data.isLocked) && _data.isLocked !== markerData.isLocked) {
            let lockedEl = _ui.fromElement(markerEl.el.querySelector(".locked"));
            _data.isLocked ? lockedEl.classRemove("hidden") : lockedEl.classAdd("hidden")
        }

        if (exists(_data.systemType) && _data.systemType !== markerData.systemType) {
            let systemTypeEl = _ui.fromElement(markerEl.el.querySelector(".system-type"));
            let colorClass = "";
            switch (_data.systemType) {
                case 0:
                case 1:
                case 2:
                    colorClass = environment.securityForegroundClasses[_data.security];
                    break;
                case 3:
                case 4:
                    colorClass = environment.typeClasses[_data.typeName];
                    _data.statics && this._createStatics(_data.statics)
                    break;
                case 5:
                case 6:
                case 7:
                    colorClass = environment.kindClassed[_data.systemType];
                    break;
            }

            systemTypeEl.classAdd(colorClass);
            systemTypeEl.text(_data.typeName);
        }

        extend(this.data, _data);
    }
    /**
     *
     * @param _statics {Array<{type: String}>}
     * @private
     */
    _createStatics (_statics) {
        let systemTypeEl = _ui.fromElement(this.wrapper.el.querySelector(".wormhole-statics"));

        for (let a = 0; a < _statics.length; a++) {
            let staticData = _statics[a];
            let colorClass = environment.typeClasses[staticData.type]
            let staticEl = _ui.fromText(`<div class='static ${colorClass}'>${staticData.type}</div>`)
            systemTypeEl.append(staticEl);
        }
    }
    select (_isSelect) {
        if (!this.data.isLocked) {
            this.data.isSelect = _isSelect;
            _isSelect ? this.wrapper.classAdd("selected") : this.wrapper.classRemove("selected")
        }
    }
    isMarkerSelected () {
        return this.data.isSelect;
    }
    setActive (isActive) {
        this.data.isActive = isActive;
        isActive ? this.wrapper.classAdd("active") : this.wrapper.classRemove("active")
    }
    _onMarkerTouchStart (event) {
        if (!this._enableActions)
            return;

        this.emit("mousedown", extend(ActionObserver.copyTouchEvent(event), ActionObserver.copyTouch(event.touches[0])));
    }
    _onMarkerDown (_event) {
        if(!this._enableActions)
            return;

        this.emit("mousedown", _event);
    }
    _onMarkerContext (_event) {
        if(!this._enableActions)
            return;

        this.emit("contextmenu", _event);
    }
    _onMouseIn (_event){
        if(!this._enableActions)
            return;

        let bounds = this.wrapper.el.getBoundingClientRect();

        this.emit("mousein", {
            x: bounds.x,
            y: bounds.y + bounds.height,
            originalEvent: _event
        });
    }
    _onMouseOut (_event){
        if(!this._enableActions)
            return;

        this.emit("mouseout", _event);
    }
    _onMouseInLazy (_event) {
        if(!this._enableActions)
            return;

        let bounds = this.wrapper.el.getBoundingClientRect();
        this.emit("mouseinLazy", {
            x: bounds.x,
            y: bounds.y + bounds.height,
            originalEvent: _event
        });
    }
    _onMouseOutLazy (_event){
        if(!this._enableActions)
            return;

        this.emit("mouseoutLazy", _event);
    }
    enableShade (_bool) {
        this.data.shade = _bool;

        if(_bool)
            this.wrapper.el.classList.add("shaded");
        else
            this.wrapper.el.classList.remove("shaded");

    }
    enableActions (bool) {
        this._enableActions = bool;

        this.emit("mouseoutLazy");
        this.emit("mouseout");
    }
}

export default Marker;