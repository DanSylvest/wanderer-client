/**
 * Created by Aleksey Chichenkov <cublakhan257@gmail.com> on 5/21/20.
 */
import CustomPromise from '../../../env/promise';

/**
 *
 * @returns {Promise<{name: string, addDate: Date, id: string}[]|{code: number, error: any}>}
 */
export default function () {
  let p = new CustomPromise();

  let id = this.add(function (_e) {
    this.remove(id);
    _e.success ? p.resolve(_e.data) : p.reject(_e.error);
  }.bind(this));

  this.send(id, ['api', 'eve', 'character', 'list'], {});

  return p.native;
}