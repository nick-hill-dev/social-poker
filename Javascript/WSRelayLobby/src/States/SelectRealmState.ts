module WSRelayLobby {

    export class SelectRealmState extends BaseState implements WSRelayClient.IChannelHandler {

        private serverStatusLabel: HTMLParagraphElement = null;

        private userNameTextBox: HTMLInputElement = null;

        private realmsDiv: HTMLDivElement = null;

        private realms: RealmSummary[] = [];

        private lobbyUserCount: number = 1;

        constructor(private readonly task: RealmSelectionTask, private readonly client: WSRelayClient.WebSocketRelayClient) {
            super(task.container);
            client.handler = this;

            this.addButton('Back', () => this.handleBackButtonClicked());

            this.addHeading(task.title);
            this.serverStatusLabel = this.addLabel('Server: ...');
            this.updateServerStatusLabel();

            this.addLabel(task.terms.user + ' Name:');
            this.userNameTextBox = this.addTextBox(task.getUserName());
            
            this.realmsDiv = document.createElement('div');
            this.realmsDiv.className = 'wsRelayLobby-realms';
            this.container.appendChild(this.realmsDiv);
            this.updateRealmList();

            this.addButton('Host a new ' + task.terms.realm.toLowerCase(), () => this.handleHostButtonClicked());
        }

        public channelStatus(client: WSRelayClient.WebSocketRelayClient, status: WSRelayClient.ChannelStatus): void {
            if (status == WSRelayClient.ChannelStatus.offline) {
                new ServerOfflineState(this.task);
            }
        }

        public assignUserNumber(client: WSRelayClient.WebSocketRelayClient, userNumber: number): void {
        }

        public assignRealmNumber(client: WSRelayClient.WebSocketRelayClient, realmNumber: number): void {
        }

        public usersJoined(client: WSRelayClient.WebSocketRelayClient, userNumbers: number[], joinedBeforeYou: boolean): void {
            this.lobbyUserCount += userNumbers.length;
            this.updateServerStatusLabel();
        }

        public userLeft(client: WSRelayClient.WebSocketRelayClient, userNumber: number): void {
            this.lobbyUserCount--;
            this.updateServerStatusLabel();
        }

        public childRealmCreated(client: WSRelayClient.WebSocketRelayClient, realmNumber: number): void {
            setTimeout(() => {
                client.loadData('wsRelayLobby_realmSummary', realmNumber);
            }, 50);
        }

        public childRealmDestroyed(client: WSRelayClient.WebSocketRelayClient, realmNumber: number): void {
            this.removeRealm(realmNumber);
        }

        public handleMessage(client: WSRelayClient.WebSocketRelayClient, senderUserNumber: number, target: WSRelayClient.MessageTarget, message: string): void {
            let parts = WSRelayClient.CommandChannelHandler.decode(message);
            let command = parts[0];
            let realmNumber = Number(parts[1]);
            let realm = this.getRealm(realmNumber);
            switch (command) {
                case 'wsRelayLobby_USER_COUNT':
                    if (realm != null) {
                        realm.userCount = Number(parts[2]);
                        this.updateRealmList();
                    }
                    break;

                case 'wsRelayLobby_STARTING':
                    if (realm != null) {
                        realm.running = true;
                        if (this.task.realmVisibility == RealmVisibility.setupOnly) {
                            this.removeRealm(realmNumber);
                        } else {
                            this.updateRealmList();
                        }
                    }
                    break;
            }
        }

        public handleData(client: WSRelayClient.WebSocketRelayClient, realmNumber: number, name: string, data: string): void {
            if (name == 'wsRelayLobby_realmSummary' && data != '') {
                let realm = new RealmSummary(realmNumber);
                realm.fromJson(data);
                if (this.task.realmVisibility == RealmVisibility.always || !realm.running) {
                    this.realms.push(realm);
                    this.updateRealmList();
                }
            }
        }

        private handleBackButtonClicked() {
            this.clearContainer();
            this.task.onCancelled();
        }

        private handleHostButtonClicked() {
            this.task.setUserName(this.userNameTextBox.value);
            new CreatePrivateRealmState(this.task, this.client, this.userNameTextBox.value);
        }

        private handleJoinButtonClicked(realm: RealmSummary) {
            this.task.setUserName(this.userNameTextBox.value);
            new PrivateRealmState(this.task, this.client, realm, this.userNameTextBox.value);
        }

        private updateServerStatusLabel() {
            let text = 'Server: Online';
            text += ' (' + this.lobbyUserCount + ' ' + this.task.terms.user.toLowerCase() + (this.lobbyUserCount == 1 ? '' : 's') + ' present)';
            this.serverStatusLabel.textContent = text;
        }

        public updateRealmList() {

            // Clear div
            while (this.realmsDiv.firstChild) {
                this.realmsDiv.removeChild(this.realmsDiv.firstChild);
            }

            // Are there any realms?
            if (this.realms.length == 0) {
                let noneLabel = document.createElement('p');
                noneLabel.textContent = 'There are currently no ' + this.task.terms.realms.toLowerCase() + ' available.';
                this.realmsDiv.appendChild(noneLabel);
                return;
            }

            // Show available realms
            let table = document.createElement('table');
            this.realmsDiv.appendChild(table);
            for (let realm of this.realms) {

                let row = document.createElement('tr');
                row.className = 'wsRelayLobby-realm';
                table.appendChild(row);

                let nameCell = document.createElement('td');
                nameCell.className = 'wsRelayLobby-realmName';
                nameCell.textContent = realm.title;
                row.appendChild(nameCell);

                let statusCell = document.createElement('td');
                statusCell.className = 'wsRelayLobby-realmStatus';
                statusCell.textContent = realm.running ? 'Running' : 'Setup';
                row.appendChild(statusCell);

                let countCell = document.createElement('td');
                countCell.className = 'wsRelayLobby-realmCount';
                countCell.textContent = realm.userCount + ' ' + (realm.userCount == 1 ? this.task.terms.user : this.task.terms.users);
                row.appendChild(countCell);

                let actionsCell = document.createElement('td');
                row.appendChild(actionsCell);
                var button = document.createElement('button');
                button.textContent = this.task.terms.join;
                button.addEventListener('click', () => this.handleJoinButtonClicked(realm), false);
                actionsCell.appendChild(button);
            }
        }

        private getRealm(realmNumber: number): RealmSummary {
            let realm = null;
            for (let possibleRealm of this.realms) {
                if (possibleRealm.realmNumber == realmNumber) {
                    realm = possibleRealm;
                }
            }
            return realm;
        }

        private removeRealm(realmNumber: number) {
            let realm = this.getRealm(realmNumber);
            if (realm !== null) {
                this.realms.splice(this.realms.indexOf(realm), 1);
                this.updateRealmList();
            }
        }

    }

}