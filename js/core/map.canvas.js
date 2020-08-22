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
    ];

    define(moduleName, deps, function () {
        var classCreator = require("env/tools/class");
        var extend = require("env/tools/extend");
        var exist = require("env/tools/exist");
        var print_f = require("env/tools/print_f");
        var Emitter = require("env/tools/emitter");
        var d3 = require("libs/d3");

        var Vector2         = require("env/vector2");
        var Magnifier       = require("env/magnifier");
        var ActionObserver  = require("env/actionObserver");

        var w = 150;
        var h = 40;

        var strength  = -20;
        var linkDistance = w * 1.2;
        var bodyDistanceMax = w * 15;
        var bodyDistanceMin = null;

        var counter = 0;
        var Map = classCreator("Map", Emitter, {
            constructor: function Map(_options) {
                var base = extend({
                    canvas: null,
                    width: null,
                    height: null
                }, _options);

                Emitter.prototype.constructor.call(this);

                this._markers = Object.create(null);
                this._links = Object.create(null);

                this.width = base.width;
                this.height = base.height;
                this.canvas = base.canvas;

                this._forceLinks = [];

                this._upgradeCanvas();
                this._createMap();
                // this._test();

                this._createActionObservers();

                window.addEventListener("resize", this._onWindowResize.bind(this));

                this.startForce();
                this._onSimulationTick();
            },
            clear: function () {

            },
            _createActionObservers: function () {
                this._ao = new ActionObserver({
                    container: this.canvas,
                    mdCondition: function (_event) {
                        return this.findMarker(_event.mouse);
                    }.bind(this)
                });

                // var draggingNode = null;
                this._ao.on("click", function (_event) {
                    console.log("click");
                }.bind(this));

                this._ao.on("dragStart", function (_event) {
                    this.simulation.alphaTarget(0.3).restart();

                    // draggingNode = this.findMarker(_event.mouse);

                    var virtual = this.magnifier.convertToVirtual(_event.mouse);
                    this._ao.subject.fx = virtual.x;
                    this._ao.subject.fy = virtual.y;

                    this.render();

                }.bind(this));

                this._ao.on("dragging", function (_event) {

                    var virtual = this.magnifier.convertToVirtual(_event.mouse);
                    this._ao.subject.fx = virtual.x;
                    this._ao.subject.fy = virtual.y;
                    this.render();

                }.bind(this));

                this._ao.on("dragEnd", function (_event) {
                    this.simulation.alphaTarget(0);

                    var markerData = this._markers[this._ao.subject.id];

                    if(!markerData.isLocked) {
                        this._ao.subject.fx = null;
                        this._ao.subject.fy = null;
                    }
                    this.render();
                }.bind(this));


                this._ao2 = new ActionObserver({
                    offOnOut: false,
                    container: this.canvas,
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
                    // console.log();
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
            _upgradeCanvas: function () {
                this.context = this.canvas.getContext("2d");
                this.canvas.width = this.width;
                this.canvas.height = this.height;

                // this.canvas.addEventListener("click", this._onCanvasMouseClick.bind(this));
                // window.addEventListener("mouseup", this._onCanvasMouseMove.bind(this));
            },
            _createMap: function () {
                this.magnifier = new Magnifier();
                this.magnifier.setSize(this.width, this.height);
                this.magnifier.toCenter();
            },
            _test: function () {

                var count = 10;
                var linksCount = 10;


                for (var a = 0; a < count; a++) {
                    var countMembers = (randomInt(0, 20) > 17 ? randomInt(18, 20) : 0) ;
                    this.createMarker({
                        sizeMultiplier: countMembers > 0 ? Math.log(countMembers) / 4 : 0,
                        name: print_f("J%s (%s)", randomInt(111111, 222222), countMembers)
                    });
                }

                countMembers = (randomInt(0, 20) > 17 ? randomInt(18, 20) : 0);
                this.createMarker({
                    sizeMultiplier: countMembers > 0 ? Math.log(countMembers) / 4 : 0,
                    name: print_f("J%s (%s)", randomInt(111111, 222222), countMembers),
                    isLocked: true
                });


                var links = [];
                for (var a = 0; a < linksCount; a++) {
                    var keys = Object.keys(this._markers);

                    var source = keys[randomInt(0, keys.length)];
                    var target = keys[randomInt(0, keys.length)];

                    if (source === target)
                        continue;

                    if (links.searchByObjectKey("source", source) && links.searchByObjectKey("target", target)) {
                        continue;
                    }

                    var id = this.createLink(source, target);

                    links.push({
                        id: id,
                        source: source,
                        target: target,
                    });
                }

                this._forceLinks = links;

                // for(var k in this._links) {
                //     this._forceLinks.push({
                //         id: k,
                //         source: this._links[k].source,
                //         target: this._links[k].target,
                //     });
                // }


                this.startForce();
                this._onSimulationTick();
            },
            _onCanvasMouseClick: function (_event) {
                var bounds = this.canvas.getBoundingClientRect();

                var realPoint = new Vector2(parseInt(_event.clientX - bounds.x), parseInt(_event.clientY - bounds.y));
                var virtualPoint = this.magnifier.convertToVirtual(realPoint);

                var keys = Object.keys(this._markers);

                var countMembers = (randomInt(0, 20) > 17 ? randomInt(18, 20) : 0);
                var id = this.createMarker({
                    sizeMultiplier: countMembers > 0 ? Math.log(countMembers) / 4 : 0,
                    name: print_f("J%s (%s)", randomInt(111111, 222222), countMembers),
                    isLocked: false,
                    x: virtualPoint.x,
                    y: virtualPoint.y
                });

                var source = id;
                var target = keys[randomInt(0, keys.length)];

                var lid = this.createLink(source, target);
                this._forceLinks.push({
                    id: lid,
                    source: source,
                    target: target,
                });


                this.startForce();

                this.render();

            },
            _onCanvasMouseMove: function (_event) {
                var bounds = this.canvas.getBoundingClientRect();

                var realPoint = new Vector2(parseInt(_event.clientX - bounds.x), parseInt(_event.clientY - bounds.y));
                var virtualPoint = this.magnifier.convertToVirtual(realPoint);

                // this._virtualPoint = virtualPoint;
                for(var k in this._links) {
                    var link = this._links[k];

                    var sourceMarker = this._markers[link.source];
                    var targetMarker = this._markers[link.target];

                    if(Vector2.pointOnLine(virtualPoint, new Vector2(sourceMarker.x, sourceMarker.y), new Vector2(targetMarker.x, targetMarker.y))){
                        link.isHover = true;
                    } else {
                        delete link.isHover;
                    }
                }

                this.render();
            },
            createMarker: function (_options) {
                var base = extend({
                    name: "",
                    sizeMultiplier: 0,
                    size: 15,
                    isLocked: false,
                    x: randomFloat(this.width / 2 * -1, this.width / 2),
                    y: randomFloat(this.height / 2 * -1, this.height / 2),
                }, _options);

                var mid = counter++;

                this._markers[mid] = {
                    sizeMultiplier: base.sizeMultiplier,
                    size: base.size,
                    name: base.name || "",
                    x: base.x,
                    y: base.y,
                    isLocked: base.isLocked
                };

                this.magnifier.addObject({
                    id: mid,
                    fx: base.isLocked ? this._markers[mid].x : null,
                    fy: base.isLocked ? this._markers[mid].y : null,
                    x: this._markers[mid].x,
                    y: this._markers[mid].y
                });

                this.startForce();

                return mid;
            },
            updateMarker: function (_markerId, _data) {
                var markerData = this._markers[_markerId];

                exist(_data.name)           && (markerData.name = _data.name);
                exist(_data.sizeMultiplier) && (markerData.sizeMultiplier = _data.sizeMultiplier);
                exist(_data.isLocked)       && (markerData.isLocked = _data.isLocked);

                this.startForce();
            },
            createLink: function (_source, _target) {
                var mid = counter++;

                this._links[mid] = {
                    source: _source,
                    target: _target,
                };

                this.startForce();

                return mid;
            },

            startForce: function () {
                this.simulation && this.simulation.stop();

                this._forceLinks = this.forceLinks();

                var linkForce = d3.forceLink(this._forceLinks).id(function(d) { return d.id; });
                linkForce.strength(0.17);
                linkForce.distance(function (d) {
                    var src = this.countLinksForNode(d.source.id);
                    var trg = this.countLinksForNode(d.target.id);

                    var log = Math.log(Math.min(src, trg));
                    if(log < 1) log = 0.8;

                    var min = log * linkDistance;

                    return min;
                }.bind(this))


                this.simulation = d3.forceSimulation(this.magnifier.objects());
                this.simulation.force("charge", d3.forceManyBody().strength(function (d) {
                    return 10 / (this.countLinksForNode(d.id) || 1) * strength
                }.bind(this)));
                this.simulation.force("link", linkForce);

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

                    // var markerData = this._markers[node.id];

                    var x = node.x - w/2;
                    var y = node.y - h/2;

                    if(_v2.isInsideRect(x, y, w, h)) {
                        return this.magnifier.objects().searchByObjectKey("id", node.id);
                    }

                    // var resultSize = markerData.size + markerData.size * markerData.sizeMultiplier;
                    // var dist = _v2.distance(new Vector2(node.x, node.y));
                    //
                    // if(dist <= resultSize)
                    //     return this.magnifier.objects().searchByObjectKey("id", node.id);
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

                this.collisionProcess();

                this.render();
            },

            collisionProcess: function () {
                var nodes = this.magnifier.objects();

                var offsetTop = (h/2) + 5;
                var offsetLeft = (w/2) + 5;
                var passes = 1;
                var passesCount = 0;

                while(passesCount < passes) {
                    passesCount++;

                    for (var a = 0; a < nodes.length; a++) {
                        var markerA = nodes[a];
                        var o1 = new Vector2(markerA.x - offsetLeft, markerA.y - offsetTop);
                        var o2 = new Vector2(markerA.x + offsetLeft, markerA.y + offsetTop);

                        for (var b = 0; b < nodes.length; b++) {
                            var markerB = nodes[b];
                            if (a !== b) {
                                var p1 = new Vector2(markerB.x - offsetLeft, markerB.y - offsetTop);
                                var p2 = new Vector2(markerB.x + offsetLeft, markerB.y + offsetTop);

                                var intersect = (p1.x <= o2.x && o1.x <= p2.x && p1.y <= o2.y && o1.y <= p2.y);

                                if (intersect) {
                                    var xa1 = o2.x - p1.x, // shift obj left , p right
                                        xa2 = p2.x - o1.x, // shift obj right, p left
                                        ya1 = o2.y - p1.y, // shift obj up   , p down
                                        ya2 = p2.y - o1.y, // shift obj down , p up
                                        adj = Math.min(xa1, xa2, ya1, ya2);

                                    if (adj === xa1) {
                                        markerA.x -= adj / 2;
                                        markerB.x   += adj / 2;
                                    } else if (adj === xa2) {
                                        markerA.x += adj / 2;
                                        markerB.x   -= adj / 2;
                                    } else if (adj === ya1) {
                                        markerA.y -= adj / 2;
                                        markerB.y   += adj / 2;
                                    } else if (adj === ya2) {
                                        markerA.y += adj / 2;
                                        markerB.y   -= adj / 2;
                                    }
                                }
                            }
                        }
                    }
                }
            },

            render: function () {
                if( this._lock)
                    return;

                this._lock = true;

                requestAnimationFrame(function () {
                    this._render();
                    this._lock = false;
                }.bind(this))

            },
            _render: function () {
                var realCoords = this.magnifier.getReal();

                this.context.clearRect(0, 0, this.width, this.height);

                this._forceLinks.forEach(function (_link) {
                    this.context.beginPath();
                    var linkData = this._links[_link.id];

                    if(linkData.isHover) {
                        this.context.lineWidth = 3;
                        this.context.strokeStyle = "#ff4211";
                    } else {
                        this.context.lineWidth = 1;
                        this.context.strokeStyle = "#5eaaff";
                    }

                    var sourceMarker = this._markers[linkData.source];
                    var targetMarker = this._markers[linkData.target];

                    var source = this.magnifier.convertToReal(new Vector2(sourceMarker.x, sourceMarker.y));
                    var target = this.magnifier.convertToReal(new Vector2(targetMarker.x, targetMarker.y));
                    this.context.moveTo(source.x, source.y);
                    this.context.lineTo(target.x, target.y);
                    this.context.stroke();
                }.bind(this));


                realCoords.forEach(function (_node) {
                    var markerData = this._markers[_node.id];
                    this.context.beginPath();

                    if(!markerData.isLocked)
                        this.context.fillStyle = "#ffb600";
                    else
                        this.context.fillStyle = "#6f72ff";

                    // var resultSize = markerData.size + markerData.size * markerData.sizeMultiplier;

                    var x = _node.x - w/2;
                    var y = _node.y - h/2;

                    // this.context.moveTo(_node.x + resultSize, _node.y);
                    this.context.rect(x, y, w, h);
                    this.context.fill();

                }.bind(this));


                realCoords.forEach(function (_node) {
                    var markerData = this._markers[_node.id];
                    // var resultSize = markerData.size + markerData.size * markerData.sizeMultiplier;

                    var x = _node.x - w/2 + 5;
                    var y = _node.y - h/2 + 5;

                    this.context.beginPath();
                    this.context.fillStyle = "#858077";
                    this.context.textBaseline  = "top";
                    this.context.font = "15px normal Roboto,Noto Sans,-apple-system,BlinkMacSystemFont,sans-serif";
                    // this.context.strokeText(markerData.name, _node.x + resultSize + 5, _node.y);
                    this.context.fillText(markerData.name, x, y);

                }.bind(this));

            },

            _onWindowResize: function () {
                // this.canvas.
                // debugger;
                var bounds = this.canvas.parentElement.getBoundingClientRect();
                this.setSize(bounds.width, bounds.height);
            },
            setSize: function (_w, _h) {
                this.width = _w;
                this.height = _h;

                this.canvas.width = this.width;
                this.canvas.height = this.height;

                this.magnifier.setSize(this.width, this.height);

                this.render();
            }
        });

        return Map;
    })
})();