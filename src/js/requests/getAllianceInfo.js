import axios from "axios";

export const getAllianceInfo = async (allianceId) => {
    try {
        const res = await axios.get(`https://esi.evetech.net/latest/characters/${allianceId}/?datasource=tranquility`);
        return res.data;
    } catch (e) {
        console.error(e);
    }
}