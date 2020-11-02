import Emitter from "../../env/tools/emitter";
import SpamFilter from "../../env/spamFilter";
import extend from "../../env/tools/extend";
import exists from "../../env/tools/exists";
import Vector2 from "../../env/vector2";
import ActionObserver from "../../env/actionObserver";
import _ui from "../../env/ui";
import Magnifier from "../../env/magnifier";
import printf from "../../env/tools/printf";
import Rectangle from "../../env/rectangle";
import Marker from "./marker";
import collideRect from "../../libs/d3/collideRect";
const d3 = require("d3-force");

const w = 120;
const h = 30;
const strength  = -10;
const linkDistance = w * 1.2;

let counter = 0;

class Map extends Emitter {
    constructor (_options) {
        let base = extend({
            container: null,
            width: null,
            height: null
        }, _options);

        super();

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
    }
    destructor () {
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
    }
    clear () {

    }
    setOffset (x,y) {
        this.magnifier.hAxis.min = x;
        this.magnifier.vAxis.min = y;
        this.render();
    }
    _createActionObservers () {
        // try {
        this._ao2 = new ActionObserver({
            offOnOut: false,
            container: this.svg.el,
            mdCondition: function (_event) {
                return !_event.originalEvent.ctrlKey && !this.findMarker(_event.mouse);
            }.bind(this)
        });
// } catch(e) {alert(JSON.stringify(e))}
        let rlStarted = null;
        let savedAxis = null;

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
            let curReal = _event.mouse;

            let rDelta = curReal["-"](rlStarted);
            let v = this.magnifier.in(rDelta);

            this.magnifier.hAxis.min = savedAxis.x - v.x;
            this.magnifier.vAxis.min = savedAxis.y - v.y;

            this.emit("offsetChanged", new Vector2(this.magnifier.hAxis.min, this.magnifier.vAxis.min));
            this.render();
        }.bind(this));

        this._ao2.on("dragEnd", function (/*_event*/) {
            this.render();
        }.bind(this));
    }
    _upgradeSvg () {
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
    }
    _createMap () {
        this.magnifier = new Magnifier();
        this.magnifier.setSize(this.width, this.height);
        this.magnifier.toCenter();
    }
    createMarker (customId, _options) {
        let base = extend({
            customId: customId,
            isLocked: false,
            x: Number.randomFloat(this.width / 2 * -1, this.width / 2),
            y: Number.randomFloat(this.height / 2 * -1, this.height / 2),
        }, _options);

        let mid = counter++;

        let marker = new Marker({
            customId: customId,
        });
        this.htmlContainer.append(marker.wrapper);

        marker.on("mousedown", this._onMarkerDown.bind(this, mid));
        marker.on("contextmenu", this._onMarkerContext.bind(this, mid));
        marker.on("mousein", this._onMarkerMouseIn.bind(this, mid));
        marker.on("mouseout", this._onMarkerMouseOut.bind(this, mid));

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
    }
    updateMarker (_markerId, _data) {
        let marker = this._markers[_markerId];

        if (exists(_data.isLocked) && _data.isLocked !== marker.data.isLocked) {
            let obj = this.magnifier.objects().searchByObjectKey("id", _markerId);
            obj.lock = _data.isLocked;
            if(_data.isLocked) {
                obj.fx = obj.x;
                obj.fy = obj.y;
            } else {
                obj.fx = undefined;
                obj.fy = undefined;
            }
        }

        if (exists(_data.position) && marker.data.position && (_data.position.x !== marker.data.position.x || _data.position.y !== marker.data.position.y)) {
            let obj = this.magnifier.objects().searchByObjectKey("id", _markerId);
            obj.x = _data.position.x;
            obj.y = _data.position.y;
        }

        marker.update(_data);

        this._sfForce.call();
    }
    _onMarkerDown (_markerId, _event) {
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

        let dragOffset = new Vector2();
        this._ao.on("dragStart", function (_event) {
            if(this._markers[_event.subject.id].data.isLocked) {
                return;
            }

            this._onMarkerMouseOut(_markerId, _event);
            this._isDragging = true;

            this._markers[_event.subject.id].wrapper.el.classList.add("eve-zInd-top");

            this.simulation.alphaTarget(0.3).restart();

            let virtual = this.magnifier.convertToVirtual(_event.mouse);
            let subjectPos = new Vector2(_event.subject.x, _event.subject.y);
            dragOffset = virtual["-"](subjectPos)

            this.render();
        }.bind(this));

        this._ao.on("dragging", function (_event) {
            if(this._markers[_event.subject.id].data.isLocked) {
                return;
            }

            let virtual = this.magnifier.convertToVirtual(_event.mouse);
            virtual["-="](dragOffset);

            _event.subject.fx = virtual.x;
            _event.subject.fy = virtual.y;

            let marker = this._markers[_event.subject.id];
            marker.data.position.x = virtual.x;
            marker.data.position.y = virtual.y;

            this.render();

        }.bind(this));

        this._ao.on("dragEnd", function (_event) {
            this._isDragging = false;

            if(this._markers[_event.subject.id].data.isLocked) {
                return;
            }

            this.simulation.alphaTarget(0);

            this._markers[_event.subject.id].wrapper.el.classList.remove("eve-zInd-top");

            let marker = this._markers[_event.subject.id];
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
    }
    removeMarker (_markerId) {
        let marker = this._markers[_markerId];

        this.htmlContainer.remove(marker.wrapper);
        this.magnifier.removeObject(_markerId);

        marker.destructor();

        delete this._markers[_markerId];

        this._forceLinks = this.forceLinks();
        this._sfForce.call();
    }
    createLink (_customId, _source, _target) {
        let mid = counter++;

        let element = new _ui("line").attr({class: "map-link link-top"});
        let element2 = new _ui("line").attr({class: "map-link link-middle"});
        let element3 = new _ui("line").attr({class: "map-link link-bottom"});

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
    }
    updateLink (_linkId, _data) {
        let link = this._links[_linkId];

        if (exists(_data.massStatus) && _data.massStatus !== link.data.massStatus) {
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

        if (exists(_data.timeStatus) && _data.timeStatus !== link.data.timeStatus) {
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

        if (exists(_data.shipSizeType) && _data.shipSizeType !== link.data.shipSizeType) {
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
    }
    removeLink (_linkId) {
        let linkData = this._links[_linkId];

        this.linksLayer.remove(linkData.element);
        this.linksLayer.remove(linkData.element2);
        this.linksLayer.remove(linkData.element3);

        delete this._links[_linkId];

        this._forceLinks = this.forceLinks();

        this._sfForce.call();
    }
    enableForce (_bool) {
        this._forceEnable = _bool;
        this._sfForce.call();
    }
    collectPositions () {
        let out = [];

        let nodes = this.magnifier.objects();

        for (let a = 0; a < nodes.length; a++) {
            let nodeInfo = nodes[a];
            let marker = this._markers[nodeInfo.id];
            out.push({markerId: nodeInfo.id, id: marker.data.customId, x: nodeInfo.x, y: nodeInfo.y});
        }

        return out;
    }
    _onMarkerClick (_markerId, _event) {
        this._onMarkerMouseOut(_markerId, _event)

        let marker = this._markers[_markerId];
        this.emit("markerClicked", marker.data.customId, _event);
    }
    _onMarkerContext (_markerId, _event) {
        _event.stopPropagation();
        _event.preventDefault();

        let marker = this._markers[_markerId];
        this.emit("systemContextMenu", marker.data.customId, _event);
    }
    _onMarkerMouseIn (_markerId, _event){
        if(!this._isDragging) {
            let marker = this._markers[_markerId];
            this.emit("markerIn", marker.data.customId, _event);
        }
    }
    _onMarkerMouseOut (_markerId, _event){
        let marker = this._markers[_markerId];
        this.emit("markerOut", marker.data.customId, _event);
    }
    _onLinkClick (/*_linkId*/) {
        // let linkData = this._links[_linkId];
        // debugger;
    }
    _onLinkContext (_linkId, _event) {
        _event.stopPropagation();
        _event.preventDefault();

        let linkData = this._links[_linkId];

        this.emit("linkContextMenu", linkData.customId, _event);
    }
    startForce () {
        this.simulation && this.simulation.stop();
        this.simulation = d3.forceSimulation(this.magnifier.objects());
        this.simulation.force("kek2", collideRect(w, h));

        if(this._forceEnable) {
            let linkForce = d3.forceLink(this._forceLinks).id(function (d) {
                return d.id;
            });
            linkForce.strength(0.17);
            linkForce.distance(function (d) {
                let src = this.countLinksForNode(d.source.id);
                let trg = this.countLinksForNode(d.target.id);
                let log = Math.log(Math.min(src, trg));
                if (log < 1) log = 0.8;
                return log * linkDistance;
            }.bind(this));

            this.simulation.force("link", linkForce);

            this.simulation.force("charge", d3.forceManyBody().strength(function (d) {
                return 10 / (this.countLinksForNode(d.id) || 1) * strength
            }.bind(this)));
        }

        this.simulation.on("tick", this._onSimulationTick.bind(this));
    }
    countLinksForNode (_nodeId) {
        let count = 0;
        this._forceLinks.map(function (_link) {
            if(_link.target.id === _nodeId || _link.source.id === _nodeId) {
                count++;
            }
        });
        return count;
    }
    findMarker (_v2) {
        let reals = this.magnifier.getReal();

        for (let a = 0; a < reals.length; a++) {
            let node = reals[a];
            if (_v2.isInsideRect(node.x - w / 2, node.y - h / 2, w, h)) {
                return this.magnifier.objects().searchByObjectKey("id", node.id);
            }
        }

        return null;
    }
    forceLinks () {
        let out = [];

        for (let lid in this._links) {
            out.push({
                source: this._links[lid].source,
                target: this._links[lid].target,
                id: lid,
            })
        }

        return out;
    }
    _onSimulationTick () {
        this.magnifier.objects().map(function (_obj) {
            this._markers[_obj.id].data.x = _obj.x;
            this._markers[_obj.id].data.y = _obj.y;
        }.bind(this));

        this.render();
    }
    render () {
        if(this._lock)
            return;

        this._lock = true;

        this._reqId = requestAnimationFrame(function () {
            this._render();
            this._lock = false;
        }.bind(this));
    }
    _render () {
        let realCoords = this.magnifier.getReal();

        this._forceLinks.forEach(function (_link) {
            let linkData = this._links[_link.id];

            let sourceMarker = this._markers[linkData.source].data;
            let targetMarker = this._markers[linkData.target].data;

            let source = this.magnifier.convertToReal(new Vector2(sourceMarker.x, sourceMarker.y));
            let target = this.magnifier.convertToReal(new Vector2(targetMarker.x, targetMarker.y));

            linkData.element.attr({
                // d:printf("M%s,%s C%s,%s %s,%s %s,%s", source.x, source.y, cp1.x, cp1.y, cp2.x, cp2.y, target.x, target.y),
                x1: source.x,
                y1: source.y,
                x2: target.x,
                y2: target.y,
            });
            // Render source point

            linkData.element2.attr({
                // d: printf("M100,250 C100,100 351,211 306,273 Z"),
                x1: source.x,
                y1: source.y,
                x2: target.x,
                y2: target.y,
            });

            linkData.element3.attr({
                // d: printf("M100,250 C100,100 351,211 306,273 Z"),
                x1: source.x,
                y1: source.y,
                x2: target.x,
                y2: target.y,
            });
        }.bind(this));


        realCoords.forEach(function (_node) {
            let marker = this._markers[_node.id];

            let x = _node.x - w/2;
            let y = _node.y - h/2;

            marker.wrapper.css("transform", printf("translate(%spx,%spx)", x, y));
        }.bind(this));
    }
    getVirtualBy (_vector) {
        return this.magnifier.convertToVirtual(_vector);
    }
    getMarkersAndLinksByArea (_lt, _rb) {
        let area = new Rectangle(_lt, _rb);

        let selected = [];
        let markers = this.collectPositions();
        for (let a = 0; a < markers.length; a++) {
            let marker = markers[a];

            let markerRect = new Rectangle(
                new Vector2(marker.x - w / 2, marker.y - h / 2),
                new Vector2(marker.x + w / 2, marker.y + h / 2)
            )
            let isIntersects = area.crossOrInside(markerRect);

            if(isIntersects)
                selected.push(marker.markerId);
        }

        return selected;
    }
    deselectAll () {
        for(let markerId in this._markers) {
            this._markers[markerId].data.isSelect && this._markers[markerId].select(false);
        }
    }
    setSelectMarker (_markerId, _isSelect) {
        this._markers[_markerId].select(_isSelect);
    }
    selected () {
        let out = [];
        for (let markerId in this._markers) {
            if (this._markers[markerId].data.isSelect)
                out.push(this._markers[markerId].data.customId);
        }
        return out;
    }
    refresh () {
        let bounds = this.container/*.parentElement.parentElement.parentElement.*/.getBoundingClientRect();
        this.setSize(bounds.width, bounds.height);
    }
    setSize (_w, _h) {
        this.width = _w;
        this.height = _h;
        this.svg.attr("width", this.width);
        this.svg.attr("height", this.height);
        this.magnifier.setSize(this.width, this.height);
        this.render();
    }
}

export default Map;