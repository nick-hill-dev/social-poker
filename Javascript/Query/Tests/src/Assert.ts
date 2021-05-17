class Assert {

    public static areEqual<T>(expected: T, actual: T, error: string = 'Not equal. Expected: ' + expected + ', actual: ' + actual) {
        if (expected != actual) {
            throw error;
        }
    }

}