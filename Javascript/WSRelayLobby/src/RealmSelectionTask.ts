module WSRelayLobby {

    export class RealmSelectionTask {

        public title: string = "Realm Selection";

        public serverName: string = "Realm Server";

        public address: string = "ws://127.0.0.1:8000/relay";

        public protocol: string = "relay";

        public realmNumber: number = 1;

        public startMode: RealmStartMode = RealmStartMode.whenAllIndicateReady;

        public realmVisibility: RealmVisibility = RealmVisibility.setupOnly;
        
        public terms: { realm: string, realms: string, user: string, users: string, join: string, go: string } = { realm: 'Realm', realms: 'Realms', user: 'User', users: 'Users', join: 'Join', go: 'Go' };

        public onCompleted: (realm: InstancedRealm) => IRealmChannelHandler = null;

        public onCancelled: () => void = null;

        private started: boolean = false;

        public constructor(public readonly container: HTMLDivElement) {
        }

        public getUserName(): string {
            let result = localStorage.getItem('wsRelayLobby-userName');
            return result === null ? this.terms.user : result;
        }

        public setUserName(userName: string) {
            localStorage.setItem('wsRelayLobby-userName', userName);
        }

        public getRealmName(): string {
            let result = localStorage.getItem('wsRelayLobby-realmName');
            return result === null ? 'My ' + this.terms.realm : result;
        }

        public setRealmName(realmName: string) {
            localStorage.setItem('wsRelayLobby-realmName', realmName);
        }

        public start() {
            if (this.started) {
                throw 'Realm selection task has already been started.';
            }
            this.started = true;
            new ConnectingState(this);
        }

    }

}