module WSRelayLobby {

    export class CompletedState extends BaseState implements WSRelayClient.IChannelHandler {

        private ongoingHandler: IRealmChannelHandler = null;

        private instance: InstancedRealm = null;

        private pendingUsers: User[] = [];
 
        private previouslySentUserCount: number = -1;

        constructor(
            private readonly task: RealmSelectionTask,
            private readonly client: WSRelayClient.WebSocketRelayClient,
            private readonly realmSummary: RealmSummary,
            private readonly realmDetails: RealmDetails
        ) {
            super(task.container);

            this.instance = new InstancedRealm();
            this.instance.client = client;
            this.instance.realm = realmDetails;
            for (let user of this.instance.realm.users) {
                if (user.number == client.userNumber) {
                    this.instance.me = user;
                }
                if (user.number == realmDetails.creatorUserNumber) {
                    this.instance.host = user;
                }
            }

            this.ongoingHandler = task.onCompleted(this.instance);
            if (this.ongoingHandler != null) {
                client.handler = this;
            } else {
                client.handler = null;
            }
        }

        public channelStatus(client: WSRelayClient.WebSocketRelayClient, status: WSRelayClient.ChannelStatus): void {
            if (status == WSRelayClient.ChannelStatus.offline) {
                this.ongoingHandler.realmOffline(client);
                this.client.handler = null;
            }
        }

        public assignUserNumber(client: WSRelayClient.WebSocketRelayClient, userNumber: number): void {
            // Not expecting this to be fired
        }

        public assignRealmNumber(client: WSRelayClient.WebSocketRelayClient, realmNumber: number): void {
            this.ongoingHandler.realmOffline(client);
            this.client.handler = null;
        }

        public usersJoined(client: WSRelayClient.WebSocketRelayClient, userNumbers: number[], joinedBeforeYou: boolean): void {
            for (let userNumber of userNumbers) {
                let user = new User();
                user.number = userNumber;
                user.name = 'Unnamed ' + this.task.terms.user;
                user.status = UserStatus.notReady;
                this.pendingUsers.push(user);
                client.sendToUser(userNumber, 'wsRelayLobby_GET_USER_DETAILS');
            }
        }

        public userLeft(client: WSRelayClient.WebSocketRelayClient, userNumber: number): void {

            let pendingUser = this.getUser(this.pendingUsers, userNumber);
            if (pendingUser != null) {
                this.pendingUsers.splice(this.pendingUsers.indexOf(pendingUser, 1));
                return;
            }

            let user = this.getUser(this.instance.realm.users, userNumber);
            if (user != null) {
                let index = this.instance.realm.users.indexOf(user);
                this.instance.realm.users.splice(index, 1);
                this.advertiseChangeToUsersList();
                this.ongoingHandler.realmUsersChanged(client, [], [user]);
            }

        }

        public childRealmCreated(client: WSRelayClient.WebSocketRelayClient, realmNumber: number): void {
            // Not expecting this to be fired
        }

        public childRealmDestroyed(client: WSRelayClient.WebSocketRelayClient, realmNumber: number): void {
            // Not expecting this to be fired
        }

        public handleMessage(client: WSRelayClient.WebSocketRelayClient, senderUserNumber: number, target: WSRelayClient.MessageTarget, message: string) {
            var parts = WSRelayClient.CommandChannelHandler.decode(message);
            let command = parts[0];
            let parameters = parts.slice(1);
            switch (command) {
                case 'wsRelayLobby_GET_USER_DETAILS':
                    let packet = WSRelayClient.CommandChannelHandler.encode('wsRelayLobby_MY_USER_DETAILS', this.instance.me.name, 'READY');
                    client.sendToUser(senderUserNumber, packet);
                    break;

                case 'wsRelayLobby_MY_USER_DETAILS':
                    let senderUser = this.getUser(this.pendingUsers, senderUserNumber);
                    senderUser.name = parameters[0];
                    senderUser.status = UserStatus.ready;
                    this.pendingUsers.splice(this.pendingUsers.indexOf(senderUser, 1));
                    this.instance.realm.users.push(senderUser);
                    this.advertiseChangeToUsersList();
                    this.ongoingHandler.realmUsersChanged(client, [senderUser], []);
                    break;

                default:
                    let sender = this.getUser(this.instance.realm.users, senderUserNumber);
                    this.ongoingHandler.realmMessage(client, sender, target, command, parameters);
            }
        }

        public handleData(client: WSRelayClient.WebSocketRelayClient, realmNumber: number, name: string, data: string): void {
            this.ongoingHandler.realmData(client, name, data);
        }

        // TODO: This is an almost exact duplicate

        private advertiseChangeToUsersList() {
            this.realmSummary.userCount = this.realmDetails.users.length;
            if (this.instance.me.host) {
                this.realmSummary.saveOnServer(this.client);
                this.realmDetails.saveOnServer(this.client);
                if (this.previouslySentUserCount != this.realmSummary.userCount) {
                    let packet = WSRelayClient.CommandChannelHandler.encode('wsRelayLobby_USER_COUNT', this.realmSummary.realmNumber, this.realmSummary.userCount);
                    this.client.sendToRealm(this.task.realmNumber, packet);
                    this.previouslySentUserCount = this.realmSummary.userCount;
                }
            }
        }

    }

}