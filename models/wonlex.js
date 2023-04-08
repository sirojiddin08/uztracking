// @ts-check
const Data = require('../class/data');
const Protocol = require('../class/protocol');
const moment = require('moment');

module.exports = class extends Protocol(false) {
    regex = {
        init: /^\[(.+)\*(\d+)\*(.+)\*(.+)\]$/,
        data: /^(.*),(\d{6}),(\d{6}),([AV]),(-?\d+.\d+),([NS]),(-?\d+.\d+),([EW]),(\d+.?\d*),(\d+.?\d*),(-?\d+.?\d*),(\d+),(\d+),(\d+),(\d+),(\d+),(\d+),(.*)$/
    }

    /**
     * @param {Buffer} msg 
     * @return {boolean}
     */
    validate(msg) {
        let data = msg.toString('ascii');
        console.log(data);
        return this.regex.init.test(data);
    }

    /**
     * @param {Buffer} msg 
     * @return {string}
     */
    getIMEI(msg) {
        let data = msg.toString('ascii');
        let matches = this.regex.init.exec(data);
        return matches[2];
    }

    /**
     * @param {Buffer} msg 
     * @param {(data: Data) => void} saveFunc 
     * @return {Promise<Buffer>}     
     * */
    execute(msg, saveFunc) {
        let res = this.parseMsg(msg);
        if (res && res.length > 30)
            saveFunc({
                keyword: res.data.index,
                date_time: res.data.date_time,
                coordinate: res.data.coor,
                speed: res.data.speed,
                angle: res.data.course,
                battery_level: res.data.battery, 
                args: {
                    charging: false,
                    altitude: res.data.altitude,
                    sattelites: res.data.sattelites
                },
                message: JSON.stringify(res)
            })
        return new Promise((resolve, reject) => {
            if (res && res.length < 30)
                resolve(Buffer.from(`[${res.company}*${res.device_id}*${this._dec2hexString(res.data.index.length)}*${res.data.index}]`));
        });
    }

    /**
     * @param {number} dec
     * @return {string}
     */
    _dec2hexString(dec) {
        return (dec+0x10000).toString(16).substr(-4).toUpperCase();
    }

    /**
     * @param {Buffer} data
     * @param {boolean=} [forRes=false]
     * @return {any}
     */
    parseMsg(data, forRes = false) {
        let sdata = data.toString('ascii');
        if (this.regex.init.test(sdata)) {
            let matches = this.regex.init.exec(sdata), res = {};
    
            res.company = matches[1];
            res.device_id = matches[2];
            res.length = parseInt(matches[3], 16);
            res.data = matches[4];
    
            if (!forRes && this.regex.data.test(res.data)) {
                let d = this.regex.data.exec(res.data);
                // @ts-ignore
                res.data = {
                    index: d[1],
                    date_time: moment(d[2]+d[3]+'+00:00','DDMMYYHHmmssZZ').toDate(),
                    is_valid: d[4] === 'A',
                    coor: {lat: Number.parseFloat(d[5]), lng: Number.parseFloat(d[7])},
                    speed: Number.parseFloat(d[9]),
                    course: Number.parseFloat(d[10]),
                    altitude: Number.parseFloat(d[11]),
                    sattelites: Number.parseInt(d[12]),
                    rssi: Number.parseInt(d[13]),
                    battery: Number.parseInt(d[14]),
                    steps: Number.parseInt(d[15]),
                    tumbles: Number.parseInt(d[16]),
                    status: d[17],
                    others: d[18]
                }
                return res;
            } else {
                let _ = res.data.split(',');
                // @ts-ignore
                res.data = {
                    index: _[0],
                    others: _.slice(1).join(',')
                }
                return res;
            }
        } else {
            console.log("Wonlex Error: ", data);
            return undefined;
        }
    }
}