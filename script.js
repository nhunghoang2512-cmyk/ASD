let squaresTotal = 0n;
let squaresUnclaimed = 0n;
let megaSquaresTotal = 0n;
let boardScore = 0n;
let purchaseMultiplier = 1n
let megaSquaresUnlocked = false;
let squaresAutoClaimFactor = 0n;
let lastClaimAmount = 0n;
let startingSquares = 0n;
let confirmReset = false;
let maxMegaSquares = 0n;
let gigaSquaresTotal = 0n;
let lastSave = Date.now();
let gigaSquaresUnlocked = false;
let maxGigaSquares = 0n;
let gigaSquaresUnclaimed = 0n;
let darkModeEnabled = false;
let purchaseMax = false;
let resetTimeoutCallback = () => { confirmReset = false; document.getElementById("reset-button").innerHTML = "Reset"; };
let glowCounters = []; 
let glowCountersMega = [];
let glowCountersUltra = [];
let lastUpdatedTime = Date.now();
let didUpgrade = false;
let currentTime = 0;
let redrawAll = true;
let redrawSquares = true;
let redrawGiga = true;
let redrawUltra = true;
let startingBoardBitFlippedDate = 0;
let boardScoreBinary = "";
let ultraSquaresTotal = 0n;
let maxUltraSquares = 0n;
let upgrades = {};
let autobuyers = {};
let miners = [];
let inSimulation = false;

const STATUS_STANDBY = -1
const STATUS_STOP = -2
const CURRENCY_NORMAL = "normal";
const CURRENCY_MEGA = "mega";
const CURRENCY_GIGA = "giga";
const CURRENCY_ULTRA = "ultra";

onresize = (event) => { redrawAll = true; };

function reset() {
    if (!confirmReset) {
        confirmReset = true;
        setTimeout(resetTimeoutCallback, 5000); 
        document.getElementById("reset-button").innerHTML = "Are you sure?";
    }
    else {
        resetTimeoutCallback();
        init();
        let canvas = document.getElementById("canvas");
        let ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        redrawAll = true;
    }
}

function init() {
    squaresTotal = 0n;
    squaresUnclaimed = 0n;
    megaSquaresTotal = 0n;
    boardScore = 0n;
    purchaseMultiplier = 1n;
    squaresAutoClaimFactor = 4n;
    lastClaimAmount = 0n;
    startingSquares = 0n;
    maxMegaSquares = 0n;
    gigaSquaresTotal = 0n;
    maxGigaSquares = 0n;
    gigaSquaresUnclaimed = 0n;
    ultraSquaresTotal = 0n;
    maxUltraSquares = 0n;
    lastUpdatedTime = Date.now()

    megaSquaresUnlocked = false;
    gigaSquaresUnlocked = false;
    darkModeEnabled = false;
    purchaseMax = false;
    inSimulation = false;

    upgrades = {
        "dimensions": new Upgrade("dimensions"),
        "speed": new Upgrade("speed"),
        "value": new Upgrade("value"),
        "minerCount": new Upgrade("minerCount"),
        "minerSpeed": new Upgrade("minerSpeed"),
        "speedFactor": new Upgrade("speedFactor"),
        "minerSpeedFactor": new Upgrade("minerSpeedFactor"),
        "upgradeAutoPurchaser": new Upgrade("upgradeAutoPurchaser"),
        "dimensionsAutoPurchaser": new Upgrade("dimensionsAutoPurchaser"),
        "squaresAutoClaimer": new Upgrade("squaresAutoClaimer"),
        "megasquaresAutoClaimer": new Upgrade("megasquaresAutoClaimer"),
        "startingSquares": new Upgrade("startingSquares"),
        "timerSpeedBonus": new Upgrade("timerSpeedBonus"),
        "gigaBoardUnlocked": new Upgrade("gigaBoardUnlocked"),
        "gigaBoardCounter": new Upgrade("gigaBoardCounter"),
        "gigaBoardAutoIncrement": new Upgrade("gigaBoardAutoIncrement"),
        "megaSquaresMultiplier": new Upgrade("megaSquaresMultiplier"),
        "megaStartingLevel": new Upgrade("megaStartingLevel"),
        "megaUpgradeAutoPurchaser": new Upgrade("megaUpgradeAutoPurchaser"),
        "gigaBoardAutoIncrementAmount": new Upgrade("gigaBoardAutoIncrementAmount"),
        "dimensionsMax": new Upgrade("dimensionsMax"),
        "speedFactorBonus": new Upgrade("speedFactorBonus"),
        "ultraBoardUnlocked": new Upgrade("ultraBoardUnlocked"),
        "ultraBoardCounter": new Upgrade("ultraBoardCounter"),
        "ultraBoardDimensions": new Upgrade("ultraBoardDimensions"),
        "ultraBoardHarvestSpeed": new Upgrade("ultraBoardHarvestSpeed"),
        "ultraBoardHarvestValue": new Upgrade("ultraBoardHarvestValue"),
        "ultraBoardIncrementAmount": new Upgrade("ultraBoardIncrementAmount"),
        "ultraBoardMegaSquaresBonusMultiplier": new Upgrade("ultraBoardMegaSquaresBonusMultiplier"),
        "ultraBoardAutoIncrement": new Upgrade("ultraBoardAutoIncrement"),
    };

    autobuyers = {
        "megasquaresAutoClaimer": new Autobuyer("megasquaresAutoClaimer"),
        "dimensionsAutoPurchaser": new Autobuyer("dimensionsAutoPurchaser"),
        "squaresAutoClaimer": new Autobuyer("squaresAutoClaimer"),
        "upgradeAutoPurchaser": new Autobuyer("upgradeAutoPurchaser"),
        "gigaBoardAutoIncrement": new Autobuyer("gigaBoardAutoIncrement"),
        "megaUpgradeAutoPurchaser": new Autobuyer("megaUpgradeAutoPurchaser"),
        "ultraBoardHarvestSpeed": new Autobuyer("ultraBoardHarvestSpeed"),
        "ultraBoardAutoIncrement": new Autobuyer("ultraBoardAutoIncrement"),
    };

    miners = [];

    glowCounters = Array.from({length: 2 ** 4 ** 2}, () => ({counter: 0, lastColor: "", lastFill: "", minerOccupied: false}));
    glowCountersMega = Array.from({length: 2 ** 2 ** 2}, () => ({counter: 0, lastColor: "", lastFill: ""}));    
    glowCountersUltra = Array.from({length: 2 ** 2 ** 2}, () => ({counter: 0, lastColor: "", lastFill: ""}));

    lastUpdatedTime = Date.now();
    
    document.getElementById("squaresAutoClaimerInput").value = 0;
    
    updateButtons();
    updateUpgradeTexts();
    updateScores();
}

function save() {
    if(Date.now() - 10 * 1000 < lastSave) {
        return;
    }
    lastSave = Date.now();

    localStorage["saveExists"] = true;
    localStorage["squaresTotal"] = squaresTotal;
    localStorage["megaSquaresTotal"] = megaSquaresTotal;
    localStorage["megaSquaresUnlocked"] = megaSquaresUnlocked;
    localStorage["lastClaimAmount"] = lastClaimAmount;
    localStorage["startingSquares"] = startingSquares;
    localStorage["maxMegaSquares"] = maxMegaSquares;
    localStorage["gigaSquaresTotal"] = gigaSquaresTotal;
    localStorage["gigaSquaresUnlocked"] = gigaSquaresUnlocked;
    localStorage["maxGigaSquares"] = maxGigaSquares;
    localStorage["darkModeEnabled"] = darkModeEnabled;
    localStorage["ultraSquaresTotal"] = ultraSquaresTotal;
    localStorage["maxUltraSquares"] = maxUltraSquares;
    localStorage["lastUpdatedTime"] = lastUpdatedTime;

    Object.values(upgrades).forEach(upgrade => {
        localStorage[upgrade.type] = upgrade.level;
    });
    
    Object.values(autobuyers).forEach(autobuyer => {
        localStorage[autobuyer.type + "-buyerCounter"] = autobuyer.buyerCounter;
        localStorage[autobuyer.type + "Enabled"] = autobuyer.enabled;
    });
}

function load() {
    squaresTotal = "squaresTotal" in localStorage ? BigInt(localStorage["squaresTotal"]) : 0n;
    megaSquaresTotal = "megaSquaresTotal" in localStorage ? BigInt(localStorage["megaSquaresTotal"]) : 0n;
    lastClaimAmount = "lastClaimAmount" in localStorage ? BigInt(localStorage["lastClaimAmount"]) : 0n;
    startingSquares = "startingSquares" in localStorage ? BigInt(localStorage["startingSquares"]) : 0n;
    maxMegaSquares = "maxMegaSquares" in localStorage ? BigInt(localStorage["maxMegaSquares"]) : 0n;
    gigaSquaresTotal = "gigaSquaresTotal" in localStorage ? BigInt(localStorage["gigaSquaresTotal"]) : 0n;
    maxGigaSquares = "maxGigaSquares" in localStorage ? BigInt(localStorage["maxGigaSquares"]) : 0n;
    gigaSquaresUnclaimed = "gigaSquaresUnclaimed" in localStorage ? BigInt(localStorage["gigaSquaresUnclaimed"]) : 0n;
    ultraSquaresTotal = "ultraSquaresTotal" in localStorage ? BigInt(localStorage["ultraSquaresTotal"]) : 0n;
    maxUltraSquares = "maxUltraSquares" in localStorage ? BigInt(localStorage["maxUltraSquares"]) : 0n;
    lastUpdatedTime = "lastUpdatedTime" in localStorage ? Number(localStorage["lastUpdatedTime"]) : Date.now();
    
    megaSquaresUnlocked = "megaSquaresUnlocked" in localStorage ? "true" == localStorage["megaSquaresUnlocked"] : false;
    gigaSquaresUnlocked = "gigaSquaresUnlocked" in localStorage ? "true" == localStorage["gigaSquaresUnlocked"] : false;
    darkModeEnabled = "darkModeEnabled" in localStorage ? "true" == localStorage["darkModeEnabled"] : false;

    Object.values(upgrades).forEach(upgrade => {
        upgrade.level = upgrade.type in localStorage ? BigInt(localStorage[upgrade.type]) : 1n;
        if(upgrade.level > upgrade.maxLevel) {
            upgrade.level = upgrade.maxLevel;
        }
    });
    
    Object.values(autobuyers).forEach(autobuyer => {
        autobuyer.buyerCounter = (autobuyer.type + "-buyerCounter") in localStorage ? Number(localStorage[autobuyer.type + "-buyerCounter"]) : 0;
        autobuyer.enabled = (autobuyer.type + "Enabled") in localStorage ? "true" == localStorage[autobuyer.type + "Enabled"] : true;
    });

    glowCounters = Array.from({length: Number(upgrades["dimensions"].getValue(upgrades["dimensions"].maxLevel + upgrades["dimensionsMax"].getValue())) ** 2}, () => ({counter: 0, lastColor: "", lastFill: "", minerOccupied: false}));
    glowCountersUltra = Array.from({length: Number(upgrades["ultraBoardDimensions"].getValue()) ** 2}, () => ({counter: 0, lastColor: "", lastFill: ""}));

    for(let i = 1; i < upgrades["minerCount"].level; ++i) {
        addMiner();
    }
    
    Object.values(upgrades).forEach(upgrade => upgrade.getValueDependencies().forEach(type => upgrades[type].invalidateValue()));

    updateButtons();
    updateUpgradeTexts();
    updateScores();
}

