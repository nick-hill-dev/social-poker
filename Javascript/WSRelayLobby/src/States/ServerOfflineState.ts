module WSRelayLobby {

    export class ServerOfflineState extends BaseState {

        constructor(private readonly task: RealmSelectionTask) {
            super(task.container);

            this.addButton('Back', () => this.handleBackButtonClicked());

            this.addHeading(this.task.title);
            this.addLabel('Server: Offline');
            this.addLabel(this.task.serverName + ' is offline.');
            this.addLabel('The server has likely gone down for maintenance.');
            this.addLabel('Please try again later.');
            this.addButton('Reconnect', () => this.handleReconnectButtonClicked());
        }

        private handleReconnectButtonClicked() {
            new ConnectingState(this.task);
        }

        private handleBackButtonClicked() {
            this.clearContainer();
            this.task.onCancelled();
        }

    }

}