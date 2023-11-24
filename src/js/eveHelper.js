import eveData from './eveData.js';

export default {
  isWormholeSpace (wormholeClassID) {
    switch (wormholeClassID) {
      case eveData.wormholeClassesNames.c1:
      case eveData.wormholeClassesNames.c2:
      case eveData.wormholeClassesNames.c3:
      case eveData.wormholeClassesNames.c4:
      case eveData.wormholeClassesNames.c5:
      case eveData.wormholeClassesNames.c6:
      case eveData.wormholeClassesNames.c13:
      case eveData.wormholeClassesNames.thera:
      case eveData.wormholeClassesNames.baribican:
      case eveData.wormholeClassesNames.vidette:
      case eveData.wormholeClassesNames.conflux:
      case eveData.wormholeClassesNames.redoubt:
      case eveData.wormholeClassesNames.sentinel:
        return true;
    }

    return false;
  },
  isKnownSpace (wormholeClassID) {
    switch (wormholeClassID) {
      case eveData.wormholeClassesNames.hs:
      case eveData.wormholeClassesNames.ls:
      case eveData.wormholeClassesNames.ns:
      case eveData.wormholeClassesNames.zarzakh:
        return true;
    }

    return false;
  },
  isAbyssSpace (wormholeClassID) {
    switch (wormholeClassID) {
      case eveData.wormholeClassesNames.a1:
      case eveData.wormholeClassesNames.a2:
      case eveData.wormholeClassesNames.a3:
      case eveData.wormholeClassesNames.a4:
      case eveData.wormholeClassesNames.a5:
        return true;
    }

    return false;
  },
  isPochvenSpace (wormholeClassID) {
    switch (wormholeClassID) {
      case eveData.wormholeClassesNames.pochven:
        return true;
    }

    return false;
  },
  isZarzakhSpace (wormholeClassID) {
    switch (wormholeClassID) {
      case eveData.wormholeClassesNames.zarzakh:
        return true;
    }

    return false;
  },
  isCCP (wormholeClassID) {
    switch (wormholeClassID) {
      case eveData.wormholeClassesNames.ccp1:
      case eveData.wormholeClassesNames.ccp2:
      case eveData.wormholeClassesNames.ccp3:
      case eveData.wormholeClassesNames.ccp4:
        return true;
    }

    return false;
  },
  isTriglavianInvasion (triglavianInvasionStatus) {
    switch (triglavianInvasionStatus) {
      case 'Normal':
        return false;
      case 'Final':
      case 'Edencom':
      case 'Triglavian':
        return true;
    }
  },
  extractEffects (effectName, effectPower) {
    let effect = window.eveStaticData.effects[effectName];
    let out = [];

    effect.modifiers.map(mod => {
      let modPower = mod.power[effectPower - 1];

      out.push({
        name: mod.name,
        power: modPower,
        positive: mod.positive,
      });
    });

    out.sort((a, b) => (a.positive === b.positive) ? 0 : a.positive ? -1 : 1);

    return out;
  },
  getStaticsData (statics) {
    return statics.map(x => {
      let staticData = window.eveStaticData.wormholes[x];
      let wormholeClassID = window.eveStaticData.wormholeClasses[staticData.dest].wormholeClassID;
      return { wormholeClassID, ...staticData };
    })
      .sort((a, b) => a.wormholeClassID - b.wormholeClassID);
  },
  getWormholeData (wormholeId) {
    return window.eveStaticData.wormholeClasses[wormholeId];
  },
  getWormholeTypeData (wormholeId) {
    return window.eveStaticData.wormholes[wormholeId];
  },
  sortStatics (statics) {
     return statics
      .map(x => this.getWormholeTypeData(x))
      .map(({ name, dest }) => ({
        name,
        wormholeClassID: this.getWormholeData(dest)
      }))
      .sort((a, b) => a.wormholeClassID - b.wormholeClassID)
      .map(x => x.name)
  },
};