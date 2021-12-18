import * as ModuleAlias from 'module-alias'

ModuleAlias.addAliases({
    '@lib': __dirname + '/lib',
    '@models': __dirname + '/models',
    '@scripts': __dirname + '/scripts',
    '@ts': __dirname + '/ts',
    '@utils': __dirname + '/utils'
});