class Upgrade {
    constructor(type) {
        this.type = type;
        this.level = 1n;
        this.buttonElement = type + "-button";
        this.upgradeElement = type + "-upgrade";
        this.priceElement = type + "-price";

        this.currencyType = -1;
        switch(type) {
            case "ultraBoardDimensions":
            case "ultraBoardHarvestValue":
            case "ultraBoardHarvestSpeed":
            case "ultraBoardIncrementAmount":
            case "ultraBoardMegaSquaresBonusMultiplier":
            case "ultraBoardAutoIncrement":
                this.currencyType = CURRENCY_ULTRA;
                break;
            case "megaStartingLevel":
            case "megaUpgradeAutoPurchaser":
            case "megaSquaresMultiplier":
            case "speedFactorBonus":
            case "ultraBoardUnlocked":
            case "ultraBoardCounter":
                this.currencyType = CURRENCY_GIGA;
                break;
            case "speedFactor":
            case "minerSpeedFactor":
            case "upgradeAutoPurchaser":
            case "dimensionsAutoPurchaser":
            case "squaresAutoClaimer":
            case "megasquaresAutoClaimer":
            case "startingSquares":
            case "timerSpeedBonus":
            case "gigaBoardUnlocked":
            case "gigaBoardCounter":
            case "gigaBoardAutoIncrement":
            case "gigaBoardAutoIncrementAmount":
            case "dimensionsMax":
                this.currencyType = CURRENCY_MEGA;
                break;
            case "speed":
            case "value":
            case "minerCount":
            case "minerSpeed":
            case "dimensions":
                this.currencyType = CURRENCY_NORMAL;
                break;
        }

        if(this.currencyType == -1) {
            throw "Currency type not assigned.";
        }

        this.maxLevel = 2000n;
        switch(type) {
            case "dimensions":
                this.maxLevel = 5n;
                break;
            case "minerSpeed":
                this.maxLevel = 60n;
                break;
            case "upgradeAutoPurchaser":
                this.maxLevel = 15n;
                break;
            case "dimensionsAutoPurchaser":
                this.maxLevel = 18n;
                break;
            case "squaresAutoClaimer":
                this.maxLevel = 22n;
                break;
            case "megasquaresAutoClaimer":
                this.maxLevel = 26n;
                break;
            case "gigaBoardAutoIncrement":
                this.maxLevel = 17n;
                break;
            case "speedFactor":
                this.maxLevel = 50n;
                break;
            case "minerSpeedFactor":
                this.maxLevel = 30n;
                break;
            case "timerSpeedBonus":
                this.maxLevel = 20n;
                break;
            case "startingSquares":
                this.maxLevel = 15n;
                break;
            case "ultraBoardUnlocked":
            case "gigaBoardUnlocked":
                this.maxLevel = 2n;
                break;
            case "gigaBoardCounter":
                this.maxLevel = 10n ** 1000n;
                break;
            case "dimensionsMax":
                this.maxLevel = 2n;
                break;
            case "ultraBoardDimensions":
                this.maxLevel = 11n;
                break;
            default:
                break;
        }
        
        this.valueInvalidatedCounter = 0;
        
        if(!(["gigaBoardCounter", "ultraBoardCounter"].includes(this.type))) {
            this.valueCache = Array.from({length: Number(this.maxLevel) * 2}, () => ({counter: -1, cachedValue: 0n}));
            this.priceCache = Array.from({length: Number(this.maxLevel) * 2}, () => Array(Number(this.maxLevel)).fill(-1n));
        }
    }

    getMaxLevel() {
        let level = this.level;
        let squaresAvailable = getCurrencyHeld(this.currencyType);

        if(squaresAvailable < this.getPrice(level, 1n)) {
            return level;
        }

        if(["gigaBoardCounter", "ultraBoardCounter"].includes(this.type)) {
            return level + 1n;
        }

        for(let levelPrice = this.getPrice(level, 1n); squaresAvailable >= levelPrice && level < this.maxLevel; squaresAvailable -= levelPrice, ++level, levelPrice = this.getPrice(level, 1n)) {
        }

        return level;
    }

    getPrice(level, amount) {
        if(amount == 0n) {
            return 0n;
        }

        amount = this.maxLevel < level + amount ? (level + amount) - this.maxLevel : amount;

        if((["gigaBoardCounter", "ultraBoardCounter"].includes(this.type)) || (this.priceCache[level-1n][amount-1n] == -1n)) {
            let totalPrice = 0n;
            for(let i = 0n; i < amount; ++i) {
                switch(this.type) {
                    case "speed":
                        totalPrice += 3n ** ((level + i) - 1n) * 100n;
                        break;
                    case "value":
                        totalPrice += 5n ** ((level + i) - 1n) * 200n;
                        break;
                    case "minerCount":
                        totalPrice += 10n ** 9n * 3n ** ((level + i) - 1n);
                        break;
                    case "minerSpeed":
                        totalPrice += (this.level + i) < this.maxLevel ? 10n ** 11n * 3n ** (level + i) : 0n; 
                        break;
                    case "speedFactor":
                        totalPrice += (this.level == 1n ? 1n : ((this.level + i) < this.maxLevel ? BigInt(Math.floor(1.35 ** (Number(level + i)))) + 1n : 0n));
                        break;
                    case "minerSpeedFactor":
                        totalPrice += (this.level + i) < this.maxLevel ? BigInt(Math.floor(1.3 ** (Number(level + i)))) / 4n + 1n : 0n;
                        break;
                    case "upgradeAutoPurchaser":
                        totalPrice += (this.level + i) < this.maxLevel ? BigInt(Math.floor(2 * 1.3 ** (Number(level + i)))) / 4n + 1n : 0n;
                        break;
                    case "dimensionsAutoPurchaser":
                        totalPrice += (this.level + i) < this.maxLevel ? BigInt(Math.floor(4 * 1.4 ** (Number(level + i)))) / 4n + 1n : 0n;
                        break;
                    case "squaresAutoClaimer":
                        totalPrice += (this.level + i) < this.maxLevel ? BigInt(Math.floor(3 * 1.4 ** (Number(level + i)))) / 4n + 1n : 0n;
                        break;
                    case "megasquaresAutoClaimer":
                        totalPrice += (this.level + i) < this.maxLevel ? BigInt(Math.floor(10 * 1.36 ** (Number(level + i)))) / 4n + 1n : 0n;
                        break;
                    case "startingSquares":
                        totalPrice += (this.level + i) < this.maxLevel ? 2n ** (level + i - 1n) * BigInt(Math.floor(3 * 1.1 ** Math.sqrt(4 * Number(level + i)))) / 2n + 1n : 0n;
                        break;
                    case "timerSpeedBonus":
                        totalPrice += (this.level + i) < this.maxLevel ? BigInt(Math.floor(70 * 1.4 ** (Number(level + i)))) / 2n + 1n : 0n;
                        break;
                    case "gigaBoardUnlocked":
                        totalPrice += (level + i) == 1n ? 500n : 0n;
                        break;
                    case "gigaBoardCounter":
                        totalPrice = upgrades["gigaBoardAutoIncrementAmount"].getValue();
                        break;
                    case "gigaBoardAutoIncrement":
                        totalPrice += (this.level + i) < this.maxLevel ? BigInt(Math.floor(1000 * 1.3 ** (Number(level + i)))) / 2n + 1n : 0n;
                        break;
                    case "megaSquaresMultiplier":
                        totalPrice += 6n ** (level - 1n + i);
                        break;
                    case "megaStartingLevel":
                        totalPrice += 4n ** (level - 1n + i) + 1n;
                        break;
                    case "megaUpgradeAutoPurchaser":
                        totalPrice += 3n ** (level + i) + 1n;
                        break;
                    case "gigaBoardAutoIncrementAmount":
                        totalPrice += 5000n * 5n ** (level + i - 1n);
                        break;
                    case "dimensionsMax":
                        totalPrice += 2n ** (level + i - 1n) * 1000n;
                        break;
                    case "speedFactorBonus":
                        totalPrice += 5n ** (level - 1n + i);
                        break;
                    case "ultraBoardUnlocked":
                        totalPrice += (level + i) == 1n ? 1000n : 0n;
                        break;
                    case "ultraBoardCounter":
                        //totalPrice += upgrades["ultraBoardHarvestValue"].getValue();
                        totalPrice += upgrades["ultraBoardIncrementAmount"].getValue();
                        break;
                    case "ultraBoardDimensions":
                        totalPrice += 3n * level ** 3n * 2n ** (level - 1n) / 3n + 11n;
                        break;
                    case "ultraBoardHarvestSpeed":
                        totalPrice += ((8n ** level / 5n ** level) + 8n) / 3n + 1n;
                        break;
                    case "ultraBoardHarvestValue":
                    case "ultraBoardIncrementAmount":
                        totalPrice += (7n ** level / 4n ** level) + 19n;
                        break;
                    case "ultraBoardMegaSquaresBonusMultiplier":
                        totalPrice += (6n ** level / 4n ** level) + 49n;
                        break;
                    case "ultraBoardAutoIncrement":
                        totalPrice += (8n ** level / 5n ** level) + 11n;
                        break;
                }
            }

            if(["gigaBoardCounter", "ultraBoardCounter"].includes(this.type)) {
                return totalPrice;
            }

            this.priceCache[level-1n][amount-1n] = totalPrice;
        }
        return this.priceCache[level-1n][amount-1n];
    }

