module WSRelayLobby {

    export class User {

        public number: number = 0;

        public name: string = '';

        public status: UserStatus = UserStatus.notReady;

        public host: boolean = false;

    }

}