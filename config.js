

const SHARE_PATH = "\\\\192.168.140.154\\share\\ads";

const config = {

    user: 'OECTEST',

    password: 'TesT99$',

    server: '192.168.140.154',

    database: 'DEV_TEST',


    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true
    },

    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000 
    },

    
    SHARE_PATH : SHARE_PATH 
};

module.exports = config;
