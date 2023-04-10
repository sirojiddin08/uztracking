// @ts-check
const net = require('net');
const path = require('path');
const fs = require('fs');
const db = require('./db');
const Protocol = new (require("./protocol")(false))();
const {Device, Context} = require("./device");
const { APP } = require("../config");
const EventEmitter = require('events');

/** 
 * @typedef {Object} ServerOptions
 * @prop {string} [host='0.0.0.0']
 * @prop {number} [port=1806]
 */

class GPS extends EventEmitter {
    /** @type {Protocol[]} */
    protocols = [];

    constructor() {
        super();
        fs.readdirSync(path.join(__dirname, '..', APP.SCAN_DIR)).map(item => {
            let p, n = path.parse(item).name;
            p = require(`../${APP.SCAN_DIR}/${n}`);
            this.protocols.push(new p());            
        });
    }

    /**
     * 
     * @param {ServerOptions} options 
     * @param {(device: Device) => void} func 
     * @returns 
     */
    createServer(options, func) {
        let opt = {
            port: options.port || 7905,
            host: options.host || '0.0.0.0'
        };

        net.createServer(socket => {
            let device = new Device(socket.remoteAddress);
            func(device);

            device.emit('connect');

            socket.on('data', (msg) => {
                device.emit('message', new Context(msg));
                if (!device.UID) {
                    return this.ident(device, msg, (found) => {
                        if (found) 
                            socket.emit('msg', msg);
                        else {
                            device.emit('reject', new Context(msg));
                            socket.end();
                        }
                    });
                } else 
                    socket.emit('msg', msg);
            })
            .on('end', () => device.emit('disconnect'))
            .on('error', (err) => device.emit('error', new Context(null, err)))
            .on('msg', (msg) => {
                this.protocols[device.pIndex]
                    // .execute(msg, (data) => console.log('its data coming from gpss ', data))
                    .execute(msg, (data) => db.write(device.UID, data))
                    .then((data) => {
                        if (data && socket.writable) {
                            socket[this.protocols[device.pIndex].FuncName](data);
                        }
                    });
            });
        }).listen(opt, () => this.emit('start', opt));
        return this;
    }

    /**
     * @param {"start"} event
     * @param {ServerOptions} args 
     */
    // @ts-ignore
    emit(event, args) {
        super.emit(event, args);
        return this;
    }

    /**
     * @param {"start"} event
     * @param {(ctx: ServerOptions) => GPS} listener 
     */
    // @ts-ignore
    on(event, listener) {
        super.on(event, listener);
        return this;   
    }

    /**
     * 
     * @param {Device} device 
     * @param {Buffer} msg 
     * @param {(found: boolean) => void} done 
     * @returns 
     */
    async ident(device, msg, done) {
        /** @type {Protocol} */
        let protocol;
        for (let i = 0; i < this.protocols.length; i++) {
            protocol = this.protocols[i];
            if (protocol.validate(msg)) {
                device.pIndex = i;
                device.IMEI = protocol.getIMEI(msg);
                device.UID = 359633101468598 // await db.getDeviceUID(device.IMEI);
                if (device.UID > -1)
                    return done(true);
                else
                    return done(false);
            }
        }
        done(false);
    }
}

module.exports = new GPS();