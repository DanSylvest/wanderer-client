import api from './api.js';
import CustomPromise from './env/promise.js';

class EveStaticData{
  constructor () {
    this._promise = new CustomPromise();
    this._data = false;
  }

  async get () {
    if (!this._data) {
      api.eve.universe.staticData()
        .then(data => {

          const wormholes = Object.create(null);
          const effects = Object.create(null);
          const wormholeClasses = Object.create(null);
          const sunTypes = data.sunTypes;
          data.wormholes.map(x => wormholes[x.name] = x);
          data.effects.map(x => effects[x.name] = x);
          data.wormholeClasses.map(x => wormholeClasses[x.id] = x);

          this._promise.resolve({ wormholes, effects, wormholeClasses, sunTypes });
          this._data = true;
        });
    }

    return this._promise.native;
  }
}

export default new EveStaticData();