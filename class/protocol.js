const Data = require('./data');

/**
 * 
 * @param {boolean} oneTime 
 */
module.exports = (oneTime) => {
    return class Protocol {
        isOneTime = oneTime;
        constructor() {}

        /**
         * 
         * @param {Buffer} msg 
         * @return {boolean}
         */
        validate(msg) {
            throw 'validate function is not implemented';
        }
    

        /**
         * 
         * @param {Buffer} msg 
         * @return {string}
         */
        getIMEI(msg) {
            throw 'IMEI function is not implemented';
        }


        /**
         * 
         * @param {Buffer} msg 
         * @param {(data: Data) => void} saveFunc 
         * @return {Promise<Buffer>}
         */
        execute(msg, saveFunc) {
            throw 'execute function is not implemented';
        }


        /**
         * 
         * @return {string}
         */
        get FuncName() {
            return this.isOneTime ? "end" : "write";
        }
    }
};