    getValue(level) {
        if(level == undefined)
        {
            level = this.level;
        }

        if(this.type == "dimensions") {
            level = level > this.maxLevel + upgrades["dimensionsMax"].getValue() ? this.maxLevel + upgrades["dimensionsMax"].getValue() : level;
        }
        else {
            level = level > this.maxLevel ? this.maxLevel : level;
        }

        if(["gigaBoardCounter", "ultraBoardCounter"].includes(this.type)) {
            return level - 1n;
        }

        let calculatedValue = 0n;

        if(this.valueCache[level].counter != this.valueInvalidatedCounter) {
            switch(this.type) {
                // length of one side of megasquare
                case "dimensions":
                    calculatedValue = level < this.maxLevel + upgrades["dimensionsMax"].getValue() ? 2n ** (level - 1n) : 2n ** (this.maxLevel + upgrades["dimensionsMax"].getValue() - 1n);
                    break;
                // counter ticks per second
                case "speed":
                    calculatedValue = upgrades["speedFactor"].getValue() ** (level * 2n);
                    break;
                // multiplier of counter value
                case "value":
                    calculatedValue = level ** 2;
                    break;
                // number of miners
                case "minerCount":
                    calculatedValue = level - 1n;
                    break;
                // returns time in ms
                case "minerSpeed":
                    calculatedValue = BigInt(Math.max(10, Math.floor(Number(level < this.maxLevel ? 120000n / upgrades["minerSpeedFactor"].getValue() - ((level - 1n) * 1000n / upgrades["minerSpeedFactor"].getValue()) : (60000n / upgrades["minerSpeedFactor"].getValue())) * upgrades["timerSpeedBonus"].getValue())));
                    break;
                // next 2 give factor that we multiple speed and minerSpeed scaling factor by
                case "speedFactor":
                    calculatedValue = upgrades["speedFactorBonus"].getValue() * (level + 1n);
                    break;
                case "minerSpeedFactor":
                    calculatedValue = BigInt(Math.floor(1.2 ** Number(level - 10n) * Number(level) ** 1.4 * 4 + 1));
                    break;
                // next 4 calculatedValue = time in ms
                case "upgradeAutoPurchaser":
                    calculatedValue = BigInt(Math.max(1, Math.floor(Number(level == 1n ? -1n : 2000n * 600n ** (level - 2n) / 1000n ** (level - 2n)) * upgrades["timerSpeedBonus"].getValue())));
                    break;
                case "dimensionsAutoPurchaser":
                    calculatedValue = BigInt(Math.max(1, Math.floor(Number(level == 1n ? -1n : 100000n * 500n ** (level - 2n) / 1000n ** (level - 2n)) * upgrades["timerSpeedBonus"].getValue())));
                    break;
                case "squaresAutoClaimer":
                    calculatedValue = BigInt(Math.max(1, Math.floor(Number(level == 1n ? -1n : 60000n * 600n ** (level - 2n) / 1000n ** (level - 2n)) * upgrades["timerSpeedBonus"].getValue())));
                    break;
                case "megasquaresAutoClaimer":
                    calculatedValue = BigInt(Math.max(1, Math.floor(Number(level == 1n ? -1n : 400000n * 600n ** (level - 2n) / 1000n ** (level - 2n)) * upgrades["timerSpeedBonus"].getValue())));
                    break;
                // number of squares you start each new megasquare with
                case "startingSquares":
                    calculatedValue = 2n ** (level - 1n) * 100n * (level - 1n);
                    break;
                // Returns a fraction that represents the speed bonus to all timers. Scales with total number of megasquares. 
                case "timerSpeedBonus":
                    calculatedValue = 0.3 + 0.7 * (0.99 ** Math.log(Number(level))) ** Math.sqrt(4 * Number(megaSquaresTotal));
                    break;
                // true if we should display the gigaboard or ultraboard
                case "ultraBoardUnlocked":
                case "gigaBoardUnlocked":
                    calculatedValue = level > 1n;
                    break;
                // the current value of the gigaboard
                case "gigaBoardCounter":
                    calculatedValue = level - 1n;
                    break;
                // time in ms
                case "gigaBoardAutoIncrement":
                    calculatedValue = BigInt(Math.max(1, level == 1n ? -1 : Math.floor(20 * (0.6 ** Number(level - 1n)) * 1000 * upgrades["timerSpeedBonus"].getValue())));
                    break;
                // the number of times we boost each mega square collection
                case "megaSquaresMultiplier":
                    calculatedValue = (1n + (upgrades["ultraBoardMegaSquaresBonusMultiplier"].getValue() * upgrades["ultraBoardCounter"].getValue())) * (20n ** (upgrades["dimensionsMax"].level - 1n)) * (4n ** (level - 1n));
                    break;
                case "megaStartingLevel":
                    calculatedValue = level;
                    break;
                case "megaUpgradeAutoPurchaser":
                    calculatedValue = BigInt(Math.floor(level == 1n ? -1 : 10 * 60 * 1000 * 0.5 ** Number(level - 2n) * upgrades["timerSpeedBonus"].getValue()));
                    break;
                case "gigaBoardAutoIncrementAmount":
                    calculatedValue = 2n ** level - 1n;
                    break;
                case "dimensionsMax":
                    calculatedValue = level - 1n;
                    break;
                case "speedFactorBonus":
                    calculatedValue = 3n ** (level - 1n);
                    break;
                case "ultraBoardDimensions":
                    calculatedValue = level;
                    break;
                case "ultraBoardHarvestSpeed":
                    calculatedValue = BigInt(Math.max(1, Math.floor(30000 * upgrades["timerSpeedBonus"].getValue() * ((3 ** Number(upgrades["ultraBoardHarvestValue"].level - 1n)) / (1.4 ** Number(level - 1n))))));
                    break;
                case "ultraBoardHarvestValue":
                    calculatedValue = 2n ** (level - 1n);
                    break;
                case "ultraBoardIncrementAmount":
                    let amountMissing = upgrades["ultraBoardDimensions"].getValue() ** 2n - upgrades["ultraBoardCounter"].getValue();
                    let incrementAmount = BigInt(Math.floor(Number(level) ** 1.2));
                    calculatedValue = amountMissing < incrementAmount ? amountMissing : incrementAmount;
                    calculatedValue = 0n > calculatedValue ? 0n : calculatedValue;
                    break;
                case "ultraBoardMegaSquaresBonusMultiplier":
                    calculatedValue = level;
                    break;
                case "ultraBoardAutoIncrement":
                    calculatedValue = BigInt(Math.max(1, Math.floor(60000 * upgrades["timerSpeedBonus"].getValue() * (0.8 ** Number(level - 1n)))));
                    break;
            }

            this.valueCache[level] = {counter: this.valueInvalidatedCounter, cachedValue: calculatedValue};
        }

        return this.valueCache[level].cachedValue;
    }

    getValueDependencies() {
        // Returns a list of all the upgrade types that take a dependency on this upgrade type. Used for invalidating the value cache.
        switch(this.type) {
            case "speedFactor":
                return ["speed"];
            case "minerSpeedFactor":
                return ["minerSpeed"];
            case "timerSpeedBonus":
                return ["minerSpeed", "upgradeAutoPurchaser", "dimensionsAutoPurchaser", "squaresAutoClaimer", "megasquaresAutoClaimer", "gigaBoardAutoIncrement", "megaUpgradeAutoPurchaser", "ultraBoardHarvestSpeed", "ultraBoardAutoIncrement"];
            case "dimensionsMax":
                return ["dimensions", "megaSquaresMultiplier"];
            case "speedFactorBonus":
                return ["speedFactor"];
            case "ultraBoardHarvestValue":
                return ["ultraBoardHarvestSpeed"];
            case "ultraBoardDimensions":
                return ["ultraBoardIncrementAmount"];
            case "ultraBoardCounter":
                return ["ultraBoardIncrementAmount"];
            case "ultraBoardMegaSquaresBonusMultiplier":
                return ["megaSquaresMultiplier"];
            default:
                return [];
        }
    }

    invalidateValue() {
        ++this.valueInvalidatedCounter;
        this.getValueDependencies().forEach(type => upgrades[type].invalidateValue());
    }

    canDoUpgrade() {
        let amountToPurchase = 0n;
        if(purchaseMax) {
            amountToPurchase = this.getMaxLevel() - this.level;
            amountToPurchase = amountToPurchase < 0n ? 0n : amountToPurchase;
        }
        else {
            amountToPurchase = purchaseMultiplier;
        }

        if(amountToPurchase == 0n && this.type != "dimensions") {
            return false;
        }

        switch(this.type) {
            case "dimensions":
                return this.level < this.maxLevel + upgrades["dimensionsMax"].getValue() && boardScore == (getMaxBoardScore());
            case "minerSpeed":
                return squaresTotal >= this.getPrice(this.level, amountToPurchase) && this.level < this.maxLevel;
            case "upgradeAutoPurchaser":
            case "dimensionsAutoPurchaser":
            case "squaresAutoClaimer":
            case "megasquaresAutoClaimer":
            case "speedFactor":
            case "minerSpeedFactor":
            case "startingSquares":
            case "timerSpeedBonus":
            case "gigaBoardAutoIncrementAmount":
            case "gigaBoardCounter":
            case "dimensionsMax":
                return megaSquaresTotal >= this.getPrice(this.level, amountToPurchase) && this.level < this.maxLevel;
            case "gigaBoardAutoIncrement":
                return megaSquaresTotal >= this.getPrice(this.level, amountToPurchase) && this.level < this.maxLevel && !this.isHidden();
            case "gigaBoardUnlocked":
                return megaSquaresTotal >= this.getPrice(this.level, amountToPurchase) && this.level == 1n;
            case "megaStartingLevel":
            case "megaUpgradeAutoPurchaser":
            case "megaSquaresMultiplier":
            case "speedFactorBonus":
                return gigaSquaresTotal >= this.getPrice(this.level, amountToPurchase);
            case "ultraBoardCounter":
                return gigaSquaresTotal >= this.getPrice(this.level, amountToPurchase) && (this.level - 1n) < getMaxUltraBoardScore();
            case "ultraBoardUnlocked":
                return gigaSquaresTotal >= this.getPrice(this.level, amountToPurchase) && this.level == 1n;
            case "ultraBoardDimensions":
            case "ultraBoardHarvestSpeed":
            case "ultraBoardHarvestValue":
            case "ultraBoardIncrementAmount":
            case "ultraBoardMegaSquaresBonusMultiplier":
            case "ultraBoardAutoIncrement":
                return ultraSquaresTotal >= this.getPrice(this.level, amountToPurchase);
            default:
                return squaresTotal >= this.getPrice(this.level, amountToPurchase);
        }
    }

