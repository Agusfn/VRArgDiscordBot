import * as ModuleAlias from 'module-alias'

ModuleAlias.addAliases({
    '@lib': __dirname + '/lib',
    '@scripts': __dirname + '/scripts',
    '@ts': __dirname + '/ts',
    '@utils': __dirname + '/utils'    
});