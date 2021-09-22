import axios from "axios";

export const getCharacterInfo = async (characterId) => {
    try {
        const res = await axios.get(`https://esi.evetech.net/latest/characters/${characterId}/?datasource=tranquility`);
        return res.data;
    } catch (e) {
        console.error(e);
    }
}