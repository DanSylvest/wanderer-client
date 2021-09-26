import RequestProvider from '../base/requestProvider';
import { PublicInfoStore } from '../../../store/modules/characters/charactersStore';
import store from '../../../store';
import axios from 'axios';
import extend from '../../../env/tools/extend';

export default class PublicInfo extends RequestProvider{
  constructor (id) {
    super();

    this._id = id;
    this._vuexModulePath = ['characters', this._id, 'publicInfo'];
    this._vuexTemplate = PublicInfoStore;

    this._addAccessData('allianceId');
    this._addAccessData('ancestryId');
    this._addAccessData('birthday');
    this._addAccessData('bloodlineId');
    this._addAccessData('corporationId');
    this._addAccessData('description');
    this._addAccessData('gender');
    this._addAccessData('name');
    this._addAccessData('raceId');
  }

  _emulateEvent () {
    return {
      type: 'bulk',
      data: extend({}, this._data),
    };
  }

  /**
   * @param event
   * @param event.allianceId {number | undefined}
   * @param event.ancestryId {number}
   * @param event.birthday {Date}
   * @param event.bloodlineId {number}
   * @param event.corporationId {number | undefined}
   * @param event.description {string}
   * @param event.gender {string}
   * @param event.name {string}
   * @param event.raceId {number}
   * @private
   */
  _eventProcess (event) {
    const {
      alliance_id: allianceId,
      ancestry_id: ancestryId,
      bloodline_id: bloodlineId,
      corporation_id: corporationId,
      race_id: raceId,
      birthday,
      description,
      gender,
      name,
    } = event;

    const processed = {
      allianceId,
      ancestryId,
      birthday,
      bloodlineId,
      corporationId,
      description,
      gender,
      name,
      raceId,
    };

    store.dispatch(`characters/${ this._id }/publicInfo/update`, processed);
    this._data = processed;
  }

  async _createRequest () {
    try {
      const res = await axios.get(`https://esi.evetech.net/latest/characters/${ this._id }/?datasource=tranquility`);
      return res.data;
    } catch (e) {
      console.error(e);
    }
  }
}
