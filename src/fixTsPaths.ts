import * as ModuleAlias from 'module-alias'

ModuleAlias.addAliases({
    '@database': __dirname + '/database',
    '@model': __dirname + '/model',
    '@scripts': __dirname + '/scripts',
    '@utils': __dirname + '/utils'    
});