const fs = require('fs');

const config = require('../config.json');

exports.echo = msg => {
    console.log(msg);

    if (config.logToFile) {
        fs.appendFileSync(config.logToFile, `${msg}\r\n`);
    }
};
