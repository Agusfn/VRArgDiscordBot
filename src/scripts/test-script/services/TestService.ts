import { Container, Service } from 'typedi';

@Service()
export class TestService1 {

    public hello() {
        return 4;
    }

}


@Service()
export class TestService2 {

    constructor(private testService: TestService1) {
    }

    public hello() {
        return this.testService.hello();
    }

}
