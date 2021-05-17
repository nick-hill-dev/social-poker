module WSRelayLobby {

    export class InstancedRealm {

        public client: WSRelayClient.WebSocketRelayClient = null;

        public realm: RealmDetails = null;

        public me: User = null;

        public host: User = null;
        
        public sendToAll(command: string, ...parameters: string[]) {
            let message = this.getParts(command, ...parameters);
            this.client.sendToAll(message);
        }

        public sendToAllExceptMe(command: string, ...parameters: string[]) {
            let message = this.getParts(command, ...parameters);
            this.client.sendToAllExceptMe(message);
        }

        public sendToUser(user: User, command: string, ...parameters: string[]) {
            let message = this.getParts(command, ...parameters);
            this.client.sendToUser(user.number, message);
        }

        private getParts(command: string, ...parameters: string[]): string {
            let result: string[] = [];
            result.push(command);
            for (let parameter of parameters) {
                result.push(parameter);
            }
            return WSRelayClient.CommandChannelHandler.encode(...result);
        }

    }

}