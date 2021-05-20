import * as ModuleAlias from 'module-alias'

console.log(__dirname + '/utils')

ModuleAlias.addAliases({
    '@utils': __dirname + '/utils'
});