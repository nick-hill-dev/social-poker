class CountTests {

    public intListWithThree() {
        Assert.areEqual(3, $count([1, 2, 3, 3, 3], i => i == 3));
    }

    public intListWithNone() {
        Assert.areEqual(0, $count([1, 2, 3], i => i == 4));
    }

    public stringListWithTwo() {
        Assert.areEqual(2, $count(['a', 'b', 'a', 'b'], s => s == 'a'));
    }

    public objectListWithOne() {
        Assert.areEqual(1, $count([{ first: 'Nick', last: 'Hill' }, { first: 'Bob', last: 'Bobson' }], p => p.last == 'Hill'));
    }

}