import "./fixTsPaths"
import { ScriptLoader } from "@lib/index"
import { initializeApp } from "./initializeApp"
import { TestScript } from "@scripts/index"


// Register scripts
ScriptLoader.registerScript(TestScript)
//ScriptLoader.registerScript(MemeScript)
//ScriptLoader.registerScript(SpicySaberScript)

// Initialize config, database, ORM, etc.
initializeApp()

