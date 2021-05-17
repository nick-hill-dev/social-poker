class TestRunner {

    public static execute() {
        try {
            for (let instance of [new CountTests(), new SelectManyTests()]) {
                for (let member in instance) {
                    if (typeof instance[member] == 'function') {
                        console.log('CountTests.' + member + '...');
                        instance[member]();
                        console.log('OK');
                    }
                }
            }
            console.log('Tests succeeded.');
        }
        catch (s) {
            console.error(s);
            console.log('Tests failed.');
        }
    }

}