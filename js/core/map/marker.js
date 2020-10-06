/**
 * Created by Aleksey Chichenkov <a.chichenkov@initi.ru> on 8/31/20.
 */

(function () {
    var moduleName = "core/map/marker"

    var deps = [
        "env/tools/class",
        "env/tools/extend",
        "env/tools/exist",
        "env/tools/print_f",
        "env/tools/emitter",
        "env/ui",
        "core/map/environment",
        "env/mouseObserver"
    ];

    define(moduleName, deps, function () {
        var classCreator    = require("env/tools/class");
        var extend          = require("env/tools/extend");
        var exist           = require("env/tools/exist");
        var print_f         = require("env/tools/print_f");
        var Emitter         = require("env/tools/emitter");
        var _ui             = require("env/ui");
        var environment     = require("core/map/environment");
        var MouseObserver   = require("env/mouseObserver");

        var Marker = classCreator("Marker", Emitter, {
            constructor: function (_options) {
                this.data = extend({

                }, _options);

                Emitter.prototype.constructor.call(this);

                this.markerDownHandler = this._onMarkerDown.bind(this);
                this.markerContextHandler = this._onMarkerContext.bind(this);
                this.createMarker();
                this.createMouseObserver();
            },
            destructor: function () {
                this.mo.destructor();
                this.mo = null;

                Emitter.prototype.destructor.call(this);
            },
            createMarker: function () {
                this.wrapper = _ui.fromText(`
<div class="eve-marker">
    <div class="eve-marker-body">
        <div class="eve-marker-first-row off-events">
            <div class="locked hidden"></div>
            <div class="effect-color hidden"></div>
            <div class="system-type"></div>
            <div class="system-name"></div>
            <div class="system-tag"></div>
        </div>
        <div class="eve-marker-second-row off-events">
            <div class="online">
                <div class="online-icon hidden"></div>    
                <div class="online-count hidden">${randomInt(0, 199)}</div>    
            </div>
            <div class="wormhole-statics"></div>
        </div>
    </div>
</div>
                `);


                this.wrapper.el.addEventListener("mousedown", this.markerDownHandler);
                this.wrapper.el.addEventListener("contextmenu", this.markerContextHandler);
            },
            createMouseObserver: function () {
                this.mo = new MouseObserver(this.wrapper.el);
                this.mo.on("mouseIn", this._onMouseIn.bind(this));
                this.mo.on("mouseOut", this._onMouseOut.bind(this));
            },
            update: function (_data) {
                var markerData = this.data;
                var markerEl = this.wrapper;

                if (exist(_data.name) && _data.name !== markerData.name) {
                    var systemNameEl = _ui.fromElement(markerEl.el.querySelector(".system-name"));
                    systemNameEl.text(_data.name);
                }

                if (exist(_data.tag) && _data.tag !== markerData.tag) {
                    var systemTagEl = _ui.fromElement(markerEl.el.querySelector(".system-tag"));
                    systemTagEl.text(_data.tag);
                }

                if (exist(_data.onlineCount) && _data.onlineCount !== markerData.onlineCount) {
                    var onlineIconEl = _ui.fromElement(markerEl.el.querySelector(".online-icon"));
                    var onlineCountEl = _ui.fromElement(markerEl.el.querySelector(".online-count"));
                    onlineCountEl.text(_data.onlineCount);
                    if(_data.onlineCount === 0) {
                        onlineIconEl.el.classList.add("hidden");
                        onlineCountEl.el.classList.add("hidden");
                    } else {
                        onlineIconEl.el.classList.remove("hidden");
                        onlineCountEl.el.classList.remove("hidden");
                    }
                }

                // todo ???
                if (exist(_data.systemType) && _data.systemData.effectType) {
                    var effectEl = _ui.fromElement(markerEl.el.querySelector(".effect-color"));
                    effectEl.el.classList.add(print_f("eve-wh-effect-color-%s", _data.systemData.effectType));
                    effectEl.el.classList.remove("hidden");
                }

                if (exist(_data.isLocked) && _data.isLocked !== markerData.isLocked) {
                    var lockedEl = _ui.fromElement(markerEl.el.querySelector(".locked"));
                    if (_data.isLocked)
                        lockedEl.el.classList.remove("hidden");
                    else
                        lockedEl.el.classList.add("hidden");
                }

                if (exist(_data.systemType) && _data.systemType !== markerData.systemType) {
                    var systemTypeEl = _ui.fromElement(markerEl.el.querySelector(".system-type"));
                    var colorClass = print_f("eve-system-color-%s", _data.systemType);
                    switch (_data.systemType) {
                        case 0:
                        case 1:
                        case 2:
                            colorClass = environment.securityClasses[_data.security];
                            break;
                        case 3:
                        case 4:
                            colorClass = environment.typeClasses[_data.systemData.typeName];
                            _data.systemData && _data.systemData.statics && this._createStatics(_data)
                            break;
                    }

                    systemTypeEl.el.classList.add(colorClass);
                    systemTypeEl.text(_data.systemData.typeName);
                }

                extend(this.data, _data);
            },
            _createStatics: function (/*_marker,*/ _data) {
                var systemTypeEl = _ui.fromElement(this.wrapper.el.querySelector(".wormhole-statics"));

                for (var a = 0; a < _data.systemData.statics.length; a++) {
                    var staticData = _data.systemData.statics[a];
                    var colorClass = environment.typeClasses[staticData.leadTo]
                    var staticEl = _ui.fromText(`<div class='static ${colorClass}'>${staticData.leadTo}</div>`)
                    systemTypeEl.append(staticEl);
                }
            },
            select: function (_isSelect) {
                if(!this.data.isLocked) {
                    this.data.isSelect = _isSelect;

                    if (_isSelect)
                        this.wrapper.el.classList.add("selected");
                    else
                        this.wrapper.el.classList.remove("selected");
                }
            },
            _onMarkerDown: function (_event) {
                this.emit("mousedown", _event);
            },
            _onMarkerContext: function (_event) {
                this.emit("contextmenu", _event);
            },
            _onMouseIn: function (_event){
                this.emit("mousein", _event);
            },
            _onMouseOut: function (_event){
                this.emit("mouseout", _event);
            },
        });

        return Marker;
    });
})();