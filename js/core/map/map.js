(function () {
    var moduleName = "core/map/map";

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
        "env/ui",
        "core/map/marker",
        "core/map/environment",
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
        var _ui             = require("env/ui");
        var Marker          = require("core/map/marker");
        var environment     = require("core/map/environment");

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
                    isLocked: false,
                    x: randomFloat(this.width / 2 * -1, this.width / 2),
                    y: randomFloat(this.height / 2 * -1, this.height / 2),
                }, _options);

                var mid = counter++;

                var marker = new Marker({
                    customId: customId,
                });
                this.htmlContainer.append(marker.wrapper);

                marker.on("mousedown", this._onMarkerDown.bind(this, mid));
                marker.on("contextmenu", this._onMarkerContext.bind(this, mid));

                this._markers[mid] = marker;

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
                var marker = this._markers[_markerId];

                if (exist(_data.isLocked) && _data.isLocked !== marker.data.isLocked) {
                    var obj = this.magnifier.objects().searchByObjectKey("id", _markerId);
                    obj.lock = _data.isLocked;
                    if(_data.isLocked) {
                        obj.fx = obj.x;
                        obj.fy = obj.y;
                    } else {
                        obj.fx = undefined;
                        obj.fy = undefined;
                    }
                }

                if (exist(_data.position) && marker.data.position && (_data.position.x !== marker.data.position.x || _data.position.y !== marker.data.position.y)) {
                    var obj = this.magnifier.objects().searchByObjectKey("id", _markerId);
                    obj.x = _data.position.x;
                    obj.y = _data.position.y;
                }

                marker.update(_data);

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
                    if(this._markers[_event.subject.id].data.isLocked) {
                        return;
                    }

                    this._markers[_event.subject.id].wrapper.el.classList.add("eve-zInd-top");

                    this.simulation.alphaTarget(0.3).restart();

                    var virtual = this.magnifier.convertToVirtual(_event.mouse);
                    var subjectPos = new Vector2(_event.subject.x, _event.subject.y);
                    dragOffset = virtual["-"](subjectPos)

                    this.render();
                }.bind(this));

                this._ao.on("dragging", function (_event) {
                    if(this._markers[_event.subject.id].data.isLocked) {
                        return;
                    }

                    var virtual = this.magnifier.convertToVirtual(_event.mouse);
                    virtual["-="](dragOffset);

                    _event.subject.fx = virtual.x;
                    _event.subject.fy = virtual.y;

                    var marker = this._markers[_event.subject.id];
                    marker.data.position.x = virtual.x;
                    marker.data.position.y = virtual.y;

                    this.render();

                }.bind(this));

                this._ao.on("dragEnd", function (_event) {
                    if(this._markers[_event.subject.id].data.isLocked) {
                        return;
                    }

                    this.simulation.alphaTarget(0);

                    this._markers[_event.subject.id].wrapper.el.classList.remove("eve-zInd-top");

                    var marker = this._markers[_event.subject.id];
                    if(!marker.data.isLocked) {
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
                var marker = this._markers[_markerId];

                this.htmlContainer.remove(marker.wrapper);
                this.magnifier.removeObject(_markerId);

                marker.destructor();

                delete this._markers[_markerId];

                this._forceLinks = this.forceLinks();
                this._sfForce.call();
            },
            createLink: function (_customId, _source, _target) {
                var mid = counter++;

                var element = new _ui("line").attr({class: "map-link link-top"});
                var element2 = new _ui("line").attr({class: "map-link link-middle"});
                var element3 = new _ui("line").attr({class: "map-link link-bottom"});

                this.linksLayer.append(element3);
                this.linksLayer.append(element2);
                this.linksLayer.append(element);

                element3.el.addEventListener("click", this._onLinkClick.bind(this, mid));
                element3.el.addEventListener("contextmenu", this._onLinkContext.bind(this, mid));

                this._links[mid] = {
                    data: {
                        // massStatus: 0,
                        // timeStatus: 1,
                    },
                    customId: _customId,
                    element: element,
                    element2: element2,
                    element3: element3,
                    source: _source,
                    target: _target,
                };

                this.updateLink(mid, {
                    massStatus: 0,
                    timeStatus: 0,
                    shipSizeType: 1
                })
                this._forceLinks = this.forceLinks();
                this._sfForce.call();

                return mid;
            },
            updateLink: function (_linkId, _data) {
                var link = this._links[_linkId];

                if (exist(_data.massStatus) && _data.massStatus !== link.data.massStatus) {
                    link.element.el.classList.remove("mass-state-0");
                    link.element.el.classList.remove("mass-state-1");
                    link.element.el.classList.remove("mass-state-2");
                    link.element2.el.classList.remove("mass-state-0");
                    link.element2.el.classList.remove("mass-state-1");
                    link.element2.el.classList.remove("mass-state-2");
                    link.element3.el.classList.remove("mass-state-0");
                    link.element3.el.classList.remove("mass-state-1");
                    link.element3.el.classList.remove("mass-state-2");

                    link.element.el.classList.add("mass-state-" + _data.massStatus);
                    link.element2.el.classList.add("mass-state-" + _data.massStatus);
                    link.element3.el.classList.add("mass-state-" + _data.massStatus);
                }

                if (exist(_data.timeStatus) && _data.timeStatus !== link.data.timeStatus) {
                    link.element.el.classList.remove("time-state-0");
                    link.element.el.classList.remove("time-state-1");
                    link.element2.el.classList.remove("time-state-0");
                    link.element2.el.classList.remove("time-state-1");
                    link.element3.el.classList.remove("time-state-0");
                    link.element3.el.classList.remove("time-state-1");

                    link.element.el.classList.add("time-state-" + _data.timeStatus);
                    link.element2.el.classList.add("time-state-" + _data.timeStatus);
                    link.element3.el.classList.add("time-state-" + _data.timeStatus);
                }

                if (exist(_data.shipSizeType) && _data.shipSizeType !== link.data.shipSizeType) {
                    link.element.el.classList.remove("ship-size-0");
                    link.element.el.classList.remove("ship-size-1");
                    link.element.el.classList.remove("ship-size-2");
                    link.element2.el.classList.remove("ship-size-0");
                    link.element2.el.classList.remove("ship-size-1");
                    link.element2.el.classList.remove("ship-size-2");
                    link.element3.el.classList.remove("ship-size-0");
                    link.element3.el.classList.remove("ship-size-1");
                    link.element3.el.classList.remove("ship-size-2");

                    link.element.el.classList.add("ship-size-" + _data.shipSizeType);
                    link.element2.el.classList.add("ship-size-" + _data.shipSizeType);
                    link.element3.el.classList.add("ship-size-" + _data.shipSizeType);
                }

                extend(link.data, _data);
            },
            removeLink: function (_linkId) {
                var linkData = this._links[_linkId];

                this.linksLayer.remove(linkData.element);
                this.linksLayer.remove(linkData.element2);
                this.linksLayer.remove(linkData.element3);

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
                    var marker = this._markers[nodeInfo.id];
                    out.push({markerId: nodeInfo.id, id: marker.data.customId, x: nodeInfo.x, y: nodeInfo.y});
                }

                return out;
            },
            _onMarkerClick: function (_markerId, _event) {
                var marker = this._markers[_markerId];
                this.emit("markerClicked", marker.data.customId, _event);
            },
            _onMarkerContext: function (_markerId, _event) {
                _event.stopPropagation();
                _event.preventDefault();

                var marker = this._markers[_markerId];
                this.emit("systemContextMenu", marker.data.customId, _event);
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
                    this._markers[_obj.id].data.x = _obj.x;
                    this._markers[_obj.id].data.y = _obj.y;
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

                    var sourceMarker = this._markers[linkData.source].data;
                    var targetMarker = this._markers[linkData.target].data;

                    var source = this.magnifier.convertToReal(new Vector2(sourceMarker.x, sourceMarker.y));
                    var target = this.magnifier.convertToReal(new Vector2(targetMarker.x, targetMarker.y));

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

                    linkData.element3.attr({
                        // d: print_f("M100,250 C100,100 351,211 306,273 Z"),
                        x1: source.x,
                        y1: source.y,
                        x2: target.x,
                        y2: target.y,
                    });
                }.bind(this));


                realCoords.forEach(function (_node) {
                    var marker = this._markers[_node.id];

                    var x = _node.x - w/2;
                    var y = _node.y - h/2;

                    marker.wrapper.css("transform", print_f("translate(%spx,%spx)", x, y));
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
                    this._markers[markerId].data.isSelect && this._markers[markerId].select(false);
                }
            },
            setSelectMarker: function (_markerId, _isSelect) {
                this._markers[_markerId].select(_isSelect);
            },
            selected: function () {
                var out = [];
                for (var markerId in this._markers) {
                    if (this._markers[markerId].data.isSelect)
                        out.push(this._markers[markerId].data.customId);
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

        return Map;
    })
})();