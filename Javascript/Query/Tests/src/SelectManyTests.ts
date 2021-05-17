class SelectManyTests {

    public basic() {
        let list = [
            { name: 'Bob', children: ['A', 'B', 'C'] },
            { name: 'Sue', children: ['D', 'E', 'F'] }
        ];
        Assert.areEqual(6, $selectMany(list, p => p.children).length);
    }

}