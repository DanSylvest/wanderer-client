import axios from "axios";

export const getCorporationInfo = async (corporationId) => {
    try {
        const res = await axios.get(`https://esi.evetech.net/latest/corporations/${corporationId}/?datasource=tranquility`);
        return res.data;
    } catch (e) {
        console.error(e);
    }
}