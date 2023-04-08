// @ts-check
const Data = require('../class/data');
const Protocol = require('../class/protocol');
const moment = require('moment');

module.exports = class extends Protocol(false) {
    /**
	 * @param {Buffer} msg 
	 * @return {boolean}
	 */
    validate(msg) {
        let length = parseInt(msg.slice(0,2).toString('hex'), 16);
        let imei = msg.slice(2).toString('ascii');
        return length === imei.length;
    }

	
    /**
	 * @param {Buffer} msg 
	 * @return {string}
	 */
    getIMEI(msg) {
        return msg.slice(2).toString('ascii');
    }

    /**
	 * @param {Buffer} msg
	 * @param { (data: Data) => void } func
	 * @return {Promise<Buffer>}
	 */
    execute(msg, func) {
        this._parse.try(msg);

        if (this._parse.check()) {
            func({
                keyword: this._parse.priority(),
                date_time: this._parse.dateTime(),
                coordinate: {
                    lat: this._parse.lat(),
                    lng: this._parse.lng()
                },
                speed: this._parse.speed(),
                angle: this._parse.angle(),
                battery_level: this._parse.batteryLevel(), 
                args: {
                    charging: this._parse.isCharging(),
                    altitude: this._parse.alt(),
                    sattelites: this._parse.sats()
                },
                message: this._parse.message()
            });
        }
        
        return new Promise((resolve, reject) => {
            if (this.validate(msg)) {
                resolve(Buffer.from([0x01]));
            } else {
                var buf = Buffer.alloc(4);
                buf.writeInt32BE(this._parse.ack());
                resolve(buf);
            }
        });
    }

    _parse = {
		_hexData: null,

		_hex2dec: function(/** @type {number} */ from, /** @type {number} */ length) {
			return parseInt('0x' + this._hexData.substr(from, length));
		},

		try: function(/** @type {Buffer} */ data) {
			this._hexData = data.toString('hex');
		},

		ack: function() {
			return this._hex2dec(18, 2);
		},

		check: function() {
            let d = this.dateTime();
			return d instanceof Date && !!d.getDate();
		},

		dateTime: function() {
			return moment(this._hex2dec(20, 16)).toDate();
		},

		priority: function () {
			return this._hex2dec(36, 2).toString();
		},

		lng: function() {
			return this._hex2dec(38, 8) / 10000000;
		},

		lat: function() {
			return this._hex2dec(46, 8) / 10000000;
		},

		alt: function() {
			return this._hex2dec(54, 4);
		},

		angle: function() {
			return this._hex2dec(58, 4);	
		},

		sats: function() {
			return this._hex2dec(62, 2);
		},

		speed: function() {
			return this._hex2dec(64, 4);
		},

		isCharging: function() {
			var _temp = this._hex2dec(76, 2);
			if (_temp !== 66) return null;
			return this._hex2dec(78, 4) > 0;
		},

		batteryLevel: function() {
			var _temp = this._hex2dec(82, 2);
			if (_temp !== 67) 
				return 0;

			_temp = ((((this._hex2dec(84, 4) / 1000) - 3.0) / 1.120) * 100);
			
			if (_temp > 100) 
				return 100;
			
			return _temp;
		},
		
		message: function() {
			return this._hexData.substr(20, 68);
		}
	}
}