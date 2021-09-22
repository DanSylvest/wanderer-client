import Emitter from "../../js/env/tools/emitter";
import cache from "../../js/cache/cache";
import CustomPromise from "../../js/env/promise";

export class CharacterSubscription extends Emitter{
  /**
   *
   * @type {null|string}
   */
  characterId = null;

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
   * @param {string} characterId
   * @param {function | undefined} [onLoad]
   */
  constructor (characterId, onLoad) {
    super();

    this.onLoad = onLoad || undefined;
    this.characterId = characterId;
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
    const publicInfo = cache.characters.list.get(this.characterId).publicInfo;
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
 * @param characterId
 * @returns {Promise<{
 *   name: string
 *   allianceId: number,
 *   corporationId: number
 * }>}
 */
export const getCachedCharacterPublicInfo = async (characterId) => {
  let promise = new CustomPromise();
  let subscription = new CharacterSubscription(characterId);
  subscription.onLoad = () => {
    const data = cache.characters.list.get(characterId).publicInfo.data();
    subscription.destructor();
    subscription = undefined;
    promise.resolve({ ...data });
  }
  return promise.native;
}