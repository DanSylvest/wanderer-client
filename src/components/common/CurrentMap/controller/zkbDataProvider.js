// link example https://zkillboard.com/api/w-space/systemID/31002041/pastSeconds/3600/

import Emitter from '@/js/env/tools/emitter';

const TIME_IN_PAST = 60 * 60 * 3;

export class ZkbDataProvider extends Emitter{
  systems = [];
  systemsData = {};
  tid = -1;

  constructor () {
    super();
  }

  init () {
    (async () => {
      await this.fetchAll();
      this.callNewFetch();
    })();
  }

  setSystems (systems) {
    if (!systems) {
      return;
    }

    this.systems = systems.map(x => parseInt(x));

    if (this.tid !== -1) {
      clearTimeout(this.tid);
    }

    (async () => {
      await this.fetchAll();
      this.callNewFetch();
    })();
  }

  async addSystem (systemId) {
    const res = await this.fetchSystemData(systemId);
    const data = await res.json();
    this.systems.push(parseInt(systemId));
    this.systemsData[systemId] = data;
    this.emit('loaded');
  }

  removeSystem (systemId) {
    const index = this.systems.indexOf(systemId);
    if (index === -1) {
      return;
    }

    this.systems = [...this.systems.slice(0, index), ...this.systems.slice(index + 1)];
    delete this.systemsData[systemId];
  }

  callNewFetch () {
    if (this.systems.length === 0) {
      return;
    }

    if (this.tid !== -1) {
      clearTimeout(this.tid);
      this.tid = -1;
    }

    this.tid = setTimeout(async () => {
      await this.fetchAll();
      this.callNewFetch();
    }, 60000);
  }

  async fetchAll () {
    const tempSystems = this.systems.slice(0);

    const allRes = await Promise.all(tempSystems.map(x => this.fetchSystemData(x)));
    const allData = await Promise.all(allRes.map(x => x.json()));

    tempSystems.map((x, i) => this.systemsData[x] = allData[i]);
    this.emit('loaded');
  }

  getSystemZkbActivityType (kills = []) {
    if (kills.length === 0) {
      return 'noActivity';
    }

    if (kills.length <= 5) {
      return 'active';
    }

    if (kills.length <= 30) {
      return 'warn';
    }

    return 'danger';
  }

  getZkbSystemsInfo () {
    return this.systems.map(systemId => ({
      systemId,
      kills: this.systemsData[systemId],
      type: this.getSystemZkbActivityType(this.systemsData[systemId]),
    }));
  }

  async fetchSystemData (systemId) {
    return fetch(`https://zkillboard.com/api/w-space/systemID/${ systemId }/pastSeconds/${ TIME_IN_PAST }/`);
  }
}