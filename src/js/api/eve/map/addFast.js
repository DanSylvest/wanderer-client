/**
 * Created by Aleksey Chichenkov <cublakhan257@gmail.com> on 5/21/20.
 */

import CustomPromise from '../../../env/promise';

/**
 * @typedef {Object} AddFastOptions
 * @property {string} mapName
 * @property {string} mapDescription
 * @property {string} mapNote
 * @property {string} groupName
 * @property {string} groupDescription
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
export default function ({
  mapName,
  mapDescription,
  mapNote,
  groupName,
  groupDescription,
  characterId,
  shareForCorporation,
  shareForAlliance,
}) {
  let p = new CustomPromise();

  let id = this.add(function (_e) {
    this.remove(id);
    _e.success ? p.resolve(_e.data) : p.reject(_e.error);
  }.bind(this));

  this.send(id, ['api', 'eve', 'map', 'addFast'], {
    mapName,
    mapDescription,
    mapNote,
    groupName,
    groupDescription,
    characterId,
    shareForCorporation,
    shareForAlliance,
  });

  return p.native;
}