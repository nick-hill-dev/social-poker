module WSRelayLobby {

    export class CreatePrivateRealmState extends BaseState {

        private realmNameTextBox: HTMLInputElement = null;

        constructor(
            private readonly task: RealmSelectionTask,
            private readonly client: WSRelayClient.WebSocketRelayClient,
            private readonly userName: string
        ) {
            super(task.container);
            client.handler = this;

            this.addButton('Back', () => this.handleBackButtonClicked());

            this.addHeading(this.task.title);
            this.addLabel(this.task.terms.realm + ' Name:');
            this.realmNameTextBox = this.addTextBox(task.getRealmName());
            this.addButton('Create', () => this.handleCreateButtonClicked());
        }

        public channelStatus(client: WSRelayClient.WebSocketRelayClient, status: WSRelayClient.ChannelStatus): void {
            if (status == WSRelayClient.ChannelStatus.offline) {
                new ServerOfflineState(this.task);
            }
        }

        public assignUserNumber(client: WSRelayClient.WebSocketRelayClient, userNumber: number): void {
        }

        public assignRealmNumber(client: WSRelayClient.WebSocketRelayClient, realmNumber: number): void {

            this.task.setRealmName(this.realmNameTextBox.value);
            
            let realm = new RealmSummary(realmNumber);
            realm.creatorUserNumber = this.client.userNumber;
            realm.title = this.realmNameTextBox.value;
            realm.saveOnServer(client);

            new PrivateRealmState(this.task, this.client, realm, this.userName);
        }

        public usersJoined(client: WSRelayClient.WebSocketRelayClient, userNumbers: number[], joinedBeforeYou: boolean): void {
        }

        public userLeft(client: WSRelayClient.WebSocketRelayClient, userNumber: number): void {
        }

        public childRealmCreated(client: WSRelayClient.WebSocketRelayClient, realmNumber: number): void {
        }

        public childRealmDestroyed(client: WSRelayClient.WebSocketRelayClient, realmNumber: number): void {
        }

        public handleMessage(client: WSRelayClient.WebSocketRelayClient, senderUserNumber: number, target: WSRelayClient.MessageTarget, message: string): void {
        }

        public handleData(client: WSRelayClient.WebSocketRelayClient, realmNumber: number, name: string, data: string): void {
        }

        private handleCreateButtonClicked() {
            this.client.createRealm(WSRelayClient.RealmType.childRealm);
        }

        private handleBackButtonClicked() {
            this.client.disconnect(); // When we reconnect, we'll get the latest information
            new ConnectingState(this.task);
        }

    }

}