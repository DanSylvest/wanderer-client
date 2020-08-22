(function () {
    var moduleName = "core/map";

    var deps = [
        "env/tools/class",
        "env/tools/extend",
        "env/tools/exist",
        "env/tools/emitter",
        "env/tools/print_f",
        "libs/d3",
        "env/vector2",
        "env/magnifier",
        "env/actionObserver",
        "libs/d3/collideRect",
        "libs/d3/rectForce",
    ];

    define(moduleName, deps, function () {
        var classCreator = require("env/tools/class");
        var extend = require("env/tools/extend");
        var exist = require("env/tools/exist");
        var print_f = require("env/tools/print_f");
        var Emitter = require("env/tools/emitter");
        var d3 = require("libs/d3");
        d3.collideRect = require("libs/d3/collideRect");
        d3.rectForce = require("libs/d3/rectForce");

        var Vector2         = require("env/vector2");
        var Magnifier       = require("env/magnifier");
        var ActionObserver  = require("env/actionObserver");

        var w = 120;
        var h = 30;

        var strength  = -20;
        var linkDistance = w * 2;
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
                this._upgradeSvg();
                this._createMap();
                // this._test();

                this._createActionObservers();

                window.addEventListener("resize", this.refresh.bind(this));

                this.startForce();
                this._onSimulationTick();
            },
            destructor: function () {
                this.container.removeChild(this.svg.el);

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
                this._ao = new ActionObserver({
                    container: this.svg.el,
                    offOnOut: false,
                    mdCondition: function (_event) {
                        return this.findMarker(_event.mouse);
                    }.bind(this)
                });

                this._ao.on("click", function (_event) {
                    _event.originalEvent.stopPropagation();
                    this._onMarkerClick(_event.subject.id, _event.originalEvent);
                }.bind(this));

                var dragOffset = new Vector2();
                this._ao.on("dragStart", function (_event) {
                    if(this._markers[_event.subject.id].isLocked) {
                        return;
                    }

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

                    var markerData = this._markers[_event.subject.id];
                    if(!markerData.isLocked) {
                        _event.subject.fx = null;
                        _event.subject.fy = null;
                    }
                    this.render();
                }.bind(this));


                this._ao2 = new ActionObserver({
                    offOnOut: false,
                    container: this.svg.el,
                    mdCondition: function (_event) {
                        return !this.findMarker(_event.mouse);
                    }.bind(this)
                });

                var rlStarted = null;
                var savedAxis = null;
                this._ao2.on("dragStart", function (_event) {
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

                this.linksLayer = new _ui("g");
                this.markersLayer = new _ui("g");

                this.svg.append(this.linksLayer);
                this.svg.append(this.markersLayer);
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
                    name: "",
                    sizeMultiplier: 0,
                    size: 15,
                    isLocked: false,
                    x: randomFloat(this.width / 2 * -1, this.width / 2),
                    y: randomFloat(this.height / 2 * -1, this.height / 2),
                }, _options);

                var mid = counter++;

                var mGroup = new _ui("g").attr({
                    width: w,
                    height: h,
                });

                var rect = new _ui("rect").attr({
                    width: w,
                    height: h,
                    class: "marker-substrate"
                });

                var rect2 = new _ui("rect").attr({
                    x: -4,
                    y: -4,
                    width: w + 8,
                    height: h + 8,
                    class: "second-border"
                });

                var systemType = new _ui("text").attr({
                    class: print_f("marker-text off-events eve-system-color-%s", base.systemType),
                    "text-anchor": "start"
                });

                var systemName = new _ui("text").attr({
                    class: "marker-text off-events",
                    "text-anchor": "start"
                }).text(base.name);
                systemName.attr({transform: print_f("translate(4, 14)")});

                var wormholeEffect = new _ui("rect").attr({
                    width: 10,
                    height: 10,
                    class: "eve-wormhole-effect",
                    visibility: "hidden"
                });

                var image = new _ui("image").attr({
                    class: "off-events",
                    href: "images/svg/lock-black.svg",
                    width: "13",
                    height: "13",
                    visibility: base.isLocked ? "visibility" : "hidden",
                    transform: "translate(3, 3)"
                });

                mGroup.append(rect2);
                mGroup.append(rect);
                mGroup.append(image);
                mGroup.append(systemType);
                mGroup.append(systemName);
                mGroup.append(wormholeEffect);

                this.markersLayer.append(mGroup);

                rect.el.addEventListener("contextmenu", this._onMarkerContext.bind(this, mid));

                this._markers[mid] = {
                    customId: customId,
                    sizeMultiplier: base.sizeMultiplier,
                    size: base.size,
                    name: base.name || "",
                    x: base.x,
                    y: base.y,
                    isLocked: base.isLocked,
                    svg: {
                        group: mGroup,
                        rect: rect,
                        systemType: systemType,
                        systemName: systemName,
                        wormholeEffect: wormholeEffect,
                        image: image,
                    },
                };

                this.magnifier.addObject({
                    id: mid,
                    fx: base.isLocked ? this._markers[mid].x : null,
                    fy: base.isLocked ? this._markers[mid].y : null,
                    x: this._markers[mid].x,
                    y: this._markers[mid].y,

                });

                this.startForce();

                return mid;
            },
            removeMarker: function (_markerId) {
                var markerData = this._markers[_markerId];

                this.markersLayer.remove(markerData.svg.group);
                this.magnifier.removeObject(_markerId);
                delete this._markers[_markerId];

                this._forceLinks = this.forceLinks();
                this.startForce();
            },
            _createStatics: function (_markerData) {
                for (var a = 0; a < _markerData.systemData.statics.length; a++) {
                    var staticData = _markerData.systemData.statics[a];
                    var staticText = new _ui("text").attr({
                        class: "marker-text off-events",
                        "text-anchor": "start"
                    }).text(staticData.name);
                    staticText.attr({transform: print_f("translate(4, 14)")});

                    _markerData.svg.group.append(staticText);

                    if(!_markerData.svg.statics) {
                        _markerData.svg.statics = [];
                    }
                    _markerData.svg.statics.push(staticText);

                }
            },
            updateMarker: function (_markerId, _data) {
                var markerData = this._markers[_markerId];

                extend(markerData, _data);

                // RERENDER
                var offset = markerData.isLocked ? 20 : 5;

                var obj = this.magnifier.objects().searchByObjectKey("id", _markerId);

                if(exist(_data.systemType)) {
                    var colorClass = print_f("eve-system-color-%s", markerData.systemType);
                    switch (_data.systemType) {
                        case 0:
                        case 1:
                        case 2:
                            colorClass = securityClasses[markerData.security];
                            break;
                        case 3:
                        case 4:
                            colorClass = typeClasses[markerData.systemData.typeName];
                            // debugger;
                            // this._createStatics(markerData)
                            break;
                    }

                    markerData.svg.systemType.attr({
                        class: print_f("marker-text off-events %s", colorClass),
                        transform:  print_f("translate(%s, 14)", offset)
                    })
                    markerData.svg.systemType.text(markerData.systemData.typeName);
                }

                if(exist(_data.name)) {
                    offset += markerData.svg.systemType.el.getBBox().width + 3;

                    markerData.svg.systemName.attr({transform: print_f("translate(%s, 14)", offset)});
                    markerData.svg.systemName.text(markerData.name);
                }

                if(exist(_data.systemType) && _data.systemData.effectType) {
                    offset += markerData.svg.systemName.el.getBBox().width + 3;
                    markerData.svg.wormholeEffect.attr({
                        class: print_f("eve-wormhole-effect eve-wh-effect-color-%s", markerData.systemData.effectType),
                        visibility: "visible",
                        transform: print_f("translate(%s, 4)", offset)
                    });
                }

                if(exist(_data.isLocked)) {
                    if(markerData.isLocked) {
                        obj.fx = obj.x;
                        obj.fy = obj.y;
                    } else {
                        obj.fx = null;
                        obj.fy = null;
                    }

                    markerData.svg.image.attr({visibility: markerData.isLocked ? "visibility" : "hidden"});
                }

                if(exist(_data.position)) {
                    obj.x = markerData.position.x;
                    obj.y = markerData.position.y;
                }

                // RERENDER

                this.startForce();
            },
            createLink: function (_customId, _source, _target) {
                var mid = counter++;

                // var element = new _ui("line").attr({
                //     class: "map-link off-events"
                // });

                var element = new _ui("line").attr({
                    class: "map-link off-events",

                });

                var element2 = new _ui("line").attr({
                    class: "map-link-under",
                    // visible: "hidden"
                });

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
                this.startForce();

                return mid;
            },
            removeLink: function (_linkId) {
                var linkData = this._links[_linkId];

                this.linksLayer.remove(linkData.element);
                this.linksLayer.remove(linkData.element2);

                delete this._links[_linkId];

                this.startForce();
            },
            enableForce: function (_bool) {
                this._forceEnable = _bool;
                this.startForce();
            },
            collectPositions: function () {
                var out = [];

                var nodes = this.magnifier.objects();

                for (var a = 0; a < nodes.length; a++) {
                    var nodeInfo = nodes[a];
                    var markerInfo = this._markers[nodeInfo.id];

                    out.push({id: markerInfo.customId, x: nodeInfo.x, y: nodeInfo.y});
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

                    var x = node.x - w/2;
                    var y = node.y - h/2;

                    if(_v2.isInsideRect(x, y, w, h)) {
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
                }.bind(this))

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

                    markerData.svg.group.attr("transform", print_f("translate(%s,%s)", x, y));
                }.bind(this));

            },

            refresh: function () {
                // this.canvas.
                // debugger;
                var bounds = this.container.parentElement.getBoundingClientRect();

                // console.log(this.height - bounds.height);
                this.setSize(bounds.width, bounds.height);
            },
            setSize: function (_w, _h) {
                this.width = _w;
                this.height = _h;


                this.svg.attr("width", this.width);
                this.svg.attr("height", this.height);

                // this.svg.width = this.width;
                // this.svg.height = this.height;

                this.magnifier.setSize(this.width, this.height);

                this.render();
            }
        });

        function createElementFromHTML(htmlString) {
            var div = document.createElement('div');
            div.innerHTML = htmlString.trim();

            // Change this to div.childNodes to support multiple top-level nodes
            return div.firstChild;
        }

        var _ui = function (_tag) {
            var svgElements = [
                "g", "line", "rect", "text", "svg", "image", "path"
            ];

            var el = "";
            if(svgElements.indexOf(_tag) !== -1)
                el = document.createElementNS("http://www.w3.org/2000/svg", _tag);
            else
                el = document.createElement(_tag);

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
                    return el.textContent;
                }

                el.textContent = _val;
                return this;
            };

            Object.defineProperty(this, "el", {
                get: function () {
                    return el;
                }
            });
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