import { ScriptLoader } from "./ScriptLoader";

describe('ScriptLoader', () => {

    let service: ScriptLoader;

    beforeEach(async () => {
        service = new ScriptLoader();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

});