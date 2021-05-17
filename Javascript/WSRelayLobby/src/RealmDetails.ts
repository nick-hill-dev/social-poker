module WSRelayLobby {

    export class RealmDetails {

        public creatorUserNumber: number = -1;

        public title: string = '...';

        public users: User[] = [];

        public constructor(public readonly realmNumber: number) {
        }

        public fromJson(data: string) {
            let json = JSON.parse(data);
            this.creatorUserNumber = Number(json.creatorUserNumber);
            this.title = String(json.title);
            this.users.length = 0;
            for (let userJson of json.users) {
                let user = new User();
                user.number = Number(userJson.number);
                user.name = String(userJson.name);
                user.host = Boolean(userJson.host);
                this.users.push(user);
            }
        }

        public toJson(): string {
            let json = {
                creatorUserNumber: this.creatorUserNumber,
                title: this.title,
                users: []
            };
            for (let user of this.users) {
                json.users.push({
                    number: user.number,
                    name: user.name,
                    host: user.host
                });
            }
            return JSON.stringify(json);
        }

        public saveOnServer(client: WSRelayClient.WebSocketRelayClient) {
            client.saveData('wsRelayLobby_realmDetails', this.toJson());
        }

    }

}