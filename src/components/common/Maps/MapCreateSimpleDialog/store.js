import { setProps } from '../../../utils/setProps';

const defaultData = {
  firstValid: false,
  secondValid: false,

  mapName: null,
  mapDescription: null,
  mapNote: null,
  groupName: null,
  groupDescription: null,
  characterId: null,
  shareCorporation: false,
  shareAlliance: false,
};

export const MapCreateSimpleDialogStore = {
  namespaced: true,
  state: () => ({ ...defaultData }),
  mutations: {
    setMapValid: (context, isValid) => context.firstValid = isValid,
    setGroupValid: (context, isValid) => context.secondValid = isValid,
    updateMap (context, { name, description, note }) {
      context.mapName = name;
      context.mapDescription = description;
      context.mapNote = note;
    },
    updateGroup (context, { name, description }) {
      context.groupName = name;
      context.groupDescription = description;
    },
    updateShare (context, data) {
      setProps(context, data);
    },
    clearAll: (context) => setProps(context, defaultData),
  },
  actions: {
    setMapDataAndValid: (context, data) => {
      context.commit('updateMap', data);
      context.commit('setMapValid', true);
    },
    setGroupDataAndValid: (context, data) => {
      context.commit('updateGroup', data);
      context.commit('setGroupValid', true);
    },
    setMapInvalid: (context) => context.commit('setMapValid', false),
    setGroupInvalid: (context) => context.commit('setGroupValid', false),

    updateShare: (context, data) => context.commit('updateShare', data),
    clearAll: (context) => context.commit('clearAll'),
  },
};