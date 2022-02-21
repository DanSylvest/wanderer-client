import Emitter from '../../env/tools/emitter';
import SpamFilter from '../../env/spamFilter';
import extend from '../../env/tools/extend';
import exists from '../../env/tools/exists';
import Vector2 from '../../env/vector2';
import ActionObserver from '../../env/actionObserver';
import _ui from '../../env/ui';
import Magnifier from '../../env/magnifier';
import printf from '../../env/tools/printf';
import Rectangle from '../../env/rectangle';
import Marker from './marker';
import Chain from './chain.js';
import collideRect from '../../libs/d3/collideRect';

const d3 = require('d3-force');

const w = 140;
const h = 30;
// const strength  = -10;
// const linkDistance = w * 1.2;
const BOUNDS = {
  HORIZONTAL: 3000,
  VERTICAL: 2000,
};

let counter = 0;

let stCounter = 0;
const ST_INITAL = stCounter++;
// const ST_DRAGGING = stCounter++;
const ST_CONNECTING = stCounter++;

class Map extends Emitter{
  constructor (_options) {
    let base = extend({
      container: null,
      width: null,
      height: null,
    }, _options);

    super();

    /**
     *
     * @type {Object.<string, Marker>}
     * @private
     */
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
    this._state = ST_INITAL;
    // this._test();

    this._createActionObservers();

    window.addEventListener('resize', this._refresHandler);

    this._sfForce = new SpamFilter(this.startForce.bind(this), 10);
    this._onSimulationTick();
  }

