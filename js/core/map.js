(function () {
    var moduleName = "core/map";

    var deps = [
        "env/tools/class",
        "env/tools/extend",
        "env/tools/exist",
        "env/tools/emitter",
        "env/tools/print_f",
        "env/spamFilter",
        "libs/d3",
        "env/vector2",
        "env/polygon",
        "env/rectangle",
        "env/magnifier",
        "env/actionObserver",
        "libs/d3/collideRect",
        "libs/d3/rectForce",
    ];

    define(moduleName, deps, function () {
        var classCreator    = require("env/tools/class");
        var extend          = require("env/tools/extend");
        var exist           = require("env/tools/exist");
        var print_f         = require("env/tools/print_f");
        var Emitter         = require("env/tools/emitter");
        var SpamFilter      = require("env/spamFilter");
        var d3              = require("libs/d3");
        d3.collideRect      = require("libs/d3/collideRect");
        d3.rectForce        = require("libs/d3/rectForce");

        var Vector2         = require("env/vector2");
        var Polygon         = require("env/polygon");
        var Rectangle       = require("env/rectangle");
        var Magnifier       = require("env/magnifier");
        var ActionObserver  = require("env/actionObserver");

        var w = 120;
        var h = 30;

        var strength  = -10;
        var linkDistance = w * 1.2;
        var bodyDistanceMax = w * 15;
        var bodyDistanceMin = null;

        var counter = 0;
        var Map = classCreator("Map", Emitter, {
            constructor: function Map(_options) {
                var base = extend({
                    container: null,
                    width: null,
                    height: null
                }, _options);

                Emitter.prototype.constructor.call(this);

                this._markers = Object.create(null);
                this._links = Object.create(null);

                this.width = base.width;
                this.height = base.height;
                this.container = base.container;

                this._forceLinks = [];
                this._forceEnable = false;

                this._reqId = -1;
                this._refresHandler = this.refresh.bind(this);

                this._upgradeSvg();
                this._createMap();
                // this._test();

                this._createActionObservers();

                window.addEventListener("resize", this._refresHandler);

                this._sfForce = new SpamFilter(this.startForce.bind(this), 10);
                this._onSimulationTick();
            },
            destructor: function () {
                window.removeEventListener("resize", this._refresHandler);

                this._sfForce.stop();
                this._sfForce = null;

                this.container.removeChild(this.svg.el);
                this.container.removeChild(this.htmlContainer.el);
                this.container.classList.remove("eve-marker-root-container");

                if(this._reqId !== -1) {
                    cancelAnimationFrame(this._reqId);
                    this._reqId = -1;
                }

                this._markers = Object.create(null);
                this._forceLinks = [];
                this._forceEnable = false;

                this._ao && this._ao.destructor();
                this._ao = null;
                this._ao2 && this._ao2.destructor();
                this._ao2 = null;
                this.magnifier && this.magnifier.destructor();
                this.magnifier = null;
                this.simulation && this.simulation.stop();
                this.simulation = null;

                Emitter.prototype.destructor.call(this);
            },
            clear: function () {

            },
            _createActionObservers: function () {
                this._ao2 = new ActionObserver({
                    offOnOut: false,
                    container: this.svg.el,
                    mdCondition: function (_event) {
                        return !_event.originalEvent.ctrlKey && !this.findMarker(_event.mouse);
                    }.bind(this)
                });

                var rlStarted = null;
                var savedAxis = null;

                this._ao2.on("click", function () {
                    this.emit("mapClicked");
                }.bind(this));

                this._ao2.on("dragStart", function (_event) {
                    this.emit("dragStarted");
                    rlStarted = _event.mouse;
                    savedAxis = new Vector2(this.magnifier.hAxis.min, this.magnifier.vAxis.min);

                    this.render();
                }.bind(this));

                this._ao2.on("dragging", function (_event) {
                    var curReal = _event.mouse;

                    var rDelta = curReal["-"](rlStarted);
                    var v = this.magnifier.in(rDelta);

                    this.magnifier.hAxis.min = savedAxis.x - v.x;
                    this.magnifier.vAxis.min = savedAxis.y - v.y;

                    this.render();
                }.bind(this));

                this._ao2.on("dragEnd", function (_event) {

                    this.render();
                }.bind(this));
            },
            _upgradeSvg: function () {
                this.svg = new _ui("svg").attr({
                    baseProfile: "full",
                    xmlns: "http://www.w3.org/2000/svg"
                });
                this.container.appendChild(this.svg.el);

                this.htmlContainer = new _ui("div");
                this.htmlContainer.el.classList.add("eve-marker-container")
                this.container.appendChild(this.htmlContainer.el);

                this.container.classList.add("eve-marker-root-container");

                this.linksLayer = new _ui("g");

                this.svg.append(this.linksLayer);
                this.svg.attr("width", this.width);
                this.svg.attr("height", this.height);
            },
            _createMap: function () {
                this.magnifier = new Magnifier();
                this.magnifier.setSize(this.width, this.height);
                this.magnifier.toCenter();
            },
            createMarker: function (customId, _options) {
                var base = extend({
                    customId: customId,
                    name: "",
                    sizeMultiplier: 0,
                    size: 15,
                    isLocked: false,
                    x: randomFloat(this.width / 2 * -1, this.width / 2),
                    y: randomFloat(this.height / 2 * -1, this.height / 2),
                }, _options);

                var mid = counter++;

                var markerElement = _ui.fromText(`
<div class="eve-marker">
    <div class="eve-marker-body">
        <div class="eve-marker-first-row off-events">
            <div class="locked hidden"></div>
            <div class="effect-color hidden"></div>
            <div class="system-type"></div>
            <div class="system-name"></div>
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

                this.htmlContainer.append(markerElement);

                var markerDownHandler = this._onMarkerDown.bind(this, mid);
                var markerContextHandler = this._onMarkerContext.bind(this, mid);
                markerElement.el.addEventListener("mousedown", markerDownHandler);
                markerElement.el.addEventListener("contextmenu", markerContextHandler);

                this._markers[mid] = {
                    isSelect: false,
                    customId: customId,
                    marker: markerElement,
                    markerDownHandler: markerDownHandler,
                    markerContextHandler: markerContextHandler,
                };

                this.magnifier.addObject({
                    id: mid,
                    fx: base.isLocked ? base.position.x : null,
                    fy: base.isLocked ? base.position.y : null,
                    x: base.position.x,
                    y: base.position.y,

                });

                this.updateMarker(mid, base);

                return mid;
            },
            updateMarker: function (_markerId, _data) {
                var markerData = this._markers[_markerId];

                var markerEl = markerData.marker;
                if (exist(_data.name) && _data.name !== markerData.name) {
                    var systemNameEl = _ui.fromElement(markerEl.el.querySelector(".system-name"));
                    systemNameEl.text(_data.name);
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
                    var obj = this.magnifier.objects().searchByObjectKey("id", _markerId);
                    obj.lock = _data.isLocked;
                    if(_data.isLocked) {
                        obj.fx = obj.x;
                        obj.fy = obj.y;
                    } else {
                        obj.fx = undefined;
                        obj.fy = undefined;
                    }

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
                            colorClass = securityClasses[_data.security];
                            break;
                        case 3:
                        case 4:
                            colorClass = typeClasses[_data.systemData.typeName];
                            _data.systemData && _data.systemData.statics && this._createStatics(markerData.marker, _data)
                            break;
                    }

                    systemTypeEl.el.classList.add(colorClass);
                    systemTypeEl.text(_data.systemData.typeName);
                }

                if (exist(_data.position) && markerData.position && (_data.position.x !== markerData.position.x || _data.position.y !== markerData.position.y)) {
                    var obj = this.magnifier.objects().searchByObjectKey("id", _markerId);
                    obj.x = _data.position.x;
                    obj.y = _data.position.y;
                }

                extend(markerData, _data);

                this._sfForce.call();
            },
            _onMarkerDown: function (_markerId, _event) {
                this._ao = new ActionObserver({
                    container: this.svg.el,
                    offOnOut: false,
                    mdCondition: function (_event) {
                        return !_event.originalEvent.ctrlKey && this.findMarker(_event.mouse);
                    }.bind(this)
                });

                this._ao._onMouseDown(_event);

                this._ao.on("click", function (_event) {
                    _event.originalEvent.stopPropagation();
                    this._onMarkerClick(_event.subject.id, _event.originalEvent);
                }.bind(this));

                var dragOffset = new Vector2();
                this._ao.on("dragStart", function (_event) {
                    if(this._markers[_event.subject.id].isLocked) {
                        return;
                    }

                    this._markers[_event.subject.id].marker.el.classList.add("eve-zInd-top");

                    this.simulation.alphaTarget(0.3).restart();

                    var virtual = this.magnifier.convertToVirtual(_event.mouse);
                    var subjectPos = new Vector2(_event.subject.x, _event.subject.y);
                    dragOffset = virtual["-"](subjectPos)

                    this.render();
                }.bind(this));

                this._ao.on("dragging", function (_event) {
                    if(this._markers[_event.subject.id].isLocked) {
                        return;
                    }

                    var virtual = this.magnifier.convertToVirtual(_event.mouse);
                    virtual["-="](dragOffset);

                    _event.subject.fx = virtual.x;
                    _event.subject.fy = virtual.y;

                    var markerData = this._markers[_event.subject.id];
                    markerData.position.x = virtual.x;
                    markerData.position.y = virtual.y;

                    this.render();

                }.bind(this));

                this._ao.on("dragEnd", function (_event) {
                    if(this._markers[_event.subject.id].isLocked) {
                        return;
                    }

                    this.simulation.alphaTarget(0);

                    this._markers[_event.subject.id].marker.el.classList.remove("eve-zInd-top");

                    var markerData = this._markers[_event.subject.id];
                    if(!markerData.isLocked) {
                        _event.subject.fx = null;
                        _event.subject.fy = null;
                    }

                    requestAnimationFrame(function () {
                        this._ao.destructor();
                        this._ao = null;
                    }.bind(this));

                    this.render();
                }.bind(this));
            },
            removeMarker: function (_markerId) {
                var markerData = this._markers[_markerId];

                markerData.marker.el.removeEventListener("mousedown", markerData.markerDownHandler);
                markerData.marker.el.removeEventListener("contextmenu", markerData.markerContextHandler);
                this.htmlContainer.remove(markerData.marker);
                this.magnifier.removeObject(_markerId);
                delete this._markers[_markerId];

                this._forceLinks = this.forceLinks();
                this._sfForce.call();
            },
            _createStatics: function (_marker, _data) {
                var systemTypeEl = _ui.fromElement(_marker.el.querySelector(".wormhole-statics"));

                for (var a = 0; a < _data.systemData.statics.length; a++) {
                    var staticData = _data.systemData.statics[a];
                    var colorClass = typeClasses[staticData.leadTo]
                    var staticEl = _ui.fromText(`<div class='static ${colorClass}'>${staticData.leadTo}</div>`)
                    systemTypeEl.append(staticEl);
                }
            },
            createLink: function (_customId, _source, _target) {
                var mid = counter++;

                var element = new _ui("line").attr({class: "map-link off-events"});
                var element2 = new _ui("line").attr({class: "map-link-under"});

                this.linksLayer.append(element2);
                this.linksLayer.append(element);

                element2.el.addEventListener("click", this._onLinkClick.bind(this, mid));
                element2.el.addEventListener("contextmenu", this._onLinkContext.bind(this, mid));

                this._links[mid] = {
                    customId: _customId,
                    element: element,
                    element2: element2,
                    source: _source,
                    target: _target,
                };

                this._forceLinks = this.forceLinks();
                this._sfForce.call();

                return mid;
            },
            removeLink: function (_linkId) {
                var linkData = this._links[_linkId];

                this.linksLayer.remove(linkData.element);
                this.linksLayer.remove(linkData.element2);

                delete this._links[_linkId];

                this._sfForce.call();
            },
            enableForce: function (_bool) {
                this._forceEnable = _bool;
                this._sfForce.call();
            },
            collectPositions: function () {
                var out = [];

                var nodes = this.magnifier.objects();

                for (var a = 0; a < nodes.length; a++) {
                    var nodeInfo = nodes[a];
                    var markerInfo = this._markers[nodeInfo.id];
                    out.push({markerId: nodeInfo.id, id: markerInfo.customId, x: nodeInfo.x, y: nodeInfo.y});
                }

                return out;
            },
            _onMarkerClick: function (_markerId, _event) {
                var markerData = this._markers[_markerId];
                this.emit("markerClicked", markerData.customId, _event);
            },
            _onMarkerContext: function (_markerId, _event) {
                _event.stopPropagation();
                _event.preventDefault();

                var markerData = this._markers[_markerId];
                this.emit("systemContextMenu", markerData.customId, _event);
            },
            _onLinkClick: function (_linkId) {
                var linkData = this._links[_linkId];
                debugger;
            },
            _onLinkContext: function (_linkId, _event) {
                _event.stopPropagation();
                _event.preventDefault();

                var linkData = this._links[_linkId];

                this.emit("linkContextMenu", linkData.customId, _event);
            },
            startForce: function () {
                this.simulation && this.simulation.stop();
                this.simulation = d3.forceSimulation(this.magnifier.objects());
                this.simulation.force("kek2", d3.collideRect(w, h));

                if(this._forceEnable) {
                    var linkForce = d3.forceLink(this._forceLinks).id(function (d) {
                        return d.id;
                    });
                    linkForce.strength(0.17);
                    linkForce.distance(function (d) {
                        var src = this.countLinksForNode(d.source.id);
                        var trg = this.countLinksForNode(d.target.id);

                        var log = Math.log(Math.min(src, trg));
                        if (log < 1) log = 0.8;

                        var min = log * linkDistance;

                        return min;
                    }.bind(this));

                    this.simulation.force("link", linkForce);

                    this.simulation.force("charge", d3.forceManyBody().strength(function (d) {
                        return 10 / (this.countLinksForNode(d.id) || 1) * strength
                    }.bind(this)));
                }

                this.simulation.on("tick", this._onSimulationTick.bind(this));
            },
            countLinksForNode: function (_nodeId) {
                var count = 0;
                this._forceLinks.map(function (_link) {
                    if(_link.target.id === _nodeId || _link.source.id === _nodeId) {
                        count++;
                    }
                });
                return count;
            },
            findMarker: function (_v2) {
                var reals = this.magnifier.getReal();

                for (var a = 0; a < reals.length; a++) {
                    var node = reals[a];
                    if (_v2.isInsideRect(node.x - w / 2, node.y - h / 2, w, h)) {
                        return this.magnifier.objects().searchByObjectKey("id", node.id);
                    }
                }

                return null;
            },
            forceLinks: function () {
                var out = [];

                for (var lid in this._links) {
                    out.push({
                        source: this._links[lid].source,
                        target: this._links[lid].target,
                        id: lid,
                    })
                }

                return out;
            },
            _onSimulationTick: function () {
                this.magnifier.objects().map(function (_obj) {
                    this._markers[_obj.id].x = _obj.x;
                    this._markers[_obj.id].y = _obj.y;
                }.bind(this));

                this.render();
            },

            render: function () {
                if(this._lock)
                    return;

                this._lock = true;

                this._reqId = requestAnimationFrame(function () {
                    this._render();
                    this._lock = false;
                }.bind(this));
            },
            _render: function () {
                var realCoords = this.magnifier.getReal();

                this._forceLinks.forEach(function (_link) {
                    var linkData = this._links[_link.id];

                    var sourceMarker = this._markers[linkData.source];
                    var targetMarker = this._markers[linkData.target];

                    var source = this.magnifier.convertToReal(new Vector2(sourceMarker.x, sourceMarker.y));
                    var target = this.magnifier.convertToReal(new Vector2(targetMarker.x, targetMarker.y));

                    // var angleByTarget = Vector2.angleBetween(source, target);
                    // var angleBySource = Vector2.angleBetween(target, source);
                    //
                    // var cp1 = null, cp2 = null;
                    // // Render source point
                    // if(angleByTarget >= 315 && angleByTarget < 360 || angleByTarget >= 0 && angleByTarget < 45) {
                    //     source.y += h / 2;
                    //     target.y -= h / 2;
                    //     cp1 = new Vector2(source.x, target.y);
                    //     cp2 = new Vector2(target.x, source.y);
                    // } else if(angleByTarget >= 135 && angleByTarget < 225) {
                    //     source.y -= h / 2;
                    //     target.y += h / 2;
                    //     cp1 = new Vector2(source.x, target.y);
                    //     cp2 = new Vector2(target.x, source.y);
                    // } else if(angleByTarget >= 45 && angleByTarget < 135) {
                    //     source.x -= w / 2;
                    //     target.x += w / 2;
                    //     cp1 = new Vector2(target.x, source.y);
                    //     cp2 = new Vector2(source.x, target.y);
                    // } else if (angleByTarget >= 225 && angleByTarget < 315) {
                    //     source.x += w / 2;
                    //     target.x -= w / 2;
                    //     cp1 = new Vector2(target.x, source.y);
                    //     cp2 = new Vector2(source.x, target.y);
                    // }

                    linkData.element.attr({
                        // d:print_f("M%s,%s C%s,%s %s,%s %s,%s", source.x, source.y, cp1.x, cp1.y, cp2.x, cp2.y, target.x, target.y),
                        x1: source.x,
                        y1: source.y,
                        x2: target.x,
                        y2: target.y,
                    });
                    // Render source point

                    linkData.element2.attr({
                        // d: print_f("M100,250 C100,100 351,211 306,273 Z"),
                        x1: source.x,
                        y1: source.y,
                        x2: target.x,
                        y2: target.y,
                    });
                }.bind(this));


                realCoords.forEach(function (_node) {
                    var markerData = this._markers[_node.id];

                    var x = _node.x - w/2;
                    var y = _node.y - h/2;

                    markerData.marker.css("transform", print_f("translate(%spx,%spx)", x, y));
                }.bind(this));

            },

            getVirtualBy: function (_vector) {
                return this.magnifier.convertToVirtual(_vector);
            },

            getMarkersAndLinksByArea: function (_lt, _rb) {
                var area = new Rectangle(_lt, _rb);

                var selected = [];
                var markers = this.collectPositions();
                for (var a = 0; a < markers.length; a++) {
                    var marker = markers[a];
                    // var markerPos = new Vector2(marker.x, marker.y);
                    // var markerPosSecond = markerPos["+"](new Vector2(10000000, 0));
                    // var markerPolygon = new Polygon([markerPos, markerPosSecond]);

                    var markerRect = new Rectangle(
                        new Vector2(marker.x - w / 2, marker.y - h / 2),
                        new Vector2(marker.x + w / 2, marker.y + h / 2)
                    )
                    var isIntersects = area.crossOrInside(markerRect);

                    if(isIntersects)
                        selected.push(marker.markerId);
                }

                return selected;
            },

            deselectAll: function () {
                for(var markerId in this._markers) {
                    if(this._markers[markerId].isSelect)
                        this._markers[markerId].marker.el.classList.remove("selected");

                    this._markers[markerId].isSelect = false;
                }
            },

            setSelectMarker: function (_markerId, _isSelect) {
                var markerData = this._markers[_markerId];
                var markerEl = markerData.marker;

                if(!markerData.isLocked) {
                    markerData.isSelect = _isSelect;

                    if (_isSelect)
                        markerEl.el.classList.add("selected");
                    else
                        markerEl.el.classList.remove("selected");
                }
            },

            selected: function () {
                var out = [];
                for (var markerId in this._markers) {
                    if (this._markers[markerId].isSelect)
                        out.push(this._markers[markerId].customId);
                }
                return out;
            },

            refresh: function () {
                var bounds = this.container.parentElement.getBoundingClientRect();
                this.setSize(bounds.width, bounds.height);
            },
            setSize: function (_w, _h) {
                this.width = _w;
                this.height = _h;
                this.svg.attr("width", this.width);
                this.svg.attr("height", this.height);
                this.magnifier.setSize(this.width, this.height);
                this.render();
            }
        });

        var _ui = function (_tag) {
            var svgElements = [
                "g", "line", "rect", "text", "svg", "image", "path"
            ];

            var isSvg = svgElements.indexOf(_tag) !== -1;

            var el = "";
            if(_tag instanceof HTMLElement) {
                el = _tag;
            } else {
                if (isSvg)
                    el = document.createElementNS("http://www.w3.org/2000/svg", _tag);
                else
                    el = document.createElement(_tag);
            }

            this.attr = function (_key, _value) {
                if(_value === undefined && _key.constructor === String)
                    return el.getAttribute(_key);

                if(_key.constructor === String && _value !== undefined) {
                    el.setAttribute(_key, _value);
                    return this;
                }

                if(_key.constructor === Object && _value === undefined) {
                    for(var k in _key) {
                        if(_key.hasOwnProperty(k)){
                            el.setAttribute(k, _key[k]);
                        }
                    }
                    return this;
                }
            }

            this.css = function (_key, _value) {
                if(_value === undefined && _key.constructor === String)
                    return el.style[_key];

                if(_key.constructor === String && _value !== undefined) {
                    el.style[_key] = _value;
                    return this;
                }

                if(_key.constructor === Object && _value === undefined) {
                    for(var k in _key) {
                        if(_key.hasOwnProperty(k)){
                            el.style[k] = _key[k];
                        }
                    }
                    return this;
                }
            }

            this.append = function (_element) {
                if(_element instanceof _ui) {
                    el.appendChild(_element.el);
                }
                return this;
            }

            this.remove = function (_element) {
                if(_element instanceof _ui) {
                    el.removeChild(_element.el);
                }
                return this;
            }

            this.text = function (_val) {
                if(_val === undefined) {
                    return isSvg ? el.textContent : el.innerText;
                }

                if(isSvg)
                    el.textContent = _val;
                else
                    el.innerText = _val;

                return this;
            };

            Object.defineProperty(this, "el", {
                get: function () {
                    return el;
                }
            });
        }

        _ui.fromText = function (_text) {
            return _ui.fromElement(document.createRange().createContextualFragment(_text).children[0]);
        }

        _ui.fromElement = function (_el) {
            return new _ui(_el);
        }

        var securityClasses = {
            "1.0": "eve-security-color-10",
            "0.9": "eve-security-color-09",
            "0.8": "eve-security-color-08",
            "0.7": "eve-security-color-07",
            "0.6": "eve-security-color-06",
            "0.5": "eve-security-color-05",
            "0.4": "eve-security-color-04",
            "0.3": "eve-security-color-03",
            "0.2": "eve-security-color-02",
            "0.1": "eve-security-color-01",
            "0.0": "eve-security-color-00",
            "-0.1": "eve-security-color-m-01",
            "-0.2": "eve-security-color-m-02",
            "-0.3": "eve-security-color-m-03",
            "-0.4": "eve-security-color-m-04",
            "-0.5": "eve-security-color-m-05",
            "-0.6": "eve-security-color-m-06",
            "-0.7": "eve-security-color-m-07",
            "-0.8": "eve-security-color-m-08",
            "-0.9": "eve-security-color-m-09",
            "-1.0": "eve-security-color-m-10"
        }

        var typeClasses = {
            "C1"      : "eve-wh-type-color-c1",
            "C2"      : "eve-wh-type-color-c2",
            "C3"      : "eve-wh-type-color-c3",
            "C4"      : "eve-wh-type-color-c4",
            "C5"      : "eve-wh-type-color-c5",
            "C6"      : "eve-wh-type-color-c6",
            "C13"     : "eve-wh-type-color-c13",
            "drifter" : "eve-wh-type-color-drifter",
            "Thera"   : "eve-wh-type-color-thera",
            "High"    : "eve-wh-type-color-high",
            "Low"     : "eve-wh-type-color-low",
            "Null"    : "eve-wh-type-color-null",
        };

        var kindClassed = {
            "0" : "eve-kind-color-high",
            "1" : "eve-kind-color-low",
            "2" : "eve-kind-color-null",
            "3" : "eve-kind-color-wh",
            "4" : "eve-kind-color-thera",
            "5" : "eve-kind-color-abyss",
            "6" : "eve-kind-color-penalty",
        }

        return Map;
    })
})();