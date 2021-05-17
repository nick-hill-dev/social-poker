class User {

    public id: number = -1;

    public name: string = 'Unknown User';

    public chips: number = 2000;

    public chipsBet: number = 0;

    public folded: boolean = false;
    
    public bet(amount: number) {
        this.chips -= amount;
        this.chipsBet += amount;
    }

}