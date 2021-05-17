module WSRelayLobby {

    export class PrivateRealmState extends BaseState {

        private usersDiv: HTMLDivElement = null;

        private realmDetails: RealmDetails = null;

        private hostedByMe: boolean = false;

        private previouslySentUserCount: number = -1;

        constructor(
            private readonly task: RealmSelectionTask,
            private readonly client: WSRelayClient.WebSocketRelayClient,
            private readonly realmSummary: RealmSummary,
            private readonly userName: string
        ) {
            super(task.container);
            client.handler = this;

            this.realmDetails = realmSummary.toRealmDetails();

            this.addButton('Back', () => this.handleBackButtonClicked());

            this.addHeading(realmSummary.title);

            this.usersDiv = document.createElement('div');
            this.usersDiv.className = 'wsRelayLobby-users';
            task.container.appendChild(this.usersDiv);
            this.updateUsersList();

            this.hostedByMe = client.userNumber == realmSummary.creatorUserNumber;

            if (task.startMode == RealmStartMode.whenHostConfirms && this.hostedByMe) {
                this.addButton(task.terms.go, () => this.handleGoButtonClicked());
            }

            if (this.hostedByMe) {
                this.addMe();
            } else {
                this.client.joinRealm(realmSummary.realmNumber, WSRelayClient.RealmType.realm);
            }
        }

        public channelStatus(client: WSRelayClient.WebSocketRelayClient, status: WSRelayClient.ChannelStatus): void {
            if (status == WSRelayClient.ChannelStatus.offline) {
                new ServerOfflineState(this.task);
            }
        }

        public assignUserNumber(client: WSRelayClient.WebSocketRelayClient, userNumber: number): void {
        }

        public assignRealmNumber(client: WSRelayClient.WebSocketRelayClient, realmNumber: number): void {
            if (realmNumber == this.task.realmNumber) {
                new SelectRealmState(this.task, this.client);
            } else {
                this.addMe();
            }
        }

        public usersJoined(client: WSRelayClient.WebSocketRelayClient, userNumbers: number[], joinedBeforeYou: boolean): void {

            let realmAlreadyRunning = joinedBeforeYou && this.realmSummary.running;
            if (realmAlreadyRunning) {
                client.loadData('wsRelayLobby_realmDetails');
                return;
            }

            for (let userNumber of userNumbers) {
                let user = new User();
                user.number = userNumber;
                user.name = 'Unnamed ' + this.task.terms.user;
                this.realmDetails.users.push(user);
                client.sendToUser(userNumber, 'wsRelayLobby_GET_USER_DETAILS');
            }

            this.advertiseChangeToUsersList();
            this.updateUsersList();
        }

        public userLeft(client: WSRelayClient.WebSocketRelayClient, userNumber: number): void {

            let user = this.getUser(this.realmDetails.users, userNumber);
            this.realmDetails.users.splice(this.realmDetails.users.indexOf(user), 1);

            this.advertiseChangeToUsersList();
            this.updateUsersList();

            let hostHasLeft = userNumber == this.realmSummary.creatorUserNumber;
            if (hostHasLeft) {
                this.client.joinRealm(this.task.realmNumber, WSRelayClient.RealmType.realm);
            }
        }

        public childRealmCreated(client: WSRelayClient.WebSocketRelayClient, realmNumber: number): void {
        }

        public childRealmDestroyed(client: WSRelayClient.WebSocketRelayClient, realmNumber: number): void {
        }

        public handleMessage(client: WSRelayClient.WebSocketRelayClient, senderUserNumber: number, target: WSRelayClient.MessageTarget, message: string): void {
            let parts = WSRelayClient.CommandChannelHandler.decode(message);
            let command = parts[0];
            let senderUser = this.getUser(this.realmDetails.users, senderUserNumber);
            switch (command) {
                case 'wsRelayLobby_GET_USER_DETAILS':
                    let myUser = this.getUser(this.realmDetails.users, client.userNumber);
                    client.sendToUser(senderUserNumber, WSRelayClient.CommandChannelHandler.encode('wsRelayLobby_MY_USER_DETAILS', myUser.name, myUser.status == UserStatus.ready ? 'READY' : 'NOT_READY'));
                    break;

                case 'wsRelayLobby_MY_USER_DETAILS':
                    senderUser.name = parts[1];
                    senderUser.status = parts[2] == 'READY' ? UserStatus.ready : UserStatus.notReady;
                    this.advertiseChangeToUsersList();
                    this.updateUsersList();
                    break;

                case 'wsRelayLobby_READY':
                    this.getUser(this.realmDetails.users, Number(parts[1])).status = UserStatus.ready;
                    this.updateUsersList();
                    this.checkAllReady();
                    break;

                case 'wsRelayLobby_NOT_READY':
                    this.getUser(this.realmDetails.users, Number(parts[1])).status = UserStatus.notReady;
                    this.updateUsersList();
                    break;

                case 'wsRelayLobby_STARTING':
                    new CompletedState(this.task, this.client, this.realmSummary, this.realmDetails);
                    break;
            }
        }

        public handleData(client: WSRelayClient.WebSocketRelayClient, realmNumber: number, name: string, data: string): void {
            if (name == 'wsRelayLobby_realmDetails') {

                this.realmDetails = new RealmDetails(client.realmNumber);
                this.realmDetails.fromJson(data);
                
                var me = new User();
                me.number = client.userNumber;
                me.name = this.userName;
                me.status = UserStatus.ready;
                this.realmDetails.users.push(me);

                this.realmSummary.userCount = this.realmDetails.users.length;

                new CompletedState(this.task, this.client, this.realmSummary, this.realmDetails);
            }
        }

        private handleBackButtonClicked() {
            this.client.joinRealm(this.task.realmNumber, WSRelayClient.RealmType.realm);
        }

        private handleReadyButtonClicked() {
            let me = this.getUser(this.realmDetails.users, this.client.userNumber);
            if (me.status == UserStatus.notReady) {
                me.status = UserStatus.ready;
                this.client.sendToAllExceptMe(WSRelayClient.CommandChannelHandler.encode('wsRelayLobby_READY', this.client.userNumber));
            } else {
                me.status = UserStatus.notReady;
                this.client.sendToAllExceptMe(WSRelayClient.CommandChannelHandler.encode('wsRelayLobby_NOT_READY', this.client.userNumber));
            }
            this.updateUsersList();
            this.checkAllReady();
        }

        private handleGoButtonClicked() {
            this.checkGo();
        }

        private addMe() {
            var user = new User();
            user.number = this.client.userNumber;
            user.name = this.userName;
            user.host = this.hostedByMe;
            this.realmDetails.users.push(user);
            
            this.advertiseChangeToUsersList();
            this.updateUsersList();
        }

        private updateUsersList() {

            // Clear div
            while (this.usersDiv.firstChild) {
                this.usersDiv.removeChild(this.usersDiv.firstChild);
            }

            // Are there any users?
            if (this.realmDetails.users.length == 0) {
                let noneLabel = document.createElement('p');
                noneLabel.textContent = 'There are currently no ' + this.task.terms.users.toLowerCase() + '.';
                this.usersDiv.appendChild(noneLabel);
                return;
            }

            // Show users
            let table = document.createElement('table');
            this.usersDiv.appendChild(table);
            for (let user of this.realmDetails.users) {

                let row = document.createElement('tr');
                row.className = 'wsRelayLobby-user';
                table.appendChild(row);

                let nameCell = document.createElement('td');
                nameCell.className = 'wsRelayLobby-userName';
                nameCell.textContent = user.name;
                row.appendChild(nameCell);

                if (this.task.startMode != RealmStartMode.whenAllIndicateReady) {
                    continue;
                }

                let statusText = user.status == UserStatus.notReady ? 'Not Ready' : 'Ready';
                let readyCell = document.createElement('td');
                readyCell.className = 'wsRelayLobby-userStatus';
                readyCell.textContent = statusText;
                row.appendChild(readyCell);

                let actionsCell = document.createElement('td');
                row.appendChild(actionsCell);
                if (user.number == this.client.userNumber) {
                    let buttonText = user.status == UserStatus.notReady ? 'Ready' : 'Not Ready';
                    let readyButton = document.createElement('button');
                    readyButton.textContent = buttonText;
                    readyButton.addEventListener('click', () => this.handleReadyButtonClicked(), false);
                    actionsCell.appendChild(readyButton);
                }
            }
        }

        private checkAllReady() {
            if (!this.hostedByMe) {
                return;
            }
            let userCount = 0;
            for (let user of this.realmDetails.users) {
                userCount++;
                if (user.status != UserStatus.ready) {
                    return;
                }
            }
            if (userCount == 1) {
                return;
            }
            this.checkGo();
        }

        private advertiseChangeToUsersList() {
            this.realmSummary.userCount = this.realmDetails.users.length;
            if (this.hostedByMe) {
                this.realmSummary.saveOnServer(this.client);
                this.realmDetails.saveOnServer(this.client);
                if (this.previouslySentUserCount != this.realmSummary.userCount) {
                    let packet = WSRelayClient.CommandChannelHandler.encode('wsRelayLobby_USER_COUNT', this.realmSummary.realmNumber, this.realmSummary.userCount);
                    this.client.sendToRealm(this.task.realmNumber, packet);
                    this.previouslySentUserCount = this.realmSummary.userCount;
                }
            }
        }

        private checkGo() {
            this.advertiseChangeToUsersList();
            if (this.hostedByMe) {
                this.realmSummary.running = true;
                this.realmSummary.saveOnServer(this.client);
                this.client.sendToRealm(this.task.realmNumber, WSRelayClient.CommandChannelHandler.encode('wsRelayLobby_STARTING', this.realmSummary.realmNumber));
                this.client.sendToAll('wsRelayLobby_STARTING');
            }
        }

    }

}