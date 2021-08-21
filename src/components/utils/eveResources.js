export const getCharImageUrlStyle = (characterId) => {
    return {"background-image": `url("https://images.evetech.net/characters/${characterId}/portrait")`};
}

export const getAllyImageUrlStyle = (allianceId) => {
    return {"background-image": `url("https://images.evetech.net/alliances/${allianceId}/logo?size=128")`};
}

export const getCorpImageUrlStyle = (corporationId) => {
    return {"background-image": `url("https://images.evetech.net/corporations/${corporationId}/logo?size=128")`};
}