    upgradeText() {
        let amountToPurchase = 0n;
        if(purchaseMax) {
            amountToPurchase = this.getMaxLevel() - this.level;
            amountToPurchase = amountToPurchase < 1n ? 1n : amountToPurchase;
        }
        else {
            amountToPurchase = purchaseMultiplier;
        }

        switch(this.type) {
            case "dimensions":
                return bigIntToExp(this.getValue()) + " -> " + (this.level < (this.maxLevel + upgrades["dimensionsMax"].getValue()) ? bigIntToExp(this.getValue(this.level + 1n)) : "MAX");
            case "speed":
                return bigIntToExp(this.getValue()) + "/s -> " + bigIntToExp(this.getValue(this.level + amountToPurchase)) + "/s";
            case "value":
                return "x" + bigIntToExp(this.getValue()) + " -> x" + bigIntToExp(this.getValue(this.level + amountToPurchase));
            case "minerCount":
                return bigIntToExp(this.getValue()) + " -> " + bigIntToExp(this.getValue(this.level + amountToPurchase));
            case "minerSpeed":
            case "ultraBoardHarvestSpeed":
                return (Number(this.getValue()) / 1000) + "s -> " + (this.level < this.maxLevel ? (Number(this.getValue(this.level + amountToPurchase)) / 1000) + "s" : "MAX");
            case "speedFactor":
            case "megaSquaresMultiplier":
            case "speedFactorBonus":
            case "ultraBoardHarvestValue":
            case "ultraBoardMegaSquaresBonusMultiplier":
                return "x" + bigIntToExp(this.getValue()) + " -> " + (this.level < this.maxLevel ? ("x" + bigIntToExp(this.getValue(this.level + amountToPurchase))) : "MAX");
            case "minerSpeedFactor":
                return "/" + bigIntToExp(this.getValue()) + " -> " + (this.level < this.maxLevel ? ("/" + bigIntToExp(this.getValue(this.level + amountToPurchase))) : "MAX");
            case "startingSquares":
            case "ultraBoardDimensions":
                return bigIntToExp(this.getValue()) + " -> " + (this.level < this.maxLevel ? bigIntToExp(this.getValue(this.level + amountToPurchase)) : "MAX");
            case "megaStartingLevel":
            case "gigaBoardAutoIncrementAmount":
                return bigIntToExp(this.getValue()) + " -> " + bigIntToExp(this.getValue(this.level + amountToPurchase));
            case "upgradeAutoPurchaser":
            case "squaresAutoClaimer":
            case "dimensionsAutoPurchaser":
            case "megasquaresAutoClaimer":
            case "gigaBoardAutoIncrement":
            case "megaUpgradeAutoPurchaser":
            case "ultraBoardAutoIncrement":
                return ((this.level == 1n) ? ("???") : ((Number(this.getValue()) / 1000) + "s ")) + " -> " + (this.level < this.maxLevel ? (Number(this.getValue(this.level + amountToPurchase)) / 1000) + "s" : "MAX");
            case "timerSpeedBonus":
                return "x" + this.getValue().toFixed(3) + " -> " + (this.level < this.maxLevel ? "x" + this.getValue(this.level + amountToPurchase).toFixed(3) : "MAX") + " (scales w/ megasquares)";
            case "gigaBoardUnlocked":
            case "gigaBoardCounter":
            case "ultraBoardUnlocked":
            case "ultraBoardCounter":
                return "";
            case "dimensionsMax":
                return "x20 megasquare value";
            case "ultraBoardIncrementAmount":
                return BigInt(Math.floor(Number(this.level) ** 1.2)) + " -> " + BigInt(Math.floor(Number(this.level + 1n) ** 1.2));
        }
    }

    isHidden() {
        switch(this.type) {
            case "dimensions":
                return false;
            case "speed":
            case "value":
                return !megaSquaresUnlocked && upgrades["dimensions"].level < 2;
            case "minerCount":
            case "minerSpeed":
                return !megaSquaresUnlocked && upgrades["dimensions"].level < 4;
            case "speedFactor":
            case "minerSpeedFactor":
            case "gigaBoardUnlocked":
                return !megaSquaresUnlocked;
            case "upgradeAutoPurchaser":
            case "dimensionsAutoPurchaser":
            case "squaresAutoClaimer":
            case "megasquaresAutoClaimer":
            case "startingSquares":
            case "timerSpeedBonus":
            case "dimensionsMax":
                return !((megaSquaresUnlocked && maxMegaSquares >= this.getPrice(1n, 1n)) || this.level > 1n);
            case "gigaBoardCounter":
            case "gigaBoardAutoIncrement":
                return !(upgrades["gigaBoardUnlocked"].getValue());
            case "gigaBoardAutoIncrementAmount":
                return !(((upgrades["gigaBoardUnlocked"].getValue()) && maxMegaSquares >= this.getPrice(1n, 1n)) || this.level > 1n);
            case "megaStartingLevel":
            case "megaUpgradeAutoPurchaser":
            case "megaSquaresMultiplier":
            case "speedFactorBonus":
            case "ultraBoardUnlocked":
                return !((maxGigaSquares >= this.getPrice(1n, 1n)) || this.level > 1n);
            case "ultraBoardCounter":
                return !(upgrades["ultraBoardUnlocked"].getValue());
            case "ultraBoardDimensions":
            case "ultraBoardHarvestSpeed":
            case "ultraBoardIncrementAmount":
            case "ultraBoardMegaSquaresBonusMultiplier":
            case "ultraBoardAutoIncrement":
                return !((maxUltraSquares >= this.getPrice(1n, 1n)) || this.level > 1n);
            case "ultraBoardHarvestValue":
                return true;
        }
    }
};

let spacesFullCurrentIteration = 0;
let minerLastCheckedPosition = 0;
class Miner {
    constructor() {
        this.position = 0;
        this.reset();
    }

    reset() {
        if(this.position != STATUS_STANDBY) {
            glowCounters[this.position].minerOccupied = false;
            glowCounters[this.position].lastFill = "";
        }

        this.position = minerLastCheckedPosition;
        this.restTimer = 0;
        this.assign();
    }

    assign() {
        if(boardScore >= getMaxBoardScore() || spacesFullCurrentIteration == currentTime) {
            this.position = STATUS_STANDBY;
            return;
        }

        let newPosition = this.position;
        let dimensionsSquared = upgrades["dimensions"].getValue() * upgrades["dimensions"].getValue();

        //while(glowCounters[newPosition].counter > fadeMs/2 || glowCounters[newPosition].minerOccupied) {
        //while(((boardScore/100n) >> BigInt(newPosition)) & 1n || miners.find(miner => miner.position == newPosition)) {
        while(startingBoardBitFlippedCurrentIteration(newPosition) || glowCounters[newPosition].minerOccupied) {
            ++newPosition;

            if(newPosition + 1 > dimensionsSquared) {
                newPosition = 0;
            }

            if(newPosition == this.position) {
                this.position = STATUS_STANDBY;
                spacesFullCurrentIteration = currentTime;
                minerLastCheckedPosition = 0;
                return;
            }
        }

        if(this.position == minerLastCheckedPosition) {
            minerLastCheckedPosition = newPosition;
        }

        this.position = newPosition;
        glowCounters[this.position].minerOccupied = true;
        
        this.progress = 0;
    }

    increment() {
        if(this.position == STATUS_STANDBY) {
            if(this.restTimer < 100) {
                this.restTimer += 1;
                return;
            }

            this.reset();
            return;
        }
        
        if(startingBoardBitFlippedCurrentIteration(this.position)) {
        //if(((boardScore/100n) >> BigInt(this.position)) & 1n) {
        //if(glowCounters[this.position].counter > 0) {
            glowCounters[this.position].minerOccupied = false;
            glowCounters[this.position].lastFill = "";
            this.assign();
            return;
        }

        this.progress += 1 / (Math.max(1, Number(upgrades["minerSpeed"].getValue())) / 10);

        if(this.progress >= 1) {
            boardScore += (1n << BigInt(this.position)) * 100n;
            this.reset();
            return;
        }
    }
};

class Autobuyer {
    constructor(type) {
        this.type = type;
        this.reset();
        this.buyerCounter = 0;
        this.enabled = false;
    }

    invalidateRunTime() {
        this.runTime = Number(upgrades[this.type].getValue());
    }

    reset() {
        this.runTime = Number(upgrades[this.type].getValue());
        this.buyerCounter = this.runTime / 10;
    }

