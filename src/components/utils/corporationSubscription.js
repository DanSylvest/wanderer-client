import Emitter from '../../js/env/tools/emitter';
import cache from '../../js/cache/cache';
import CustomPromise from '../../js/env/promise';

export class CorporationSubscription extends Emitter{
  /**
   *
   * @type {null|string}
   */
  corporationId = null;

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
   * @param {string} corporationId
   * @param {function | undefined} [onLoad]
   */
  constructor (corporationId, onLoad) {
    super();

    this.onLoad = onLoad || undefined;
    this.corporationId = corporationId;
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
    const publicInfo = cache.corporations.list.get(this.corporationId).publicInfo;
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
 * @param corporationId
 * @returns {Promise<{
 *   name: string
 *   allianceId: number,
 *   corporationId: number
 * }>}
 */
export const getCachedCorporationPublicInfo = async (corporationId) => {
  let promise = new CustomPromise();
  let subscription = new CorporationSubscription(corporationId);
  subscription.onLoad = () => {
    const data = cache.corporations.list.get(corporationId).publicInfo.data();
    subscription.destructor();
    subscription = undefined;
    promise.resolve({ ...data });
  };
  return promise.native;
};