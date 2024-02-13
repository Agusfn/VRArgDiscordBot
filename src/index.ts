import "./fixTsPaths"
import { ScriptLoader } from "@lib/index"
import { initializeApp } from "./initializeApp"
import { TestScript, ServerHelper, BeatSaberScript, VersusScript } from "@scripts/index"


// Register scripts
//ScriptLoader.registerScript(TestScript)
ScriptLoader.registerScript(ServerHelper)
//ScriptLoader.registerScript(MemeScript)
ScriptLoader.registerScript(BeatSaberScript)
ScriptLoader.registerScript(VersusScript)

// Initialize config, database, ORM, etc.
initializeApp()

