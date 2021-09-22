import Emitter from '../../js/env/tools/emitter';
import cache from '../../js/cache/cache';
import CustomPromise from '../../js/env/promise';

export class AllianceSubscription extends Emitter{
  /**
   *
   * @type {null|string}
   */
  allianceId = null;

  /**
   *
   * @type {boolean}
   */
  loaded = false;

  /**
   *
   * @type {function | undefined}
   */
  unsubscribeHandler = undefined;


  /**
   *
   * @param {string} allianceId
   * @param {function | undefined} [onLoad]
   */
  constructor (allianceId, onLoad) {
    super();

    this.onLoad = onLoad || undefined;
    this.allianceId = allianceId;
    this.subscribe();
  }

  destructor () {
    this.unsubscribe();
    super.destructor();
  }

  onLoaded () {
    this.loaded = true;
    this.onLoad && this.onLoad();
  }

  subscribe () {
    this.loaded = false;
    const publicInfo = cache.alliances.list.get(this.allianceId).publicInfo;
    this.unsubscribeHandler = publicInfo.subscribe();
    publicInfo.readyPromise().then(this.onLoaded.bind(this));
  }

  unsubscribe () {
    if (this.unsubscribeHandler) {
      this.unsubscribeHandler();
      delete this.unsubscribeHandler;
    }
  }
}

/**
 *
 * @param allianceId
 * @returns {Promise<{
 *   name: string
 *   allianceId: number
 * }>}
 */
export const getCachedAlliancePublicInfo = async (allianceId) => {
  let promise = new CustomPromise();
  let subscription = new AllianceSubscription(allianceId);
  subscription.onLoad = () => {
    const data = cache.alliances.list.get(allianceId).publicInfo.data();
    subscription.destructor();
    subscription = undefined;
    promise.resolve({ ...data });
  };
  return promise.native;
};