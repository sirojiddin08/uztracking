// @ts-check
class DataArgs {
    /** @type {boolean} */
    charging;
    /** @type {number} */
    altitude;
    /** @type {number} */
    sattelites;
}

class DataCoor {
    /** @type {number} */
    lat;
    /** @type {number} */
    lng;
}

class Data {
    /** @type {string} */
    keyword;
    /** @type {Date} */
    date_time;
    /** @type {DataCoor} */
    coordinate;
    /** @type {number} */
    speed;
    /** @type {number} */
    angle;
    /** @type {number} */
    battery_level;
    /** @type {DataArgs} */
    args;
    /** @type {string} */
    message;
}

module.exports = Data
