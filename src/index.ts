import 'reflect-metadata';
import "./fixTsPaths"
import { Container } from 'typedi';
import App from './App';
import { TestScript, ServerHelper, BeatSaberScript } from "@scripts/index"


const app = Container.get(App);

// Register scripts
app.registerScript(TestScript);

app.initialize();

process.on('SIGINT', () => {
    app.close();
    process.exit()
});


// ScriptLoader.registerScript(TestScript)
// //ScriptLoader.registerScript(ServerHelper)
// //ScriptLoader.registerScript(MemeScript)
// //ScriptLoader.registerScript(BeatSaberScript)

// // Initialize config, database, ORM, etc.
// initializeApp()

// const script = Container.get(TestScript);

// console.log(script.a());