    increment() {
        if(upgrades[this.type].level == 1n && this.type != "ultraBoardHarvestSpeed") {
            return;
        }

        if(this.type == "ultraBoardHarvestSpeed" && upgrades["ultraBoardCounter"].getValue() == 0n) {
            this.buyerCounter = this.runTime / 10;
        }

        if(this.buyerCounter <=0) {
            let oldPurchaseMultiplier = purchaseMultiplier;
            let oldPurchaseMax = purchaseMax;
            purchaseMultiplier = 1n;
            purchaseMax = false;
            let squaresAutoClaimFactorThisIteration = squaresAutoClaimFactor;
            switch(this.type) {
                case "upgradeAutoPurchaser":
                    if(this.enabled) {
                        let upgradeNames = ["speed", "value", "minerSpeed", "minerCount"];
                        let type = upgradeNames[Math.floor(Math.random() * upgradeNames.length)];
                        if(doUpgrade(type)) {
                            this.reset();
                            break;
                        }
                    }
                    break;
                case "dimensionsAutoPurchaser":
                    if(this.enabled && doUpgrade("dimensions")) {
                        this.reset();
                    }
                    break;
                case "squaresAutoClaimer":
                    if(this.enabled && (squaresUnclaimed/10n > lastClaimAmount * squaresAutoClaimFactorThisIteration)) {
                        lastClaimAmount = squaresUnclaimed / 100n;
                        claimSquares();
                        this.reset();
                    }
                    break;
                case "megasquaresAutoClaimer":
                    if(this.enabled && boardScore >= getMaxBoardScore() && upgrades["dimensions"].level >= upgrades["dimensions"].maxLevel + upgrades["dimensionsMax"].getValue()) {
                        claimMegaSquare();
                        this.reset();
                    }
                    break;
                case "gigaBoardAutoIncrement":
                    for(let j = 0; j < Math.floor(10 / Math.max(1, Number(upgrades[this.type].getValue())) + 1); ++j) {
                        if(this.enabled && doUpgrade("gigaBoardCounter")) {
                            this.reset();
                        }
                    }
                    break;
                // continue iterating until there's nothing left to buy
                case "megaUpgradeAutoPurchaser":
                    if(this.enabled) {
                        let continueIterating = true;
                        while(continueIterating) {
                            continueIterating = false;

                            let newUpgradeNames = ["speedFactor",
                            "minerSpeedFactor",
                            "upgradeAutoPurchaser",
                            "dimensionsAutoPurchaser",
                            "squaresAutoClaimer",
                            "megasquaresAutoClaimer",
                            "startingSquares",
                            "timerSpeedBonus",
                            "gigaBoardUnlocked",
                            "gigaBoardAutoIncrement",
                            "dimensionsMax",
                            "gigaBoardAutoIncrementAmount",
                            ];
                            let newShuffledUpgrades = newUpgradeNames.map(type => [type, Math.random()]).sort((a, b) => a[1] - b[1]).map(elem => elem[0]);

                            newShuffledUpgrades.forEach(upgradeName => {
                                if(doUpgrade(upgradeName)) {
                                    this.reset();
                                    continueIterating = true;
                                }
                            });
                        }
                    }
                    break;
                case "ultraBoardHarvestSpeed":
                    --upgrades["ultraBoardCounter"].level;
                    didUpgrade = true;
                    upgrades["ultraBoardCounter"].level = upgrades["ultraBoardCounter"].level < 1n ? 1n : upgrades["ultraBoardCounter"].level;
                    ultraSquaresTotal += upgrades["ultraBoardHarvestValue"].getValue();
                    maxUltraSquares = ultraSquaresTotal > maxUltraSquares ? ultraSquaresTotal : maxUltraSquares;
                    upgrades["megaSquaresMultiplier"].invalidateValue();
                    upgrades["ultraBoardIncrementAmount"].invalidateValue();
                    this.reset();
                    break;
                case "ultraBoardAutoIncrement":
                    if(this.enabled && doUpgrade("ultraBoardCounter")) {
                        this.reset();
                    }
                    break;
            }
            purchaseMultiplier = oldPurchaseMultiplier;
            purchaseMax = oldPurchaseMax;
        }
        this.buyerCounter = Math.max(0, this.buyerCounter - 1);
    }
}

function getMaxBoardScore() {
    let dimensions = upgrades["dimensions"].getValue();
    return (2n ** (dimensions * dimensions) - 1n) * 100n;
}

function getMaxGigaBoardScore() {
    return 2 ** 16 - 1;
}

function getMaxUltraBoardScore() {
    return upgrades["ultraBoardDimensions"].getValue() ** 2n;
}

function getUnclaimedGigasquares() {
    return upgrades["gigaBoardCounter"].getValue() / BigInt(getMaxGigaBoardScore());
}

// BEGIN MAIN

init();

if(localStorage["saveExists"] == "true") {
    load();
}

Object.values(autobuyers).forEach(autobuyer => autobuyer.invalidateRunTime());
Object.values(upgrades).forEach(upgrade => upgrade.invalidateValue());
updateButtons();
updateUpgradeTexts();

maxMegaSquares = megaSquaresTotal > maxMegaSquares ? megaSquaresTotal : maxMegaSquares;
maxGigaSquares = (gigaSquaresTotal + getUnclaimedGigasquares()) > maxGigaSquares ? (gigaSquaresTotal + getUnclaimedGigasquares()) : maxGigaSquares;
maxUltraSquares = ultraSquaresTotal > maxUltraSquares ? ultraSquaresTotal : maxUltraSquares;

Object.values(autobuyers).forEach(autobuyer => {
    if(["ultraBoardHarvestSpeed"].includes(autobuyer.type)) {
        return;
    }

    document.getElementById(autobuyer.type + "Enabled").hidden = autobuyer.level == 1n;
    document.getElementById(autobuyer.type + "Enabled").checked = autobuyer.enabled;
})

document.getElementById("darkModeEnabled").checked = darkModeEnabled;
toggleDarkModeEnabled();

let refreshTimerLength = 10;
let refreshTimer = 0;
setInterval(function() {
    currentTime = Date.now();
    if(currentTime - lastUpdatedTime > 12) {
        inSimulation = true;
        let msToSimulate = Math.min(1000, (currentTime - lastUpdatedTime));
        for(let i = msToSimulate; i >= 0; i -= 10) {
            oldPurchaseMultiplier = purchaseMultiplier;
            purchaseMultiplier = 1;
            increment();
            purchaseMultiplier = oldPurchaseMultiplier;
        }
        
        lastUpdatedTime += msToSimulate;
        inSimulation = false;

        if(msToSimulate < 1000) {
            updateScores();
            draw();
            updateButtons();
            updateUpgradeTexts();
        } else {
            document.getElementById("skip-simulating-button").hidden = false;
            document.getElementById("simulated-time-remaining").hidden = false;
            document.getElementById("simulated-time-remaining").innerHTML = "Idle time left to calculate: " + msToHHMMSS(currentTime - lastUpdatedTime);
        }
    }
    else {
        lastUpdatedTime = Date.now();
        increment();
        updateScores();
        draw();
    
        if(refreshTimer == 0 && didUpgrade) {
            refreshTimer = refreshTimerLength;
            didUpgrade = false;
            updateButtons();
            updateUpgradeTexts();
        }
        refreshTimer = refreshTimer == 0 ? 0 : refreshTimer - 1;

        document.getElementById("simulated-time-remaining").hidden = true;
        document.getElementById("skip-simulating-button").hidden = true;
    }
}, 10);

setInterval(() => {
    save();
}, 5 * 1000);

// END MAIN

function increment() {
    let maxBoardScore = getMaxBoardScore();

    let doRapidUpgrades = false;
    Object.values(autobuyers).forEach(autobuyer => {
        if(autobuyer.runTime < 10) {
            doRapidUpgrades = true;
        }
    });

    if(upgrades["speed"].getValue() / 10n < 40) {
        doRapidUpgrades = false;
    }

    // This is so that when we have a timer that's less than 10ms we're still buying upgrades and incrementing the board
    if(doRapidUpgrades) {
        for(let i = 0; i < 10; ++i) {
            Object.values(autobuyers).forEach(autobuyer => {
                if((autobuyer.runTime < 10 && i < Math.floor(10 / autobuyer.runTime)) || (autobuyer.runTime >= 10 && i == 0)) {
                    autobuyer.increment();
                }
            });

            boardScore += upgrades["speed"].getValue() / 10n;

            if(boardScore > maxBoardScore)
            {
                boardScore = maxBoardScore;
                didUpgrade = true;
            }
        }
    } else {
        Object.values(autobuyers).forEach(autobuyer => {
            autobuyer.increment();
        });

        boardScore += upgrades["speed"].getValue();

        if(boardScore > maxBoardScore)
        {
            boardScore = maxBoardScore;
            didUpgrade = true;
        }
    }

    squaresUnclaimed += upgrades["value"].getValue() * boardScore / 100n;
    
    minerLastCheckedPosition = 0;
    miners.forEach(miner => {
        miner.increment();
    });
}

