import "./fixTsPaths"
import { initializeApp, ScriptLoader } from "@lib/index"
import { MemeScript, SpicySaberScript } from "@scripts/index"


// Initialize config, database, ORM, etc.
initializeApp()

// Register scripts
ScriptLoader.registerScript(MemeScript)
ScriptLoader.registerScript(SpicySaberScript)