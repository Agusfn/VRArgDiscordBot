import * as ModuleAlias from 'module-alias'

ModuleAlias.addAliases({
    '@database': __dirname + '/database',
    '@lib': __dirname + '/lib',
    '@model': __dirname + '/model',
    '@scripts': __dirname + '/scripts',
    '@utils': __dirname + '/utils'    
});