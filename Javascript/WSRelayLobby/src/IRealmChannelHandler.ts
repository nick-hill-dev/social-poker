module WSRelayLobby {

    export interface IRealmChannelHandler {

        realmOffline(client: WSRelayClient.WebSocketRelayClient): void;

        realmUsersChanged(client: WSRelayClient.WebSocketRelayClient, joined: User[], left: User[]): void;

        realmMessage(client: WSRelayClient.WebSocketRelayClient, sender: User, target: WSRelayClient.MessageTarget, command: string, parameters: string[]): void;

        realmData(client: WSRelayClient.WebSocketRelayClient, name: string, data: string): void;

    }

}