  destructor () {
    window.removeEventListener('resize', this._refresHandler);

    this._sfForce.stop();
    this._sfForce = null;

    this.container.removeChild(this.svg.el);
    this.container.removeChild(this.htmlContainer.el);
    this.container.classList.remove('eve-marker-root-container');

    if (this._reqId !== -1) {
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

  setOffset (x, y) {
    this.magnifier.hAxis.min = x;
    this.magnifier.vAxis.min = y;
    this.render();
  }

  _createActionObservers () {
    this._ao2 = new ActionObserver({
      offOnOut: false,
      container: this.svg.el,
      mdCondition: function (_event) {
        return !_event.originalEvent.ctrlKey && !_event.originalEvent.shiftKey && !this.findMarker(_event.mouse);
      }.bind(this),
    });
    let rlStarted = null;
    let savedAxis = null;

    this._ao2.on('click', function () {
      this.emit('mapClicked');
    }.bind(this));

    this._ao2.on('dragStart', function (_event) {
      this.emit('dragStarted');
      rlStarted = _event.mouse;
      savedAxis = new Vector2(this.magnifier.hAxis.min, this.magnifier.vAxis.min);

      this.render();
    }.bind(this));

    this._ao2.on('dragging', function (_event) {
      let curReal = _event.mouse;

      let rDelta = curReal['-'](rlStarted);
      let v = this.magnifier.in(rDelta);

      let hAxis_min = savedAxis.x - v.x;
      let vAxis_min = savedAxis.y - v.y;

      if (hAxis_min + this.magnifier.hAxis.range > BOUNDS.HORIZONTAL)
        hAxis_min = BOUNDS.HORIZONTAL - this.magnifier.hAxis.range;

      if (hAxis_min < -BOUNDS.HORIZONTAL)
        hAxis_min = -BOUNDS.HORIZONTAL;

      if (vAxis_min + this.magnifier.vAxis.range > BOUNDS.VERTICAL)
        vAxis_min = BOUNDS.VERTICAL - this.magnifier.vAxis.range;

      if (vAxis_min < -BOUNDS.VERTICAL)
        vAxis_min = -BOUNDS.VERTICAL;


      this.magnifier.hAxis.min = /*savedAxis.x - v.x*/hAxis_min;
      this.magnifier.vAxis.min = /*savedAxis.y - v.y*/vAxis_min;

      this.emit('offsetChanged', new Vector2(this.magnifier.hAxis.min, this.magnifier.vAxis.min));
      this.render();
    }.bind(this));

    this._ao2.on('dragEnd', function (/*_event*/) {
      this.render();
    }.bind(this));
  }

  _upgradeSvg () {
    this.svg = new _ui('svg').attr({
      baseProfile: 'full',
      xmlns: 'http://www.w3.org/2000/svg',
    });
    this.container.appendChild(this.svg.el);
    this.svg.classAdd('wd', 'fs');

    this.htmlContainer = new _ui('div');
    this.htmlContainer.el.classList.add('eve-marker-container');
    this.container.appendChild(this.htmlContainer.el);

    this.container.classList.add('eve-marker-root-container');

    this.linksLayer = new _ui('g');

    this.svg.append(this.linksLayer);
  }

  _createMap () {
    this.magnifier = new Magnifier();
    this.magnifier.setSize(this.width, this.height);
    this.magnifier.toCenter();
  }

  resetOffset () {
    this.setOffset(-this.width / 2, -this.height / 2);
    this.render();
    this.emit('offsetChanged', new Vector2(this.magnifier.hAxis.min, this.magnifier.vAxis.min));
  }

  createMarker (customId, _options) {
    let base = extend({
      customId: customId,
      isLocked: false,
    }, _options);

    let mid = counter++;

    let marker = new Marker({
      customId: customId,
    });
    this.htmlContainer.append(marker.wrapper);

    marker.on('mousedown', this._onMarkerDown.bind(this, mid));
    marker.on('contextmenu', this._onMarkerContext.bind(this, mid));
    marker.on('mousein', this._onMarkerMouseIn.bind(this, mid));
    marker.on('mouseout', this._onMarkerMouseOut.bind(this, mid));
    marker.on('mouseinLazy', this._onMarkerMouseInLazy.bind(this, mid));
    marker.on('mouseoutLazy', this._onMarkerMouseOutLazy.bind(this, mid));

    this._markers[mid] = marker;

    if (_options.position) {
      this.magnifier.addObject({
        id: mid,
        fx: base.isLocked ? base.position.x : null,
        fy: base.isLocked ? base.position.y : null,
        x: base.position.x,
        y: base.position.y,
      });
    }

    this.updateMarker(mid, base);

    return mid;
  }

  updateMarker (_markerId, _data) {
    let marker = this._markers[_markerId];

    let hasPositionOld = exists(marker.data.position);
    let hasPositionNew = exists(_data.position);

    if (hasPositionOld && exists(_data.isLocked) && _data.isLocked !== marker.data.isLocked) {
      let obj = this.magnifier.objects().searchByObjectKey('id', _markerId);
      obj.lock = _data.isLocked;
      if (_data.isLocked) {
        obj.fx = obj.x;
        obj.fy = obj.y;
      } else {
        obj.fx = undefined;
        obj.fy = undefined;
      }
      this._sfForce.call();
    }

    if (!hasPositionOld && hasPositionNew) {
      this.magnifier.addObject({
        id: _markerId,
        fx: marker.data.isLocked ? _data.position.x : null,
        fy: marker.data.isLocked ? _data.position.y : null,
        x: _data.position.x,
        y: _data.position.y,
      });
      this._sfForce.call();
    } else if (hasPositionNew && hasPositionOld && (_data.position.x !== marker.data.position.x || _data.position.y !== marker.data.position.y)) {
      let obj = this.magnifier.objects().searchByObjectKey('id', _markerId);
      obj.x = _data.position.x;
      obj.y = _data.position.y;

      if (exists(_data.isLocked) && _data.isLocked) {
        obj.fx = obj.x;
        obj.fy = obj.y;
      }

      this._sfForce.call();
    }

    marker.update(_data);
  }

  _onMarkerDown (_markerId, _event) {
    if (_event.shiftKey) {
      this._onMarkerClick(_markerId, _event);
      return;
    }

    if (_event.ctrlKey) {
      this.initLinkDragging(_markerId, _event);
      return;
    }

    this.markerDrag(_markerId, _event);
  }

  initLinkDragging (_markerId, _event) {
    this._aoConnecting = new ActionObserver({
      container: this.svg.el,
      offOnOut: false,
      mdCondition: function (_event) {
        return !_event.originalEvent.shiftKey && _event.originalEvent.ctrlKey && this.findMarker(_event.mouse);
      }.bind(this),
    });

    this._aoConnecting._onMouseDown(_event);

    let source = new Vector2();
    let sourceMarkerId = null;
    this._aoConnecting.on('dragStart', function (_event) {
      this._state = ST_CONNECTING;
      source = this.magnifier.convertToReal(new Vector2(_event.subject.x, _event.subject.y));
      sourceMarkerId = this._markers[_event.subject.id].data.customId;
      this.createTempChain();
      this.tempChain.setPosition(source.x, source.y, _event.mouse.x, _event.mouse.y);
      this.disableMarkersActions(true);
      this.shadeAll(true);
      this.shadeMarker(_event.subject.id, false);
    }.bind(this));

    this._aoConnecting.on('dragging', function (_event) {
      this.shadeAll(true);
      this.shadeMarker(_event.subject.id, false);

      let currentMarker = this.findMarker(_event.mouse);
      if (currentMarker)
        this.shadeMarker(currentMarker.id, false);

      this.tempChain.setPosition(source.x, source.y, _event.mouse.x, _event.mouse.y);
    }.bind(this));

    this._aoConnecting.on('dragEnd', function (_event) {
      this.shadeAll(false);
      this.disableMarkersActions(false);
      this.removeTempChain();
      this._state = ST_INITAL;

      let currentMarker = this.findMarker(_event.mouse);
      if (currentMarker) {
        let targetMarkerId = this._markers[currentMarker.id].data.customId;
        this.emit('newChain', sourceMarkerId, targetMarkerId);
      }

      requestAnimationFrame(function () {
        source = null;
        sourceMarkerId = null;
        this._aoConnecting.destructor();
        this._aoConnecting = null;
      }.bind(this));
    }.bind(this));
  }

  markerDrag (_markerId, _event) {
    this._ao = new ActionObserver({
      container: this.svg.el,
      offOnOut: false,
      mdCondition: function (_event) {
        return !_event.originalEvent.ctrlKey && !_event.originalEvent.shiftKey && this.findMarker(_event.mouse);
      }.bind(this),
    });

    this._ao._onMouseDown(_event);

    this._ao.on('click', function (_event) {
      _event.originalEvent.stopPropagation();
      this._onMarkerClick(_event.subject.id, _event.originalEvent);
    }.bind(this));

    let dragOffset = new Vector2();
    this._ao.on('dragStart', function (_event) {
      if (this._markers[_event.subject.id].data.isLocked) {
        return;
      }

      this._onMarkerMouseOut(_markerId, _event);
      this._isDragging = true;

      this._markers[_event.subject.id].wrapper.el.classList.add('eve-zInd-top');

      this.simulation.alphaTarget(0.3).restart();

      let virtual = this.magnifier.convertToVirtual(_event.mouse);
      let subjectPos = new Vector2(_event.subject.x, _event.subject.y);
      dragOffset = virtual['-'](subjectPos);

      this.render();
    }.bind(this));

    this._ao.on('dragging', function (_event) {
      if (this._markers[_event.subject.id].data.isLocked) {
        return;
      }

      let virtual = this.magnifier.convertToVirtual(_event.mouse);
      virtual['-='](dragOffset);

      _event.subject.fx = virtual.x;
      _event.subject.fy = virtual.y;

      let marker = this._markers[_event.subject.id];
      marker.data.position.x = virtual.x;
      marker.data.position.y = virtual.y;

      this.render();

    }.bind(this));

    this._ao.on('dragEnd', function (_event) {
      this._isDragging = false;

      if (this._markers[_event.subject.id].data.isLocked) {
        return;
      }

      this.simulation.alphaTarget(0);

      this._markers[_event.subject.id].wrapper.el.classList.remove('eve-zInd-top');

      let marker = this._markers[_event.subject.id];
      if (!marker.data.isLocked) {
        _event.subject.fx = null;
        _event.subject.fy = null;
      }

      requestAnimationFrame(function () {
        if (this._ao) {
          this._ao.destructor();
          this._ao = null;
        }
      }.bind(this));

      this.render();
      this.emit('markerDragged')
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

  createTempChain () {
    this.tempChain = new Chain(this.linksLayer, null, true);
  }

  removeTempChain () {
    this.tempChain.destructor();
    this.tempChain = null;
  }

  createLink (_customId, _source, _target) {
    let mid = counter++;

    let chain = new Chain(this.linksLayer);
    chain.on('click', this._onLinkClick.bind(this, mid));
    chain.on('context', this._onLinkContext.bind(this, mid));

    this._links[mid] = {
      model: chain,
      customId: _customId,
      source: _source,
      target: _target,
    };

    this.updateLink(mid, {
      massStatus: 0,
      timeStatus: 0,
      shipSizeType: 1,
    });
    this._forceLinks = this.forceLinks();
    this._sfForce.call();

    return mid;
  }

  updateLink (_linkId, _data) {
    let link = this._links[_linkId];
    link.model.update(_data);
  }

  removeLink (_linkId) {
    this._links[_linkId].model.destructor();
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
      out.push({ markerId: nodeInfo.id, id: marker.data.customId, x: nodeInfo.x, y: nodeInfo.y });
    }

    return out;
  }

  _onMarkerClick (_markerId, _event) {
    this._onMarkerMouseOut(_markerId, _event);

    let marker = this._markers[_markerId];
    this.emit('markerClicked', marker.data.customId, _event);
  }

  _onMarkerContext (_markerId, _event) {
    _event.stopPropagation();
    _event.preventDefault();

    let marker = this._markers[_markerId];
    this.emit('systemContextMenu', marker.data.customId, _event);
  }

  _onMarkerMouseIn (_markerId, _event) {
    if (!this._isDragging) {
      let marker = this._markers[_markerId];
      this.emit('markerIn', marker.data.customId, _event);
    }
  }

  _onMarkerMouseOut (_markerId, _event) {
    switch (this._state) {
      case ST_INITAL:
        this.shadeAll(false);
    }

    let marker = this._markers[_markerId];
    this.emit('markerOut', marker.data.customId, _event);
  }

  _onMarkerMouseInLazy (_markerId) {
    switch (this._state) {
      case ST_INITAL:
        this.shadeAll(true);
    }

    let result = this.getChainsAndSystemsBySystem(_markerId);

    this.shadeMarker(_markerId, false);
    result.linkedSystems.map(x => this.shadeMarker(x, false));
    result.links.map(x => this.shadeLink(x, false));
  }

  _onMarkerMouseOutLazy () {
    switch (this._state) {
      case ST_INITAL:
        this.shadeAll(false);
    }

  }

  _onLinkClick (/*_linkId*/) {
    // let linkData = this._links[_linkId];
    // debugger;
  }

  _onLinkContext (_linkId, _event) {
    _event.stopPropagation();
    _event.preventDefault();

    let linkData = this._links[_linkId];

    this.emit('linkContextMenu', linkData.customId, _event);
  }

  startForce () {
    this.simulation && this.simulation.stop();
    this.simulation = null;

    if (this._forceEnable) {
      this.simulation = d3.forceSimulation(this.magnifier.objects());
      this.simulation.force('kek2', collideRect(w, h));


      // let linkForce = d3.forceLink(this._forceLinks).id(function (d) {
      //     return d.id;
      // });
      // linkForce.strength(0.17);
      // linkForce.distance(function (d) {
      //     let src = this.countLinksForNode(d.source.id);
      //     let trg = this.countLinksForNode(d.target.id);
      //     let log = Math.log(Math.min(src, trg));
      //     if (log < 1) log = 0.8;
      //     return log * linkDistance;
      // }.bind(this));
      //
      // this.simulation.force("link", linkForce);
      //
      // this.simulation.force("charge", d3.forceManyBody().strength(function (d) {
      //     return 10 / (this.countLinksForNode(d.id) || 1) * strength
      // }.bind(this)));
      this.simulation.on('tick', this._onSimulationTick.bind(this));
    }

  }

  countLinksForNode (_nodeId) {
    let count = 0;
    this._forceLinks.map(function (_link) {
      if (_link.target.id === _nodeId || _link.source.id === _nodeId) {
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
        return this.magnifier.objects().searchByObjectKey('id', node.id);
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
      });
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
    if (this._lock)
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

      linkData.model.setPosition(source.x, source.y, target.x, target.y);
    }.bind(this));


    realCoords.forEach(function (_node) {
      let marker = this._markers[_node.id];

      let x = _node.x - w / 2;
      let y = _node.y - h / 2;

      marker.wrapper.css('transform', printf('translate(%spx,%spx)', x, y));
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
        new Vector2(marker.x + w / 2, marker.y + h / 2),
      );
      let isIntersects = area.crossOrInside(markerRect);

      if (isIntersects)
        selected.push(marker.markerId);
    }

    return selected;
  }

  deselectAll () {
    for (let markerId in this._markers) {
      this._markers[markerId].data.isSelect && this._markers[markerId].select(false);
    }
  }

  setSelectMarker (_markerId, _isSelect) {
    this._markers[_markerId].select(_isSelect);
  }

  isMarkerSelected (_markerId) {
    return this._markers[_markerId].isMarkerSelected();
  }

  setMarkerActive (_markerId, isActive) {
    this._markers[_markerId].setActive(isActive);
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
    this.magnifier.setSize(this.width, this.height);
    this.render();
  }

  disableMarkersActions (bool) {
    for (let markerId in this._markers) {
      this._markers[markerId].enableActions(!bool);
    }
  }

  shadeAll (_bool) {
    for (let markerId in this._markers) {
      this._markers[markerId].enableShade(_bool);
    }

    for (let linkId in this._links) {
      this._links[linkId].model.enableShade(_bool);
    }
  }

  shadeMarker (_markerId, _bool) {
    this._markers[_markerId].enableShade(_bool);
  }

  shadeLink (_linkId, _bool) {
    this._links[_linkId].model.enableShade(_bool);
  }

  getChainsAndSystemsBySystem (_markerId) {
    let links = [];
    let linkedSystems = [];
    for (let linkId in this._links) {
      let linkInfo = this._links[linkId];

      if (_markerId === linkInfo.target) {
        links.push(linkId);
        linkedSystems.push(linkInfo.source);
      } else if (_markerId === linkInfo.source) {
        links.push(linkId);
        linkedSystems.push(linkInfo.target);
      }

    }

    return { links: links, linkedSystems: linkedSystems };
  }


}

export default Map;