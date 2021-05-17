module WSRelayLobby {

    export class LoggingRealmChannelHandler implements IRealmChannelHandler {

        public realmOffline(client: WSRelayClient.WebSocketRelayClient): void {
            console.log('Realm is offline.');
        }

        public realmUsersChanged(client: WSRelayClient.WebSocketRelayClient, joined: User[], left: User[]): void {
            for (let user of joined) {
                console.log('User joined: ' + user.name);
            }
            for (let user of left) {
                console.log('User left: ' + user.name);
            }
        }

        public realmMessage(client: WSRelayClient.WebSocketRelayClient, sender: User, target: WSRelayClient.MessageTarget, command: string, parameters: string[]): void {
            console.log('[' + sender.name + ']: ' + command + ' (' + parameters.join(', ') + ')');
        }

        public realmData(client: WSRelayClient.WebSocketRelayClient, name: string, data: string): void {
            console.log('Data: ' + name + ' = ' + data);

        }

    }

}