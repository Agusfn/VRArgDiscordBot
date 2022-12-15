//-------------------------------------------------
// spec/helpers/helper.js
//-------------------------------------------------

// const ModuleAlias = require('module-alias');

// ModuleAlias.addAliases({
//     '@lib': __dirname + '/lib',
//     '@models': __dirname + '/models',
//     '@scripts': __dirname + '/scripts',
//     '@ts': __dirname + '/ts',
//     '@utils': __dirname + '/utils'
// });

const TSConsoleReporter = require("jasmine-ts-console-reporter");

jasmine.getEnv().clearReporters(); //Clear default console reporter
jasmine.getEnv().addReporter(new TSConsoleReporter());