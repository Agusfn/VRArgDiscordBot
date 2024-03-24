import * as ModuleAlias from 'module-alias'

ModuleAlias.addAliases({
    '@core': __dirname + '/core',
    '@services': __dirname + '/services',
    '@models': __dirname + '/models',
    '@scripts': __dirname + '/scripts',
    '@ts': __dirname + '/ts',
    '@utils': __dirname + '/utils'
});