module WSRelayClient {

    export interface IChannelHandler {

        channelStatus(client: WebSocketRelayClient, status: ChannelStatus): void;

        assignUserNumber?(client: WebSocketRelayClient, userNumber: number): void;

        assignRealmNumber?(client: WebSocketRelayClient, realmNumber: number): void;

        usersJoined?(client: WebSocketRelayClient, userNumbers: Array<number>, joinedBeforeYou: boolean): void;

        userLeft?(client: WebSocketRelayClient, userNumber: number): void;

        childRealmCreated?(client: WebSocketRelayClient, realmNumber: number): void;

        childRealmDestroyed?(client: WebSocketRelayClient, realmNumber: number): void;

        handleMessage?(client: WebSocketRelayClient, senderUserNumber: number, target: MessageTarget, message: string): void;

        handleData?(client: WebSocketRelayClient, realmNumber: number, name: string, data: string): void;

    }

}