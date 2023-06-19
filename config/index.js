require("dotenv").config();

module.exports = {
    APP: {
        PORT: 7905,
        SCAN_DIR: 'models',
    },

    /**
     * @type {import("pg").PoolConfig} DB
     */
    DB: {
        host: '10.119.0.11',
        port: 5432,
        user: 'postgres',
        password: 'postgres',
        database: 'oxrana_gps',
        application_name: 'UzTracking v3.0'
    },
    DB71: {
        host: '10.119.0.11',
        port: 5432,
        user: 'postgres',
        password: 'postgres',
        database: 'oxrana_monitoring_regions',
        application_name: 'UzTracking v3.0'
    }
};