let fadeMs = 30;
function draw() {
    let canvas = document.getElementById("canvas");
    let ctx = canvas.getContext("2d");

    if(redrawAll) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.width = window.innerWidth / 3;
        let boardCount = 1 + upgrades["gigaBoardUnlocked"].getValue() + upgrades["ultraBoardUnlocked"].getValue();
        canvas.height = boardCount * window.innerWidth / 3;
        document.getElementById("board").style.width = (window.innerWidth / 3) + "px";
        document.getElementById("board").style.height = (boardCount * window.innerWidth / 3) + "px";
    }

    // draw main game window
    let dxWindow = dyWindow = Math.min(canvas.width, canvas.height);

    let dxBoard = dyBoard = Math.min(dxWindow, dyWindow) * 0.8;
    
    let xBoard = dxWindow/2 - dxBoard/2;
    let yBoard = dyWindow/2 - dyBoard/2;

    if(redrawAll || redrawSquares) {
        ctx.fillStyle = "rgb(64, 64, 64)";
        ctx.fillRect(xBoard, yBoard, dxBoard, dyBoard);
    }

    let dimensions = parseInt(upgrades["dimensions"].getValue());
    let dxSquare = dySquare = dxBoard * 0.8 / dimensions;

    for(let i = 0; i < dimensions; ++i) {
        let ySquare = yBoard + i * dySquare + dySquare * 0.1 + dyBoard * 0.1;

        for(let j = 0; j < dimensions; ++j) {
            let xSquare = xBoard + j * dxSquare + dxSquare * 0.1 + dxBoard * 0.1;
            let squareIndex = BigInt(dimensions * dimensions - (i * dimensions + j) - 1);
            
            let glowCounter = glowCounters[squareIndex];
            let fillStyle = "";
            //if(((boardScore/100n) >> squareIndex) & 1n) {
            if(startingBoardBitFlippedCurrentIteration(squareIndex)) {
                let colorString;
                if(glowCounter.counter < fadeMs) {
                    let brightnessMod = Math.floor(1 / (1 + (10 ** 5) ** (Math.random() - 0.5)) * 200);
                    colorString = glowCounter.lastColor = `255, 255, ${brightnessMod}`;
                }
                else {
                    colorString = glowCounter.lastColor;
                }
                fillStyle = `rgb(${colorString})`;
                glowCounter.counter = fadeMs;
            }
            else if(glowCounter.counter > 0) {
                fillStyle = `rgba(${glowCounter.lastColor}, ${glowCounter.counter/fadeMs})`;
                --glowCounter.counter;
            }
            else {
                fillStyle = "rgba(84, 84, 84, 1)";
            }

            if(redrawAll || redrawSquares || (fillStyle != glowCounter.lastFill)) {
                ctx.fillStyle = "rgb(64, 64, 64)";
                ctx.fillRect(xSquare, ySquare, dxSquare * 1, dySquare * 1);

                if(glowCounter.counter > 0 && glowCounter.counter < fadeMs) {
                    ctx.fillStyle = "rgba(84, 84, 84, 1)";
                    ctx.fillRect(xSquare, ySquare, dxSquare * 0.8, dySquare * 0.8);
                }
                
                ctx.fillStyle = fillStyle;
                ctx.fillRect(xSquare, ySquare, dxSquare * 0.8, dySquare * 0.8);
                glowCounter.lastFill = fillStyle;
            }
        }
    }

    ctx.fillStyle = "rgb(110, 230, 55)";
    miners.forEach(miner => {
        if(miner.position == -1) {
            return;
        }

        let iPos = dimensions - miner.position % dimensions - 1;
        let jPos = dimensions - Math.floor(miner.position / dimensions) - 1;
        
        let xSquare = xBoard + iPos * dxSquare + dxSquare * 0.1 + dxBoard * 0.1;
        let ySquare = yBoard + jPos * dySquare + dySquare * 0.1 + dyBoard * 0.1 + (dySquare - dySquare * miner.progress) * 0.8;
        
        ctx.fillRect(xSquare, ySquare, dxSquare * 0.8, dySquare * 0.8 * miner.progress);

        let glowCounter = glowCounters[miner.position];

        // we need to redraw the faded square on top if it exists
        if(glowCounter.counter > 0 && glowCounter.counter < fadeMs) {
            ySquare = yBoard + jPos * dySquare + dySquare * 0.1 + dyBoard * 0.1;
            ctx.fillStyle = `rgba(${glowCounter.lastColor}, ${glowCounter.counter/fadeMs})`;
            ctx.fillRect(xSquare, ySquare, dxSquare * 0.8, dySquare * 0.8);
            ctx.fillStyle = "rgb(110, 230, 55)";
        }

        redrawSquares = false;
    });

    if(upgrades["gigaBoardUnlocked"].getValue()) {
        dxWindow = dyWindow = Math.min(canvas.width, canvas.height);

        dxBoard = dyBoard = Math.min(dxWindow, dyWindow) * 0.8;
        
        xBoard = dxWindow/2 - dxBoard/2;
        yBoard = dyWindow;

        if(redrawAll || redrawGiga) {
            ctx.fillStyle = "rgb(64, 64, 64)";
            ctx.fillRect(xBoard, yBoard, dxBoard, dyBoard);
        }

        dimensions = 4;
        dxSquare = dySquare = dxBoard * 0.8 / dimensions;

        for(let i = 0; i < dimensions; ++i) {
            let ySquare = yBoard + i * dySquare + dySquare * 0.1 + dyBoard * 0.1;

            for(let j = 0; j < dimensions; ++j) {
                let xSquare = xBoard + j * dxSquare + dxSquare * 0.1 + dxBoard * 0.1;
                let squareIndex = BigInt(dimensions * dimensions - (i * dimensions + j) - 1);

                let glowCounter = glowCountersMega[squareIndex];
                let fillStyle = "";
                if((upgrades["gigaBoardCounter"].getValue() >> squareIndex) & 1n) {
                    let colorString;
                    if(glowCounter.counter < fadeMs) {
                        let brightnessMod = 1 / (1 + (10 ** 5) ** (Math.random() - 0.5));
                        colorString = glowCounter.lastColor = `${200 + 33 * brightnessMod}, ${100 + 100 * brightnessMod}, 255`;
                    }
                    else {
                        colorString = glowCounter.lastColor;
                    }
                    fillStyle = `rgb(${colorString})`;
                    glowCounter.counter = fadeMs;
                }
                else if(glowCounter.counter > 0) {
                    fillStyle = `rgba(${glowCounter.lastColor}, ${glowCounter.counter/fadeMs})`;
                    --glowCounter.counter;
                }
                else {
                    fillStyle = "rgb(84, 84, 84)";
                }

                if(redrawAll || redrawGiga || (fillStyle != glowCounter.lastFill)) {
                    ctx.fillStyle = "rgb(64, 64, 64)";
                    ctx.fillRect(xSquare, ySquare, dxSquare * 0.9, dySquare * 0.9);
    
                    if(glowCounter.counter > 0 && glowCounter.counter < fadeMs) {
                        ctx.fillStyle = "rgba(84, 84, 84, 1)";
                        ctx.fillRect(xSquare, ySquare, dxSquare * 0.8, dySquare * 0.8);
                    }
                    
                    ctx.fillStyle = fillStyle;
                    ctx.fillRect(xSquare, ySquare, dxSquare * 0.8, dySquare * 0.8);
                    glowCounter.lastFill = fillStyle;
                }
            }
        }

        redrawGiga = false;
    }

    if(upgrades["ultraBoardUnlocked"].getValue()) {
        dxWindow = dyWindow = Math.min(canvas.width, canvas.height);

        dxBoard = dyBoard = Math.min(dxWindow, dyWindow) * 0.8;
        
        xBoard = dxWindow/2 - dxBoard/2;
        yBoard = dyWindow + (upgrades["gigaBoardUnlocked"].getValue() * dyWindow);

        if(redrawAll || redrawUltra || redrawGiga) {
            ctx.fillStyle = "rgb(64, 64, 64)";
            ctx.fillRect(xBoard, yBoard, dxBoard, dyBoard);
        }

        dimensions = Number(upgrades["ultraBoardDimensions"].getValue());
        dxSquare = dySquare = dxBoard * 0.8 / dimensions;

        for(let i = 0; i < dimensions; ++i) {
            let ySquare = yBoard + i * dySquare + dySquare * 0.1 + dyBoard * 0.1;

            for(let j = 0; j < dimensions; ++j) {
                let xSquare = xBoard + j * dxSquare + dxSquare * 0.1 + dxBoard * 0.1;
                let squareIndex = BigInt(dimensions * dimensions - (i * dimensions + j) - 1);

                let glowCounter = glowCountersUltra[squareIndex];
                let fillStyle = "";
                if(upgrades["ultraBoardCounter"].getValue() > squareIndex) {
                    let colorString;
                    if(glowCounter.counter < fadeMs) {
                        let brightnessMod = 1 / (1 + (10 ** 5) ** (Math.random() - 0.5));
                        colorString = glowCounter.lastColor = `255, ${90 + 60 * brightnessMod}, ${90 + 60 * brightnessMod}`;
                    }
                    else {
                        colorString = glowCounter.lastColor;
                    }
                    fillStyle = `rgb(${colorString})`;
                    glowCounter.counter = fadeMs;
                }
                else if(glowCounter.counter > 0) {
                    fillStyle = `rgba(${glowCounter.lastColor}, ${glowCounter.counter/fadeMs})`;
                    --glowCounter.counter;
                }
                else {
                    fillStyle = "rgb(84, 84, 84)";
                }


                if(upgrades["ultraBoardCounter"].getValue() - 1n == squareIndex) {
                    ctx.fillStyle = "rgb(64, 64, 64)";
                    ctx.fillRect(xSquare, ySquare, dxSquare * 0.9, dySquare * 0.9);

                    ctx.fillStyle = "rgba(84, 84, 84, 1)";
                    ctx.fillRect(xSquare, ySquare, dxSquare * 0.8, dySquare * 0.8);
                    
                    harvester = autobuyers["ultraBoardHarvestSpeed"];
                    ctx.fillStyle = `rgba(${glowCounter.lastColor}, 0.4)`;
                    ctx.fillRect(xSquare, ySquare, dxSquare * 0.8, dySquare * 0.8);
                    ctx.fillStyle = fillStyle;
                    ctx.fillRect(xSquare, ySquare + (dySquare - dySquare * harvester.buyerCounter * 10 / harvester.runTime) * 0.8, dxSquare * 0.8, dySquare * harvester.buyerCounter * 10 / harvester.runTime * 0.8);
                    glowCounter.lastFill = ctx.fillStyle;
                } else if(redrawAll || redrawUltra || (ctx.fillStyle != glowCounter.lastFill)) {
                    ctx.fillStyle = "rgb(64, 64, 64)";
                    ctx.fillRect(xSquare, ySquare, dxSquare * 0.9, dySquare * 0.9);
    
                    if(glowCounter.counter > 0 && glowCounter.counter < fadeMs) {
                        ctx.fillStyle = "rgba(84, 84, 84, 1)";
                        ctx.fillRect(xSquare, ySquare, dxSquare * 0.8, dySquare * 0.8);
                    }
                    
                    ctx.fillStyle = fillStyle;
                    ctx.fillRect(xSquare, ySquare, dxSquare * 0.8, dySquare * 0.8);
                    glowCounter.lastFill = fillStyle;
                }
            }
        }

        redrawUltra = false;
    }

    redrawAll = false;
}

