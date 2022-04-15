import "./fixTsPaths"
import { ScriptLoader } from "@lib/index"
import { initializeApp } from "./initializeApp"
import { TestScript, ServerHelper, BeatSaberScript } from "@scripts/index"


// Register scripts
//ScriptLoader.registerScript(TestScript)
ScriptLoader.registerScript(ServerHelper)
//ScriptLoader.registerScript(MemeScript)
ScriptLoader.registerScript(BeatSaberScript)

// Initialize config, database, ORM, etc.
initializeApp()

