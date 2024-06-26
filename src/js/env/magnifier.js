/**
 * Created by Aleksey Chichenkov <cublakhan257@gmail.com> on 2/12/20.
 */

import Vector2 from './vector2';
import Axis from './axis';

class Magnifier{
  constructor (_objects) {
    this.hAxis = new Axis(0, 1);
    this.vAxis = new Axis(0, 1);

    this.size = new Vector2(1, 1);
    this.ratio = new Vector2(1, 1);
    this.zoom = 1;

    this._objects = _objects || [];
  }

  destructor () {
    this.zoom = 1;

    this.hAxis = new Axis(0, 1);
    this.vAxis = new Axis(0, 1);

    this.size = new Vector2(1, 1);
    this.ratio = new Vector2(1, 1);

    this._objects = [];
  }

  addObject (_options) {
    this._objects.push({
      x: _options.x,
      y: _options.y,
      id: _options.id,
      lock: _options.isLocked,
      fx: _options.fx,
      fy: _options.fy,
    });
  }

  setObjects (_objects) {
    this._objects = _objects || [];
  }

  updateObject (id, data) {
    const obj = this.getObject(parseInt(id));
    if (!obj) {
      return;
    }

    Object.keys(data).forEach(x => {
      obj[x] = data[x];
    });
  }

  removeObject (_id) {
    this._objects.eraseByObjectKey('id', _id);
  }

  setSize (_x, _y) {
    let newSize = new Vector2(_x, _y);

    // найти отношение нового к старому
    let oldToNewRatio = new Vector2(newSize.x / this.size.x, newSize.y / this.size.y);

    this.hAxis.range = this.hAxis.range * oldToNewRatio.x;
    this.vAxis.range = this.vAxis.range * oldToNewRatio.y;

    this.size = newSize;
  }

  toCenter () {
    this.hAxis.min -= this.hAxis.range / 2;
    this.vAxis.min -= this.vAxis.range / 2;
  }

  getReal () {
    let out = [];

    for (let a = 0; a < this._objects.length; a++) {
      let object = this._objects[a];

      let x = (object.x - this.hAxis.min) / this.hAxis.range * this.size.x;
      let y = (object.y - this.vAxis.min) / this.vAxis.range * this.size.y;

      out.push({ id: object.id, x: x, y: y });
    }

    return out;
  }

  getObject (id) {
    const object = this._objects.find(x => x.id === id);
    if (!object) {
      return null;
    }

    return object;
  }

  centerById (id) {
    const object = this._objects.find(x => x.id === id);
    if (!object) {
      return;
    }

    this.hAxis.min = object.x - this.hAxis.range / 2;
    this.vAxis.min = object.y - this.vAxis.range / 2;
  }

  objects () {
    return this._objects;
  }

  convertToReal (_vector) {
    return new Vector2((_vector.x - this.hAxis.min) / this.hAxis.range * this.size.x, (_vector.y - this.vAxis.min)
      / this.vAxis.range
      * this.size.y);
  }

  convertToVirtual (_vector) {
    return new Vector2(
      _vector.x / this.size.x * this.hAxis.range + this.hAxis.min,
      _vector.y / this.size.y * this.vAxis.range + this.vAxis.min,
    );
  }

  in (_vector) {
    return new Vector2(
      _vector.x / this.size.x * this.hAxis.range,
      _vector.y / this.size.y * this.vAxis.range,
    );
  }
}

export default Magnifier;