function updateScores() {
    let incrValue = upgrades["value"].getValue();

    document.getElementById("squares-total").innerHTML = bigIntToExp(squaresTotal);
    document.getElementById("squares-unclaimed").innerHTML = bigIntToExp(squaresUnclaimed / 100n);
    document.getElementById("gigasquares-unclaimed").innerHTML = bigIntToExp(getUnclaimedGigasquares());
    document.getElementById("squares-delta").innerHTML = bigIntToExp(incrValue * boardScore / 100n) + " square" + (boardScore / 100n == 1 ? " " : "s ");

    document.getElementById("megasquares-header").hidden = !(megaSquaresUnlocked || gigaSquaresUnlocked);
    document.getElementById("megasquares-footer").hidden = !(megaSquaresUnlocked || gigaSquaresUnlocked);

    document.getElementById("gigasquares-header").hidden = !(upgrades["gigaBoardUnlocked"].getValue() || gigaSquaresUnlocked);
    document.getElementById("gigasquares-unclaimed-header").hidden = !(upgrades["gigaBoardUnlocked"].getValue() || gigaSquaresUnlocked);
    document.getElementById("gigasquares-footer").hidden = !(upgrades["gigaBoardUnlocked"].getValue() || gigaSquaresUnlocked);

    document.getElementById("ultrasquares-header").hidden = !(upgrades["ultraBoardUnlocked"].getValue());
    document.getElementById("ultrasquares-footer").hidden = !(upgrades["ultraBoardUnlocked"].getValue());
    document.getElementById("ultraBoardMegaSquareBoostAmount").innerHTML = upgrades["ultraBoardMegaSquaresBonusMultiplier"].getValue() * upgrades["ultraBoardCounter"].getValue() + 1n;

    document.getElementById("squares-footer-total").innerHTML = bigIntToExp(squaresTotal);
    document.getElementById("megasquares-total").innerHTML = bigIntToExp(megaSquaresTotal);
    document.getElementById("megasquares-footer-total").innerHTML = bigIntToExp(megaSquaresTotal);
    document.getElementById("gigasquares-total").innerHTML = bigIntToExp(gigaSquaresTotal);
    document.getElementById("gigasquares-footer-total").innerHTML = bigIntToExp(gigaSquaresTotal);
    document.getElementById("ultrasquares-total").innerHTML = bigIntToExp(ultraSquaresTotal);
    document.getElementById("ultrasquares-footer-total").innerHTML = bigIntToExp(ultraSquaresTotal);

    ["upgradeAutoPurchaser", "dimensionsAutoPurchaser", "squaresAutoClaimer", "megasquaresAutoClaimer", "gigaBoardAutoIncrement", "megaUpgradeAutoPurchaser", "ultraBoardAutoIncrement"].forEach(upgradeName => {
        if(upgradeName == "squaresAutoClaimer") {
            document.getElementById("squaresAutoClaimerSettings").hidden = upgrades["squaresAutoClaimer"].level == 1n;
        }
        document.getElementById(upgradeName + "-timeRemaining").hidden = document.getElementById(upgradeName + "Enabled").hidden = upgrades[upgradeName].level == 1n;
        document.getElementById(upgradeName + "-timeRemaining").innerHTML = Math.max(0, (autobuyers[upgradeName].buyerCounter / 100).toFixed(2)) + "s";
    });

    document.getElementById("thankYouMessage").hidden = maxUltraSquares < 2000;
}

function bigIntToExp(b) {
    if(b < 10000) {
        return b.toString();
    }
    let len = b.toString().length - 1;
    return b.toString().charAt(0) + "." + b.toString().substring(1, 3) + "e" + len;
}

function resetMiners() {
    lastCheckedPosition = 0;
    miners.forEach(miner => {
        miner.reset();
    });
}

function emptyMiners() {
    miners = [];
}

function addMiner() {
    if(miners.length < 16*16) {
        miners.push(new Miner());
    }
}

function megaResetUpgrades() {
    ["dimensions", 
    "speed", 
    "value", 
    "minerCount", 
    "minerSpeed"].forEach(type => {
        upgrades[type].level = 1n;
        upgrades[type].invalidateValue();
    });
    
    squaresUnclaimed = 0n;
    lastClaimAmount = 0n;

    glowCounters = Array.from({length: Number(upgrades["dimensions"].getValue(upgrades["dimensions"].maxLevel + upgrades["dimensionsMax"].getValue())) ** 2}, () => ({counter: 0, lastColor: "", lastFill: "", minerOccupied: false}));

    emptyMiners();
}

function gigaResetUpgrades() {
    megaResetUpgrades();

    maxMegaSquares = 0n;
    megaSquaresTotal = 0n;
    squaresTotal = 0n;
    squaresUnclaimed = 0n;
    
    ["speedFactor", 
    "minerSpeedFactor", 
    "upgradeAutoPurchaser", 
    "dimensionsAutoPurchaser", 
    "squaresAutoClaimer", 
    "megasquaresAutoClaimer", 
    "startingSquares",
    "timerSpeedBonus", 
    "gigaBoardUnlocked", 
    "gigaBoardCounter", 
    "gigaBoardAutoIncrement", 
    "gigaBoardAutoIncrementAmount", 
    "dimensionsMax"].forEach(type => {
        upgrades[type].level = 1n;
        upgrades[type].invalidateValue();
    });
    
    glowCountersMega = Array.from({length: 2 ** 2 ** 2}, () => ({counter: 0, lastColor: "", lastFill: ""}));
}

function claimSquares() {
    resetMiners();
    
    squaresTotal += squaresUnclaimed / 100n;
    lastClaimAmount = squaresUnclaimed / 100n;
    squaresUnclaimed = 0n;
    boardScore = 0n;

    redrawSquares = true;
    didUpgrade = true;
}

function claimMegaSquare() {
    megaSquaresTotal += upgrades["megaSquaresMultiplier"].getValue();
    squaresTotal = upgrades["startingSquares"].getValue();
    boardScore = 0n;
    megaSquaresUnlocked = true;
    maxMegaSquares = megaSquaresTotal > maxMegaSquares ? megaSquaresTotal : maxMegaSquares;
    
    megaResetUpgrades();

    didUpgrade = true;

    ["timerSpeedBonus"].forEach(type => upgrades[type].invalidateValue());

    let ultraBoardSpeedUpgrade = upgrades["ultraBoardHarvestSpeed"];
    let ultraBoardSpeedAutobuyer = autobuyers["ultraBoardHarvestSpeed"];

    let oldTimer = ultraBoardSpeedAutobuyer.runTime;

    ultraBoardSpeedAutobuyer.runTime = Number(ultraBoardSpeedUpgrade.getValue());
    ultraBoardSpeedAutobuyer.buyerCounter = ultraBoardSpeedAutobuyer.runTime * ultraBoardSpeedAutobuyer.buyerCounter / oldTimer;

    redrawSquares = true;
}

function claimGigaSquare() {
    gigaSquaresTotal += getUnclaimedGigasquares();

    gigaResetUpgrades();

    gigaSquaresUnlocked = true;

    ["upgradeAutoPurchaser", "dimensionsAutoPurchaser", "squaresAutoClaimer", "megasquaresAutoClaimer"].forEach(upgrade => {
        upgrades[upgrade].level = upgrades["megaStartingLevel"].getValue();
    });

    maxGigaSquares = (gigaSquaresTotal + getUnclaimedGigasquares()) > maxGigaSquares ? (gigaSquaresTotal + getUnclaimedGigasquares()) : maxGigaSquares;
    
    didUpgrade = true;
    
    let canvas = document.getElementById("canvas");
    let ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    redrawAll = true;
}

function updateButtons() {
    if(inSimulation) {
        return;
    }

    Object.values(upgrades).forEach(upgrade => {
        //if(upgrade.type == "dimensionsMax") return;
        document.getElementById(upgrade.buttonElement).disabled = !upgrade.canDoUpgrade();
        document.getElementById(upgrade.type).hidden = upgrade.isHidden();
    });

    if(boardScore >= getMaxBoardScore() && upgrades["dimensions"].getValue() >= 16n) {
        document.getElementById("megasquares-button").hidden = false;
        document.getElementById("megasquares-button").disabled = false;
    }
    else if(megaSquaresUnlocked) {
        document.getElementById("megasquares-button").hidden = false;
        document.getElementById("megasquares-button").disabled = true;
    } else {
        document.getElementById("megasquares-button").disabled = true;
    }

    if(upgrades["gigaBoardCounter"].getValue() >= getMaxGigaBoardScore()) {
        document.getElementById("gigasquares-button").hidden = false;
        document.getElementById("gigasquares-button").disabled = false;
    }
    else {
        document.getElementById("gigasquares-button").disabled = true;
    }
}

function updateUpgradeTexts() {
    if(inSimulation) {
        return;
    }

    document.getElementById("megastore").hidden = !(megaSquaresUnlocked || upgrades["megaStartingLevel"].level > 1n);
    document.getElementById("gigastore").hidden = !(gigaSquaresUnlocked || upgrades["gigaBoardUnlocked"].level > 1n);
    document.getElementById("ultrastore").hidden = !(upgrades["ultraBoardUnlocked"].level > 1n);

    Object.values(upgrades).forEach(upgrade => {
        //if(upgrade.type == "dimensionsMax") return;
        let amountToPurchase = 0n;
        if(purchaseMax) {
            amountToPurchase = upgrade.getMaxLevel() - upgrade.level;
            amountToPurchase = amountToPurchase < 1n ? 1n : amountToPurchase;
        }
        else {
            amountToPurchase = purchaseMultiplier;
        }

        document.getElementById(upgrade.upgradeElement).innerHTML = upgrade.upgradeText();
        if(upgrade.type == "dimensions") {
            return;
        }
        else if(upgrade.type in ["gigaBoardUnlocked", "dimensionsMax"]) {
            let upgradePriceText = upgrade.level == 1n ? bigIntToExp(upgrade.getPrice(upgrade.level, amountToPurchase)) : "???";
            document.getElementById(upgrade.priceElement).innerHTML = upgradePriceText;
        }
        else {
            let upgradePriceText = upgrade.level < upgrade.maxLevel ? bigIntToExp(upgrade.getPrice(upgrade.level, amountToPurchase)) : "???";
            document.getElementById(upgrade.priceElement).innerHTML = upgradePriceText;
        }
    });
}

