/**
 * Created by Aleksey Chichenkov <cublakhan257@gmail.com> on 8/31/20.
 */

export default {
    digits: [
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9
    ],
    letters: [
        "A","B","C","D","E","F","X","Y","Z",
    ],

    securityForegroundClasses : {
        "1.0": "eve-security-color-10",
        "0.9": "eve-security-color-09",
        "0.8": "eve-security-color-08",
        "0.7": "eve-security-color-07",
        "0.6": "eve-security-color-06",
        "0.5": "eve-security-color-05",
        "0.4": "eve-security-color-04",
        "0.3": "eve-security-color-03",
        "0.2": "eve-security-color-02",
        "0.1": "eve-security-color-01",
        "0.0": "eve-security-color-00",
        "-0.0": "eve-security-color-00",
        "-0.1": "eve-security-color-m-01",
        "-0.2": "eve-security-color-m-02",
        "-0.3": "eve-security-color-m-03",
        "-0.4": "eve-security-color-m-04",
        "-0.5": "eve-security-color-m-05",
        "-0.6": "eve-security-color-m-06",
        "-0.7": "eve-security-color-m-07",
        "-0.8": "eve-security-color-m-08",
        "-0.9": "eve-security-color-m-09",
        "-1.0": "eve-security-color-m-10"
    },

    securityBackgroundClasses : {
        "1.0": "eve-security-background-10",
        "0.9": "eve-security-background-09",
        "0.8": "eve-security-background-08",
        "0.7": "eve-security-background-07",
        "0.6": "eve-security-background-06",
        "0.5": "eve-security-background-05",
        "0.4": "eve-security-background-04",
        "0.3": "eve-security-background-03",
        "0.2": "eve-security-background-02",
        "0.1": "eve-security-background-01",
        "0.0": "eve-security-background-00",
        "-0.0": "eve-security-background-00",
        "-0.1": "eve-security-background-m-01",
        "-0.2": "eve-security-background-m-02",
        "-0.3": "eve-security-background-m-03",
        "-0.4": "eve-security-background-m-04",
        "-0.5": "eve-security-background-m-05",
        "-0.6": "eve-security-background-m-06",
        "-0.7": "eve-security-background-m-07",
        "-0.8": "eve-security-background-m-08",
        "-0.9": "eve-security-background-m-09",
        "-1.0": "eve-security-background-m-10"
    },

    typeClasses : {
        "C1"  : "eve-wh-type-color-c1",
        "C2"  : "eve-wh-type-color-c2",
        "C3"  : "eve-wh-type-color-c3",
        "C4"  : "eve-wh-type-color-c4",
        "C5"  : "eve-wh-type-color-c5",
        "C6"  : "eve-wh-type-color-c6",
        "C12" : "eve-wh-type-color-thera",
        "C13" : "eve-wh-type-color-c13",
        "D"   : "eve-wh-type-color-drifter",
        "H"   : "eve-wh-type-color-high",
        "L"   : "eve-wh-type-color-low",
        "N"   : "eve-wh-type-color-null"
    },

    typeBackgroundClasses : {
        "C1"  : "eve-wh-type-background-c1",
        "C2"  : "eve-wh-type-background-c2",
        "C3"  : "eve-wh-type-background-c3",
        "C4"  : "eve-wh-type-background-c4",
        "C5"  : "eve-wh-type-background-c5",
        "C6"  : "eve-wh-type-background-c6",
        "C12" : "eve-wh-type-background-thera",
        "C13" : "eve-wh-type-background-c13",
        "D"   : "eve-wh-type-background-drifter",
        "H"   : "eve-wh-type-background-high",
        "L"   : "eve-wh-type-background-low",
        "N"   : "eve-wh-type-background-null"
    },

    kindClassed : {
        "0" : "eve-kind-color-high",
        "1" : "eve-kind-color-low",
        "2" : "eve-kind-color-null",
        "3" : "eve-kind-color-wh",
        "4" : "eve-kind-color-thera",
        "5" : "eve-kind-color-abyss",
        "6" : "eve-kind-color-penalty",
        "7" : "eve-kind-color-pochven",
    },


    kindBackgroundClasses : {
        "0" : "eve-kind-background-high",
        "1" : "eve-kind-background-low",
        "2" : "eve-kind-background-null",
        "3" : "eve-kind-background-wh",
        "4" : "eve-kind-background-thera",
        "5" : "eve-kind-background-abyss",
        "6" : "eve-kind-background-penalty",
        "7" : "eve-kind-background-pochven",
    },

    effects : {
        "pulsar"                     : "text-eve-wh-effect-color-pulsar",
        "magnetar"                   : "text-eve-wh-effect-color-magnetar",
        "wolfRayet"                  : "text-eve-wh-effect-color-wolfRayet",
        "blackHole"                  : "text-eve-wh-effect-color-blackHole",
        "cataclysmicVariable"        : "text-eve-wh-effect-color-cataclysmicVariable",
        "redGiant"                   : "text-eve-wh-effect-color-redGiant",

        "dazhLiminalityLocus"        : "text-eve-wh-effect-color-dazhLiminalityLocus",
        "imperialStellarObservatory" : "text-eve-wh-effect-color-imperialStellarObservatory",
        "stateStellarObservatory"    : "text-eve-wh-effect-color-stateStellarObservatory",
        "republicStellarObservatory" : "text-eve-wh-effect-color-republicStellarObservatory",
        "federalStellarObservatory"  : "text-eve-wh-effect-color-federalStellarObservatory",
    },


    statuses : [
        {id: "unknown", name: "unknown", icon: "block"},
        {id: "home", name: "Home", icon: "invert_colors"},
        {id: "friendly", name: "friendly", icon: "invert_colors"},
        {id: "lookingFor", name: "looking for", icon: "invert_colors"},
        {id: "warning", name: "warning", icon: "invert_colors"},
        {id: "targetPrimary", name: "target primary", icon: "invert_colors"},
        {id: "targetSecondary", name: "target secondary", icon: "invert_colors"},
        {id: "dangerousPrimary", name: "dangerous primary", icon: "invert_colors"},
        {id: "dangerousSecondary", name: "dangerous secondary", icon: "invert_colors"},
    ],

    statusesNames : {
        unknown: 0,
        friendly: 1,
        warning: 2,
        targetPrimary: 3,
        targetSecondary: 4,
        dangerousPrimary: 5,
        dangerousSecondary: 6,
        lookingFor: 7,
        home: 8,
    },

    advices : [
        {type: "joke", name: "", description: "Sabre on DScan"},

        {type: "advice", name: "", description: "Don't forget close a K162 before the klac klac"},

        {type: "mapperHelp", name: "", description: "You can add yourself, corporations and alliances to your group"},
        {type: "mapperHelp", name: "", description: "Don't forget check available groups."},
        {type: "mapperHelp", name: "", description: "Available groups - groups to which you have access."},
        {type: "mapperHelp", name: "", description: "You can check route on your map - just mark system as hub."},
    ],

    timeStatuses: [
        {title: "Whole", icon: "done_all", id: 0},
        {title: "End of life", icon: "error_outline", id: 1},
    ],

    massStatuses: [
        {title: "Whole", icon: "done", id: 0},
        {title: "Less than half", icon: "trending_down", id: 1},
        {title: "Verge of collapse", icon: "error_outline", id: 2},
    ],

    shipSizeStatuses: [
        {title: "Frigate (S)", icon: "done", id: 0},
        {title: "Normal (M/L)", icon: "trending_down", id: 1},
        {title: "Capital (XL)", icon: "error_outline", id: 2},
    ],

    dScan: {
        kindNames: {
            cosmicSignature: "Cosmic Signature",
            cosmicAnomaly: "Cosmic Anomaly",
            structure: "Structure",
            starbase: "Starbase",
            drone: "Drone",
            deployable: "Deployable",
            ship: "Ship",
        },
        kinds: [
            {id: "Cosmic Signature"},
            {id: "Cosmic Anomaly"},
        ],
        groups: [
            {id: "Gas Site"},
            {id: "Relic Site"},
            {id: "Data Site"},
            {id: "Ore Site"},
            {id: "Combat Site"},
            {id: "Wormhole"},
            {id: ""},
        ],
        names: [
            {id: ""}
        ]
    },

    signaturesTypes : [
        {id: "cosmicAnomaly", title: "Show Anomalies", value: true},
        {id: "cosmicSignature", title: "Show Cosmic Signatures", value: true},
        {id: "deployable", title: "Show Deployables", value: true},
        {id: "structure", title: "Show Structures", value: true},
        {id: "starbase", title: "Show Starbase", value: true},
        {id: "ship", title: "Show Ships", value: true},
        {id: "drone", title: "Show Drones And Charges", value: true},
    ],

    defaultRouteSettings: {
        pathType: "shortest",
        includeMassCrit: true,
        includeEol: true,
        includeFrig: true,
        includeCruise: true,
        avoidWormholes: false,
        avoidPochven: false,
        avoidEdencom: false,
        avoidTriglavian: false,
        includeThera: true,
    }
}