module WSRelayLobby {

    export class RealmSummary {

        public creatorUserNumber: number = -1;

        public title: string = '...';

        public userCount: number = 0;

        public running: boolean = false;

        public constructor(public readonly realmNumber: number) {
        }

        public fromJson(data: string) {
            let json = JSON.parse(data);
            this.creatorUserNumber = Number(json.creatorUserNumber);
            this.title = String(json.title);
            this.userCount = Number(json.userCount);
            this.running = Boolean(json.running);
        }

        public toJson(): string {
            let json = {
                creatorUserNumber: this.creatorUserNumber,
                title: this.title,
                userCount: this.userCount,
                running: this.running
            };
            return JSON.stringify(json);
        }

        public toRealmDetails(): RealmDetails {
            let result = new RealmDetails(this.realmNumber);
            result.creatorUserNumber = this.creatorUserNumber;
            result.title = this.title;
            return result;
        }

        public saveOnServer(client: WSRelayClient.WebSocketRelayClient) {
            client.saveData('wsRelayLobby_realmSummary', this.toJson());
        }

    }

}