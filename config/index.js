require("dotenv").config();

module.exports = {
    APP: {
        PORT: 7905, //process.env.APP_PORT,
        SCAN_DIR: 'models', //process.env.SCAN_DIR
    },

    /**
     * @type {import("pg").PoolConfig} DB
     */
    DB: {
        host: '127.0.0.1', //process.env.DB_HOST,
        port: 5432, //process.env.DB_PORT,
        user: 'postgres', //process.env.DB_USER,
        password: 'postgres', //process.env.DB_PASSWORD,
        database: 'oxrana_gps', //process.env.DB_NAME,
        application_name: 'UzTracking v3.0' //process.env.APPLICATION_NAME,
    },
    DB71: {
        host: '10.119.0.11', //process.env.DB_HOST,
        port: 5432, //process.env.DB_PORT,
        user: 'postgres', //process.env.DB_USER,
        password: 'postgres', //process.env.DB_PASSWORD,
        database: 'oxrana_monitoring_regions', //process.env.DB_NAME,
        application_name: 'UzTracking v3.0' //process.env.APPLICATION_NAME,
    }
};