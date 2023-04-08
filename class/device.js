// @ts-check
const EventEmitter = require('events');

class Context {
    /**
     * @param {Buffer} msg
     * @param {Error=} err
     */
    constructor (msg, err) {

    }

    /** @type {Buffer} */
    message;
    /** @type {Error} */
    error
}

class Device extends EventEmitter {
    /** @type {number} */
    UID;
    /** @type {string} */
    IMEI;
    /** @type {string} */
    IPAddress;
    /** @type {number} */
    pIndex;

    /**
     * @param {string} ip 
     */
    constructor(ip) {
        super();
        this.IPAddress = ip;
    }

    /**
     * @param {"connect" | "disconnect" | "message" | "reject" | "error"} event
     * @param {(ctx: Context) => Device} listener 
     */
    // @ts-ignore
    on(event, listener) {
        super.on(event, listener);
        return this;
    }

    /**
     * @param {"connect" | "disconnect" | "message" | "reject" | "error"} event
     * @param {Context=} ctx 
     */
    // @ts-ignore
    emit(event, ctx) {
        super.emit(event, ctx);
        return this;
    }
}

module.exports = {Device, Context};
