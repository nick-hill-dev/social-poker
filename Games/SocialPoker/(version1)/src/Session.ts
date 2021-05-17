class Session extends WSRelayClient.CommandChannelHandler {

    private client: WSRelayClient.WebSocketRelayClient = null;

    private users: User[] = [];

    private me: User = new User();

    private dealer: User = null;

    private deck: Deck = new Deck();

    private myCards: number[] = [];

    private communityCards: number[] = [];

    private cardsImage: ImageMaps.ImageMap = null;

    private potTextBox: HTMLInputElement = null;

    private usersListBox: $Select = null;

    private chatDiv: HTMLDivElement = null;

    private shuffleButton: HTMLButtonElement = null;

    private dealButton: HTMLButtonElement = null;

    private flopButton: HTMLButtonElement = null;

    private turnButton: HTMLButtonElement = null;

    private riverButton: HTMLButtonElement = null;

    private revealButton: HTMLButtonElement = null;

    private foldButton: HTMLButtonElement = null;

    private checkButton: HTMLButtonElement = null;

    private betTextBox: HTMLInputElement = null;

    private betButton: HTMLButtonElement = null;

    private readonly ttl: number = 14400;

    public constructor(public readonly root: HTMLDivElement, private readonly serverAddress: string) {
        super();
        this.chatDiv = document.createElement('div');
        this.chatDiv.id = "chatDiv";
        root.appendChild(this.chatDiv);
    }

    public start() {
        $httpGetImage('images/cards.png', (image: HTMLImageElement) => this.loadedImage(image));
    }

    private loadedImage(image: HTMLImageElement) {

        this.cardsImage = new ImageMaps.ImageMap(image, 74, 115);

        this.raiseEventMessage('Enter your name:');

        let lastName = localStorage.getItem('name');
        if (lastName == null) {
            lastName = 'U' + (100 + Math.floor(Math.random() * 400));
        }
        let textBox = $new().textBox().maxLength(12).value(lastName).element;
        this.chatDiv.appendChild(textBox);

        let button = $new().button().text('Join').element;
        button.addEventListener('click', () => {
            this.me.name = textBox.value;
            this.nameSpecified();
        }, false);
        this.chatDiv.appendChild(button);
    }

    private nameSpecified() {
        this.raiseShuffled();
        let webSocketProtocol = 'relay';
        this.raiseStatusMessage('Connecting to ' + this.serverAddress + '...');
        this.client = new WSRelayClient.WebSocketRelayClient(this.serverAddress, webSocketProtocol, this);
        localStorage.setItem('name', this.me.name);
    }

    public channelStatus(client: WSRelayClient.WebSocketRelayClient, status: WSRelayClient.ChannelStatus): void {
        if (status == WSRelayClient.ChannelStatus.online) {
            this.raiseStatusMessage('Connected.');
        }
        if (status == WSRelayClient.ChannelStatus.offline) {
            this.raiseStatusMessage('Disconnected.');
            for (let user of this.users) {
                this.removeUser(user);
            }
        }
    }

    public assignUserNumber(client: WSRelayClient.WebSocketRelayClient, userNumber: number): void {
        this.me.id = userNumber;
        this.setupGameUI();
        this.addUser(this.me);
        this.client.joinRealm(4, WSRelayClient.RealmType.realm);
    }

    public assignRealmNumber(client: WSRelayClient.WebSocketRelayClient, realmNumber: number): void {
        this.client.loadData('chips_' + this.me.name);
        this.client.loadData('pot');
        this.client.loadData('cards_' + this.me.name);
        this.client.loadData('community');
    }

    public usersJoined(client: WSRelayClient.WebSocketRelayClient, userNumbers: Array<number>, joinedBeforeYou: boolean): void {
        for (let userNumber of userNumbers) {
            let user = new User();
            user.id = userNumber;
            this.addUser(user);
            this.client.sendToUser(userNumber, WSRelayClient.CommandChannelHandler.encode('TELL_ME_ABOUT_YOU'));
        }
    }

    public userLeft(client: WSRelayClient.WebSocketRelayClient, userNumber: number): void {
        let user = $first(this.users, u => u.id == userNumber);
        this.removeUser(user);
    }

    public childRealmCreated(client: WSRelayClient.WebSocketRelayClient, realmNumber: number): void {
    }

    public childRealmDestroyed(client: WSRelayClient.WebSocketRelayClient, realmNumber: number): void {
    }

    public handleCommand(client: WSRelayClient.WebSocketRelayClient, senderUserNumber: number, target: WSRelayClient.MessageTarget, command: string, parameters: string[]): void {
        let user = $first(this.users, u => u.id == senderUserNumber);
        switch (command) {
            case 'TELL_ME_ABOUT_YOU':
                this.client.sendToUser(senderUserNumber, WSRelayClient.CommandChannelHandler.encode('NAME', this.me.name));
                this.client.sendToUser(senderUserNumber, WSRelayClient.CommandChannelHandler.encode('CHIPS', this.me.chips));
                break;

            case 'NAME':
                user.name = parameters[0];
                this.editUser(user);
                break;

            case 'CHIPS':
                user.chips = Number(parameters[0]);
                this.editUser(user);
                break;

            case 'FOLD':
                this.raiseEventMessage(user.name + ' folds.');
                user.folded = true;
                this.editUser(user);
                break;

            case 'CHECK':
                this.raiseEventMessage(user.name + ' checks (' + user.chipsBet + ').');
                break;

            case 'BET':
                let betAmount = Number(parameters[0]);
                user.bet(betAmount);
                this.potTextBox.value = (Number(this.potTextBox.value) + betAmount).toString();
                if (user == this.me) {
                    this.client.saveData('chips_' + this.me.name, this.me.chips.toString(), this.ttl);
                    this.client.saveData('pot', this.potTextBox.value, this.ttl);
                }
                this.editUser(user);
                this.raiseEventMessage(user.name + ' bet ' + betAmount + ' (' + user.chipsBet + ').');
                break;

            case 'CLAIM':
                let amount = Number(this.potTextBox.value);
                this.potTextBox.value = '0';
                user.chips += amount;
                user.chipsBet = 0;
                this.raiseEventMessage(user.name + ' claimed ' + amount + '.');
                if (user == this.me) {
                    this.client.saveData('chips_' + this.me.name, this.me.chips.toString(), this.ttl);
                    this.client.saveData('pot', '0', this.ttl);
                }
                this.editUser(user);
                break;

            case 'DEALER':
                let targetUser = $first(this.users, u => u.id == Number(parameters[0]));
                this.setDealer(targetUser);
                this.raiseEventMessage(user.name + ' claims ' + targetUser.name + ' is the dealer.');
                break;

            case 'SHUFFLE':
                this.clearBets();
                for (let user of this.users) {
                    user.folded = false;
                    this.editUser(user);
                }
                this.deck = new Deck();
                this.setCards(CardVisibility.private, [], false);
                this.setCards(CardVisibility.public, [], false);
                this.raiseShuffled();
                this.client.saveData('cards_' + this.me.name, '', this.ttl);
                if (user == this.me) {
                    this.client.saveData('community', '', this.ttl);
                }
                break;

            case 'YOUR_CARDS':
                this.raiseEventMessage(user.name + ' dealt you a hand:');
                this.setCards(CardVisibility.private, $select(parameters, (p) => Number(p)), false);
                this.showCards();
                this.client.saveData('cards_' + this.me.name, parameters.join(','), this.ttl);
                break;

            case 'FLOP_CARDS':
                this.clearBets();
                this.raiseEventMessage(user.name + ' dealt the flop:');
                this.setCards(CardVisibility.public, $select(parameters, (p) => Number(p)), false);
                this.showCards();
                if (this.me == user) {
                    this.client.saveData('community', this.communityCards.join(','), this.ttl);
                }
                break;

            case 'TURN_CARD':
                this.clearBets();
                this.raiseEventMessage(user.name + ' dealt the turn card:');
                this.setCards(CardVisibility.public, $select(parameters, (p) => Number(p)), true);
                this.showCards();
                if (this.me == user) {
                    this.client.saveData('community', this.communityCards.join(','), this.ttl);
                }
                break;

            case 'RIVER_CARD':
                this.clearBets();
                this.raiseEventMessage(user.name + ' dealt the river card:');
                this.setCards(CardVisibility.public, $select(parameters, (p) => Number(p)), true);
                this.showCards();
                if (this.me == user) {
                    this.client.saveData('community', this.communityCards.join(','), this.ttl);
                }
                break;

            case 'REVEAL':
                this.raiseEventMessage(user.name + ' revealed:');
                this.showRivalCards($select(parameters, (p) => Number(p)));
                break;

            default:
                alert('Unknown command: ' + command);
        }
    }

    public handleData(client: WSRelayClient.WebSocketRelayClient, realmNumber: number, name: string, data: string): void {
        let index = name.indexOf('_');
        let type = index == -1 ? name : name.substring(0, index);
        switch (type) {
            case 'chips':
                let user = $first(this.users, u => u.name == name.substring(index + 1));
                if (user == this.me) {
                    if (data == '') {
                        this.client.saveData('chips_' + this.me.name, this.me.chips.toString(), this.ttl);
                    } else {
                        user.chips = Number(data);
                    }
                    this.editUser(user);
                    this.client.sendToAllExceptMe(WSRelayClient.CommandChannelHandler.encode('CHIPS', this.me.chips.toString()));
                }
                break;

            case 'pot':
                this.potTextBox.value = data == '' ? '0' : data;
                break;

            case 'cards':
                if (data == '') {
                    this.raiseEventMessage('You don\'t have any cards.');
                } else {
                    this.setCards(CardVisibility.private, $select(data.split(','), c => Number(c)), false);
                }
                break;

            case 'community':
                if (data == '') {
                    this.raiseEventMessage('There are no community cards.');
                } else {
                    this.setCards(CardVisibility.public, $select(data.split(','), c => Number(c)), false);
                    this.showCards();
                }
                break;
        }
    }

    public raiseStatusMessage(text: string) {
        this.createMessageElement('status', text);
    }

    public raiseEventMessage(text: string) {
        this.createMessageElement('event', text);
    }

    public raiseShuffled() {
        while (this.chatDiv.firstChild) {
            this.chatDiv.removeChild(this.chatDiv.firstChild);
        }
        this.raiseEventMessage('Your deck has been shuffled.');
    }

    public setCards(visibility: CardVisibility, cardNumbers: number[], add: boolean) {
        if (visibility == CardVisibility.private) {
            if (!add) {
                this.myCards.length = 0;
            }
            for (let cardNumber of cardNumbers) {
                this.myCards.push(cardNumber);
            }
        } else {
            if (!add) {
                this.communityCards.length = 0;
            }
            for (let cardNumber of cardNumbers) {
                this.communityCards.push(cardNumber);
            }
        }
    }

    public showCards() {
        let cardsDiv = document.createElement('div');
        cardsDiv.className = "cards";
        for (let cardNumber of this.myCards) {
            let canvas = this.cardsImage.renderAsNewCanvas(cardNumber);
            canvas.className = "privateCard";
            cardsDiv.appendChild(canvas);
        }
        for (let cardNumber of this.communityCards) {
            let canvas = this.cardsImage.renderAsNewCanvas(cardNumber);
            canvas.className = "publicCard";
            cardsDiv.appendChild(canvas);
        }
        this.chatDiv.appendChild(cardsDiv);
        window.scrollTo(0, document.body.scrollHeight);
    }

    public showRivalCards(cardNumbers: number[]) {
        let cardsDiv = document.createElement('div');
        cardsDiv.className = "cards";
        for (let cardNumber of cardNumbers) {
            let canvas = this.cardsImage.renderAsNewCanvas(cardNumber);
            canvas.className = "privateCard";
            cardsDiv.appendChild(canvas);
        }
        this.chatDiv.appendChild(cardsDiv);
        window.scrollTo(0, document.body.scrollHeight);
    }

    private setupGameUI() {

        this.usersListBox = new $Select($new().select().id('usersListBox').multiple(true).element);
        this.usersListBox.element.addEventListener('dblclick', () => this.handleUsersListBoxDoubleClick(), false);
        this.root.appendChild(this.usersListBox.element);

        this.shuffleButton = $new().button().id('shuffleButton').text('Shuffle').onClick(() => this.handleShuffleButtonClick()).element;
        this.root.appendChild(this.shuffleButton);
        this.dealButton = $new().button().id('dealButton').text('Deal').onClick(() => this.handleDealButtonClick()).element;
        this.root.appendChild(this.dealButton);
        this.flopButton = $new().button().id('flopButton').text('Flop').onClick(() => this.handleFlopButtonClick()).element;
        this.root.appendChild(this.flopButton);
        this.turnButton = $new().button().id('turnButton').text('Turn').onClick(() => this.handleTurnButtonClick()).element;
        this.root.appendChild(this.turnButton);
        this.riverButton = $new().button().id('riverButton').text('River').onClick(() => this.handleRiverButtonClick()).element;
        this.root.appendChild(this.riverButton);
        this.revealButton = $new().button().id('revealButton').text('Reveal').onClick(() => this.handleRevealButtonClick()).element;
        this.root.appendChild(this.revealButton);

        this.betTextBox = $new().textBox().id('betTextBox').maxLength(5).placeholder('Amount').value('10').element;
        this.root.append(this.betTextBox);

        this.potTextBox = $new().textBox().id('potTextBox').element;
        this.potTextBox.readOnly = true;
        this.potTextBox.addEventListener('click', () => this.handlPotTextBoxClick(), false);
        this.root.append(this.potTextBox);

        this.foldButton = $new().button().id('foldButton').text('Fold').onClick(() => this.handleFoldButtonClick()).element;
        this.root.append(this.foldButton);

        this.checkButton = $new().button().id('checkButton').text('Check').onClick(() => this.handleCheckButtonClick()).element;
        this.root.append(this.checkButton);

        this.betButton = $new().button().id('betButton').text('Bet').onClick(() => this.handleBetButtonClick()).element;
        this.root.append(this.betButton);
    }

    private handleFoldButtonClick() {
        this.client.sendToAll('FOLD');
    }

    private handleCheckButtonClick() {
        this.client.sendToAll('CHECK');
    }

    private handleBetButtonClick() {
        let n = Number(this.betTextBox.value);
        if (!isNaN(n) && n != 0) {
            this.client.sendToAll(WSRelayClient.CommandChannelHandler.encode('BET', n.toString()));
        }
    }

    private handlPotTextBoxClick() {
        let n = Number(this.potTextBox.value);
        if (!isNaN(n) && n != 0) {
            this.client.sendToAll('CLAIM');
        }
    }

    private handleUsersListBoxDoubleClick() {
        let value = this.usersListBox.element.value;
        if (value != '') {
            this.client.sendToAll(WSRelayClient.CommandChannelHandler.encode('DEALER', value));
        }
    }

    private handleShuffleButtonClick() {
        this.client.sendToAll('SHUFFLE');
    }

    private handleDealButtonClick() {
        for (let user of this.users) {
            this.client.sendToUser(user.id, WSRelayClient.CommandChannelHandler.encode('YOUR_CARDS', this.deck.shift().toString(), this.deck.shift().toString()));
        }
    }

    private handleFlopButtonClick() {
        this.client.sendToAll(WSRelayClient.CommandChannelHandler.encode('FLOP_CARDS', this.deck.shift().toString(), this.deck.shift().toString(), this.deck.shift().toString()));
    }

    private handleTurnButtonClick() {
        this.client.sendToAll(WSRelayClient.CommandChannelHandler.encode('TURN_CARD', this.deck.shift().toString()));
    }

    private handleRiverButtonClick() {
        this.client.sendToAll(WSRelayClient.CommandChannelHandler.encode('RIVER_CARD', this.deck.shift().toString()));
    }

    private handleRevealButtonClick() {
        this.client.sendToAll(WSRelayClient.CommandChannelHandler.encode('REVEAL', this.myCards[0].toString(), this.myCards[1].toString()));
    }

    private createMessageElement(className: string, text: string) {
        let element = $new().paragraph().className(className).content(text).element;
        this.chatDiv.appendChild(element);
        window.scrollTo(0, document.body.scrollHeight);
        return element;
    }

    private clearBets() {
        for (let user of this.users) {
            user.chipsBet = 0;
        }
    }

    private addUser(user: User) {
        this.users.push(user);
        this.usersListBox.addItem(user.id.toString(), user.name + ' [' + user.chips.toString() + ']');
        this.usersListBox.sortByText();
    }

    private editUser(user: User) {
        this.usersListBox.setItem(user.id.toString(), user.name + ' [' + user.chips.toString() + ']');
        this.usersListBox.sortByText();
        for (let i = 0; i < this.usersListBox.element.options.length; i++) {
            let option = this.usersListBox.element.options[i];
            if (user.id.toString() == option.value) {
                option.style.fontWeight = 'normal';
                if (user == this.dealer) {
                    option.style.fontWeight = 'bold';
                }
                option.style.textDecoration = 'none';
                if (user.folded) {
                    option.style.textDecoration = 'line-through';
                }
            }
        }
    }

    private removeUser(user: User) {
        this.users.splice(this.users.indexOf(user), 1);
        this.usersListBox.removeItem(user.id.toString());
        this.usersListBox.sortByText();
    }

    private setDealer(user: User) {
        let oldDealer = this.dealer;
        this.dealer = user;
        if (oldDealer != null) {
            this.editUser(oldDealer);
        }
        this.editUser(this.dealer);
    }

}