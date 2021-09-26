/**
 * Created by Aleksey Chichenkov <cublakhan257@gmail.com> on 5/21/20.
 */

import CustomPromise from '../../../env/promise';

/**
 * @typedef {Object} AddFastOptions
 * @property {string} name
 * @property {string} description
 * @property {boolean} shareForCorporation
 * @property {boolean} shareForAlliance
 * @property {string} characterId
 *
 * @typedef {Object} AddFastOptionsReturn
 * @property {string} mapId
 * @property {string} name
 * @property {string} owner
 * @property {string} description
 * @property {string[]} groups
 */

/**
 *
 * @param {AddFastOptions} _options
 * @returns {Promise<AddFastOptionsReturn>}
 */
export default function ({ name, description, shareForCorporation, shareForAlliance, characterId }) {
  let p = new CustomPromise();

  let id = this.add(function (_e) {
    this.remove(id);
    _e.success ? p.resolve(_e.data) : p.reject(_e.error);
  }.bind(this));

  this.send(id, ['api', 'eve', 'map', 'addFast'], {
    name, description, shareForCorporation, shareForAlliance, characterId,
  });

  return p.native;
}