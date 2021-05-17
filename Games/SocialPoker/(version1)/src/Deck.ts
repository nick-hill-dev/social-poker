class Deck {

    public cards: number[] = [];

    public constructor() {
        for (let i = 0; i < 4 * 13; i++) {
            this.cards.push(i);
        }
        this.shuffle();
    }

    public shuffle() {
        let currentIndex = this.cards.length;
        while (0 !== currentIndex) {
            let randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            let temporaryValue = this.cards[currentIndex];
            this.cards[currentIndex] = this.cards[randomIndex];
            this.cards[randomIndex] = temporaryValue;
        }
    }

    public shift(): number {
        return this.cards.shift();
    }

}