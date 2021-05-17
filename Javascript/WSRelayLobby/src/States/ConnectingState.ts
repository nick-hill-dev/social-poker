/// <reference path="BaseState.ts" />

module WSRelayLobby {

    export class ConnectingState extends BaseState implements WSRelayClient.IChannelHandler {

        private client: WSRelayClient.WebSocketRelayClient = null;

        constructor(private readonly task: RealmSelectionTask) {
            super(task.container);

            this.addButton('Back', () => this.handleBackButtonClicked());

            this.addHeading(this.task.title);
            this.addLabel('Connecting to ' + task.serverName + '...');
            this.client = new WSRelayClient.WebSocketRelayClient(task.address, task.protocol, this);
        }

        public channelStatus(client: WSRelayClient.WebSocketRelayClient, status: WSRelayClient.ChannelStatus): void {
            if (status == WSRelayClient.ChannelStatus.online) {
                this.client.joinRealm(this.task.realmNumber, WSRelayClient.RealmType.realm);
            } else{
                new ServerOfflineState(this.task);
            }
        }

        public assignUserNumber(client: WSRelayClient.WebSocketRelayClient, userNumber: number): void {
        }

        public assignRealmNumber(client: WSRelayClient.WebSocketRelayClient, realmNumber: number): void {
            if (realmNumber == this.task.realmNumber) {
                new SelectRealmState(this.task, this.client);
            }
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

        private handleBackButtonClicked() {
            this.clearContainer();
            this.task.onCancelled();
        }

    }

}