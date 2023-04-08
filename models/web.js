// @ts-check
const Data = require('../class/data');
const Protocol = require('../class/protocol');
const Joi = require('joi');
var parser = require('http-string-parser');

module.exports = class extends Protocol(true) {
    schema = Joi.object({
        company: Joi.string().optional(),
        imei: Joi.string().required(),
        data: Joi.object().required()
    })

    /**
     * @param {Buffer} msg 
     * @return {boolean}
     */
    validate(msg) {
        const { error } = this.parseMsg(msg);
        if (error) 
            return false;
        return true;
    }

    /**
     * @param {Buffer} msg 
     * @return {string}
     */
    getIMEI(msg) {
        const { value } = this.parseMsg(msg);
        return value.imei;
    }

    /**
     * @param {Buffer} msg
     * @param {(data: Data) => void} saveFunc
     * @return {Promise<Buffer>}
     */
    execute(msg, saveFunc) {
        const { value } = this.parseMsg(msg);
        saveFunc({
            keyword: value.data.index,
            date_time: value.data.date_time,
            coordinate: value.data.coor,
            speed: value.data.speed,
            angle: value.data.course,
            battery_level: value.data.battery, 
            args: {                
                charging: false,
                altitude: value.data.altitude,
                sattelites: value.data.sattelites
            },
            message: JSON.stringify(value)
        });
        
        return new Promise(resolve => {
            resolve(this.prepareRespond(200, 'OK'));
        });
    }

    /**
     * @param {number} statusCode
     * @param {string} statusMessage
     * @return {Buffer}
     */
    prepareRespond(statusCode, statusMessage) {
        return Buffer.from(`HTTP/1.1 ${statusCode} ${statusMessage}\r\n`, "utf8");
    }
  
    /**
     * @param {Buffer} msg
     */
    parseMsg(msg) {
        let httpRequest = parser.parseRequest(msg.toString('utf-8'));
        
        if (Object.keys(httpRequest.headers).length > 0) {
            httpRequest.body = JSON.parse(httpRequest.body);
            return this.schema.validate(httpRequest.body);
        } else 
            return {error: {details: [{message: "No HTTP"}]}, value: null};
    }
}