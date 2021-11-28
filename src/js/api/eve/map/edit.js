/**
 * Created by Aleksey Chichenkov <cublakhan257@gmail.com> on 5/21/20.
 */

import CustomPromise from '../../../env/promise';

/**
 *
 * @param {string} _mapId
 * @param {{name: String, description: String, note: String, groups: Array<String>=}} opts
 * @returns {*}
 */
export default function (_mapId, { name, description, note, groups }) {
  let p = new CustomPromise();

  let id = this.add(function (_e) {
    this.remove(id);
    _e.success ? p.resolve(_e) : p.reject(_e.error);
  }.bind(this));

  this.send(id, ['api', 'eve', 'map', 'edit'], {
    mapId: _mapId,
    ...(name && { name }),
    ...(description && { description }),
    ...(note && { note }),
    ...(groups && { groups }),
  });

  return p.native;
}