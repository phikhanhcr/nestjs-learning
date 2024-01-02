"use strict";
exports.__esModule = true;
var common_1 = require("@nestjs/common");
function default_1(job, cb) {
    console.log('zo day');
    common_1.Logger.debug(job.data.message + " (pid " + process.pid + ")", "SEPARATE");
    cb(null, 'Hurrah');
}
exports["default"] = default_1;
