/**
 * Created by Aleksey Chichenkov <cublakhan257@gmail.com> on 2/15/21.
 */

const SolarSystemStore = {
    namespaced: true,
    state: () => ({
        systemClass: null,
        security: null,
        solarSystemId: null,
        constellationId: null,
        regionId: null,
        solarSystemName: null,
        constellationName: null,
        regionName: null,
        typeDescription: null,
        classTitle: null,
        isShattered: null,
        effectName: null,
        effectPower: null,
        statics: null,
        wanderers: null,
        solarSystemNameLC: null,
        triglavianInvasionStatus: null,
    }),
    mutations: {
        setData (state, data) {
           state.systemClass = data.systemClass;
           state.security = data.security;
           state.solarSystemId = data.solarSystemId;
           state.constellationId = data.constellationId;
           state.regionId = data.regionId;
           state.solarSystemName = data.solarSystemName;
           state.constellationName = data.constellationName;
           state.regionName = data.regionName;
           state.typeDescription = data.typeDescription;
           state.classTitle = data.classTitle;
           state.isShattered = data.isShattered;
           state.effectName = data.effectName;
           state.effectPower = data.effectPower;
           state.statics = data.statics;
           state.wanderers = data.wanderers
           state.solarSystemNameLC = data.solarSystemNameLC;
           state.triglavianInvasionStatus = data.triglavianInvasionStatus;
        }
    },
    actions: {
        setData(context, data) {
            context.commit("setData", {
                systemClass: data.systemClass,
                security: data.security,
                solarSystemId: data.solarSystemId,
                constellationId: data.constellationId,
                regionId: data.regionId,
                solarSystemName: data.solarSystemName,
                constellationName: data.constellationName,
                regionName: data.regionName,
                typeDescription: data.typeDescription,
                classTitle: data.classTitle,
                isShattered: data.isShattered,
                effectName: data.effectName,
                effectPower: data.effectPower,
                statics: data.statics,
                wanderers: data.wanderers,
                solarSystemNameLC: data.solarSystemNameLC,
                triglavianInvasionStatus: data.triglavianInvasionStatus,
            })
        }
    }
}

export default SolarSystemStore;