function doUpgrade(type) {
    let upgrade = upgrades[type];

    if(!upgrade.canDoUpgrade()) {
        return false;
    }

    let amountToPurchase = 0n;
    if(purchaseMax) {
        amountToPurchase = upgrade.getMaxLevel() - upgrade.level;
        amountToPurchase = amountToPurchase < 0n ? 0n : amountToPurchase;
    }
    else {
        amountToPurchase = purchaseMultiplier;
    }

    if(upgrade.currencyType == CURRENCY_NORMAL) {
        squaresTotal -= upgrade.getPrice(upgrade.level, amountToPurchase);
    }
    else if(upgrade.currencyType == CURRENCY_MEGA) {
        megaSquaresTotal -= upgrade.getPrice(upgrade.level, amountToPurchase);
        upgrades["timerSpeedBonus"].invalidateValue();
    }
    else if(upgrade.currencyType == CURRENCY_GIGA) {
        gigaSquaresTotal -= upgrade.getPrice(upgrade.level, amountToPurchase);
    }
    else if(upgrade.currencyType == CURRENCY_ULTRA) {
        ultraSquaresTotal -= upgrade.getPrice(upgrade.level, amountToPurchase);
    }

    if(type == "dimensions") {
        boardScore = 0n;
        upgrade.level += 1n;
        redrawSquares = true;
        glowCounters = Array.from({length: Number(upgrades["dimensions"].getValue(upgrades["dimensions"].maxLevel + upgrades["dimensionsMax"].getValue())) ** 2}, () => ({counter: 0, lastColor: "", lastFill: "", minerOccupied: false}));
        startingBoardBitFlippedDate = 0;
        resetMiners();
    }
    else if(type == "minerCount") {
        upgrade.level += amountToPurchase;
        for(let i = 0; i < amountToPurchase; ++i) {
            addMiner();
        }
    }
    else if(type == "gigaBoardUnlocked") {
        upgrade.level += amountToPurchase;
        upgrades["gigaBoardAutoIncrement"].level = upgrades["megaStartingLevel"].getValue();
        redrawAll = true;
    }
    else if(type == "gigaBoardCounter") {
        upgrade.level += upgrades["gigaBoardAutoIncrementAmount"].getValue();
        maxGigaSquares = (gigaSquaresTotal + getUnclaimedGigasquares()) > maxGigaSquares ? (gigaSquaresTotal + getUnclaimedGigasquares()) : maxGigaSquares;
    }
    else if(type == "megaStartingLevel") {
        upgrade.level += amountToPurchase;    
        ["upgradeAutoPurchaser", "dimensionsAutoPurchaser", "squaresAutoClaimer", "megasquaresAutoClaimer"].forEach(upgrade => {
            upgrades[upgrade].level = upgrades[upgrade].level > upgrades["megaStartingLevel"].getValue() ? upgrades[upgrade].level : upgrades["megaStartingLevel"].getValue();
            if(upgrades[upgrade].getValue() < autobuyers[upgrade].buyerCounter * 10) {
                autobuyers[upgrade].reset();
            }
        });
    }
    else if(type != "ultraBoardHarvestSpeed" && Object.keys(autobuyers).includes(type)) {
        upgrade.level += amountToPurchase;
        if(upgrades[type].getValue() < autobuyers[type].buyerCounter * 10) {
            autobuyers[type].reset();
        }
    }
    else if(type == "dimensionsMax") {
        upgrade.level += amountToPurchase;
        glowCounters = Array.from({length: Number(upgrades["dimensions"].getValue(upgrades["dimensions"].maxLevel + upgrades["dimensionsMax"].getValue())) ** 2}, () => ({counter: 0, lastColor: "", lastFill: "", minerOccupied: false}));
    }
    else if(type == "ultraBoardDimensions") {
        upgrade.level += amountToPurchase;
        redrawUltra = true;
        glowCountersUltra = Array.from({length: Number(upgrade.getValue()) ** 2}, () => ({counter: 0, lastColor: "", lastFill: ""}));
    }
    else if(["ultraBoardHarvestSpeed", "ultraBoardHarvestValue"].includes(type)) {
        let speedUpgrade = upgrades["ultraBoardHarvestSpeed"];
        let speedAutobuyer = autobuyers["ultraBoardHarvestSpeed"];

        let oldTimer = speedAutobuyer.runTime;

        upgrade.level += amountToPurchase;
        upgrade.getValueDependencies().forEach(type => upgrades[type].invalidateValue());

        speedAutobuyer.runTime = Number(speedUpgrade.getValue());
        speedAutobuyer.buyerCounter = speedAutobuyer.runTime * speedAutobuyer.buyerCounter / oldTimer;
    }
    else if(type == "ultraBoardCounter") {
        if(upgrade.level > 1n) {
            glowCountersUltra[upgrade.getValue() - 1n].lastFill = "";
        }

        upgrade.level += upgrades["ultraBoardIncrementAmount"].getValue();
        upgrades["megaSquaresMultiplier"].invalidateValue();
        //autobuyers["ultraBoardHarvestSpeed"].reset();
    }
    else if(type == "ultraBoardUnlocked") {
        upgrade.level += 1n;
        redrawAll = true;
    }
    else {
        upgrade.level += amountToPurchase;
    }

    didUpgrade = true;

    if(type in Object.keys(autobuyers)) {
        autobuyers[type].invalidateRunTime();
    }

    upgrade.getValueDependencies().forEach(type => upgrades[type].invalidateValue());

    return true;
}

function updatePurchaseMultiplier(multiplier) {
    if(multiplier == -1n) {
        purchaseMax = true;
    }
    else {
        purchaseMax = false;
    }

    purchaseMultiplier = BigInt(multiplier);
    
    didUpgrade = true;
}

function isValidSquaresAutoClaimInputValue(value) {
    return !isNaN(value) && parseInt(Number(value)) == value && !isNaN(parseInt(value, 10)) && parseInt(value, 10) >= 0;
}

function toggleAutoTimer(type) {
    let autobuyer = autobuyers[type];

    switch(type) {
        case "squaresAutoClaimer":
            autobuyer.enabled = !autobuyer.enabled;
        
            if(autobuyer.enabled) {
                if(!isValidSquaresAutoClaimInputValue(document.getElementById("squaresAutoClaimerInput").value)) {
                    document.getElementById("squaresAutoClaimerInput").style.background = "LightCoral";
                    document.getElementById("squaresAutoClaimerInput").value = "";
                    document.getElementById("squaresAutoClaimerEnabled").checked = false;
                    autobuyer.enabled = false;
                }
                else {
                    let input = BigInt(document.getElementById("squaresAutoClaimerInput").value);
                    if(input > 999) {
                        document.getElementById("squaresAutoClaimerInput").value = input = 999n;
                    }
        
                    squaresAutoClaimFactor = 10n ** input;
                    document.getElementById("squaresAutoClaimerInput").style.background = "white";
                    document.getElementById("squaresAutoClaimerEnabled").checked = true;
                }
            }
            break;
        default:
            autobuyer.enabled = document.getElementById(type + "Enabled").checked;
    }
}

function toggleSquaresAutoClaim() {
}

document.getElementById("squaresAutoClaimerInput").style.width = "3ch";

function squaresAutoClaimInputChanged() {
    autobuyers["squaresAutoClaimer"].enabled = false;
    toggleAutoTimer("squaresAutoClaimer");
    document.getElementById("squaresAutoClaimerInput").style.width = Math.max(3, document.getElementById("squaresAutoClaimerInput").value.length) + "ch";
}

function msToHHMMSS(ms) {
    let hours = Math.floor(ms / (60 * 60 * 1000));
    ms -= hours * 60 * 60 * 1000;
    let minutes = Math.floor(ms / (60 * 1000));
    ms -= minutes * 60 * 1000;
    let seconds = Math.floor(ms / 1000);
    ms -= seconds * 1000;

    let timeString = "";
    if(hours > 0) {
        timeString += hours + ":" + (minutes < 10 ? "0" : "") + minutes + ":" + (seconds < 10 ? "0" : "") + seconds + "." + (ms < 100 ? "0" : "") + (ms < 10 ? "0" : "") + ms;
    }
    else if(minutes > 0) {
        timeString += minutes + ":" + (seconds < 10 ? "0" : "") + seconds + "." + (ms < 100 ? "0" : "") + (ms < 10 ? "0" : "") + ms;
    }
    else {
        timeString += seconds + "." + (ms < 100 ? "0" : "") + (ms < 10 ? "0" : "") + ms;
    }

    return timeString;
}

function toggleDarkModeEnabled() {
    darkModeEnabled = document.getElementById("darkModeEnabled").checked;

    document.body.style.background = document.getElementById("footer-block").style.background = darkModeEnabled ? "rgba(40, 40, 40, 1)" : "white";
    document.body.style.color = darkModeEnabled ? "rgba(170, 170, 170, 1)" : "black";
}

function getCurrencyHeld(type) {
    switch(type) {
        case CURRENCY_NORMAL:
            return squaresTotal;
        case CURRENCY_MEGA:
            return megaSquaresTotal;
        case CURRENCY_GIGA:
            return gigaSquaresTotal;
        case CURRENCY_ULTRA:
            return ultraSquaresTotal;
    }
}

function hash(string) {
    var hash = 0;
    if (string.length == 0) {
        return hash;
    } 

    for (i = 0; i < string.length; ++i) {
        ch = string.charCodeAt(i);
        hash = ((hash << 5) - hash) + ch;
        hash = hash & hash;
    }

    return hash;
}

function outputSaveData() {
    let saveString = JSON.stringify(localStorage);
    let hashedSave = hash(saveString);
    document.getElementById("save-data-field").value = saveString + hashedSave;
    
    //document.getElementById("save-data-field").value = JSON.stringify(localStorage);
   
    document.getElementById("save-data-field").style.background = "White";
}

function parseSaveData() {
    let splitData = document.getElementById("save-data-field").value.split("}");
    let hashString = splitData.pop();
    let jsonString = splitData.join("}") + "}";

    if(hash(jsonString) != hashString) {
        document.getElementById("save-data-field").style.background = "LightCoral";
        return;
    }

    let saveObject;
    try {
        saveObject = JSON.parse(jsonString);
    } catch(e) {
        document.getElementById("save-data-field").style.background = "LightCoral";
        return;
    }

    for(key in saveObject) {
        localStorage[key] = saveObject[key];
    }
    
    load();

    document.getElementById("save-data-field").style.background = "White";
}

function saveDataFieldInputChanged() {
    document.getElementById("save-data-field").style.background = "White";
}

function startingBoardBitFlippedCurrentIteration(position) {
    if(startingBoardBitFlippedDate != currentTime) {
        startingBoardBitFlippedDate = currentTime;
        boardScoreBinary = (boardScore/100n).toString(2);
    }
    
    return boardScoreBinary.charAt(boardScoreBinary.length - Number(position) - 1) == "1";
}

function skipSimulating() {
    lastUpdatedTime = currentTime;
}
