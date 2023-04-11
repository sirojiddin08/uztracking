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
				ignition: this._parse.ignition(),
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
		},

		ignition: function() {
			// Assuming the ignition data is a single byte (8 bits) at offset 68
			// in the buffer, you can extract the value as follows:
			let ignitionByte = this._hex2dec(68, 1);
		
			// Assuming the ignition data uses a certain bit within the byte to
			// represent the ignition state (e.g., bit 0), you can extract the
			// ignition state using bitwise operations:
			let ignitionState = (ignitionByte & 0x01) !== 0;
		
			// Return the ignition state (true for ON, false for OFF)
			return ignitionState;
		},

		// ignition: function() {
		// 	var isCharging = this.isCharging();
		// 	var batteryLevel = this.batteryLevel();
		
		// 	// If isCharging is null, ignition status cannot be determined
		// 	if (isCharging === null) {
		// 		return null;
		// 	}
		
		// 	// If batteryLevel is 0, ignition status cannot be determined
		// 	if (batteryLevel === 0) {
		// 		return null;
		// 	}
		
		// 	// If isCharging is true or batteryLevel is 100, ignition is on
		// 	if (isCharging || batteryLevel === 100) {
		// 		return true;
		// 	}
		
		// 	// If isCharging is false and batteryLevel is less than 100, ignition is off
		// 	return false;
		// }
		
		
	}
}