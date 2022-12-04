import { Container, Service } from 'typedi';

@Service()
export class TestService1 {

    public hello() {
        console.log("Hello world 2!");
    }

}


@Service()
export class TestService2 {

    constructor(private testService: TestService1) {
    }

    public hello() {
        this.testService.hello();
    }

}
