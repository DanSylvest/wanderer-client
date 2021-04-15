import AbstractStore from "./abstractStore.js";
const NamespacedStore = AbstractStore.extend({
    namespaced: true
});
export default NamespacedStore;