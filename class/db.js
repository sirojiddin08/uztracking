// @ts-check
const { Pool } = require('pg');
const { DB } = require('../config');
const Joi = require('joi');
const Data = require('./data');

const schema = Joi.object({
    keyword: Joi.string().optional().default('0'),
    date_time: Joi.date().required(),
    coordinate: Joi.object({
        lat: Joi.number().required().min(-90).max(90),
        lng: Joi.number().required().min(-180).max(180)
    }).required(),
    ignition: Joi.any(),
    speed: Joi.number().required(),
    angle: Joi.number().required(),
    battery_level: Joi.number().optional().default(0),
    message: Joi.string().required(),
    args: Joi.object({
        charging: Joi.boolean().optional().allow(null).default(false), //Joi.bool().optional().default(false),
        altitude: Joi.number().optional().default(0),
        sattelites: Joi.number().optional().default(0)
    }).optional().default({})
});

module.exports = {
    /**
     * 
     * @param {string} imei 
     * @returns {Promise<number>}
     */
    getDeviceUID: async (imei) => {
        const pool = new Pool(DB);
        try {
            let res = await pool.query(`SELECT uid FROM devices WHERE device_key = $1`, [imei]);
            if (res.rowCount > 0)
                return res.rows[0].uid;
            else
                return -1;
        } catch (error) {
            console.log("DB Error:", error.message);
            return -1;
        } finally {
            pool.end();
        }
    },

    /**
     * 
     * @param {number} uid 
     * @param {Data} data 
     * @returns {Promise<number> | void}
     */
    write: (uid, data) => {
        const { value, error } = schema.validate(data);
        
        if (error) {
            console.log('Error data came ', data);
            return console.error("Validate Error:", error.details[0].message);
        } else {
            console.log('True data came ', value);
            const pool = new Pool(DB);
            pool.query(`INSERT INTO gps.tracking3 (device_id, keyword, date_time, coordinate, speed, angle, battery_level, message, args, lat, lon) 
                    VALUES ($1, $2, $3, ST_Transform(ST_SetSrid(ST_MakePoint($4, $5), 4326), 3857), $6, $7, $8, $9, $10, $11, $12);`, [
                uid,
                value.keyword,
                value.date_time,
                value.coordinate.lng,
                value.coordinate.lat,
                value.speed,
                value.angle,
                value.battery_level,
                value.message,
                JSON.stringify(value.args),
                value.coordinate.lat,
                value.coordinate.lng
            ], (err) => {
                pool.end();
                if (err)
                    console.error("DB Error:", err);
            });
        }
    }
}