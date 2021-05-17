module WSRelayClient {

    export abstract class CommandChannelHandler implements IChannelHandler {

        abstract channelStatus(client: WebSocketRelayClient, status: ChannelStatus): void;

        abstract assignUserNumber?(client: WebSocketRelayClient, userNumber: number): void;

        abstract assignRealmNumber?(client: WebSocketRelayClient, realmNumber: number): void;

        abstract usersJoined?(client: WebSocketRelayClient, userNumbers: Array<number>, joinedBeforeYou: boolean): void;

        abstract userLeft?(client: WebSocketRelayClient, userNumber: number): void;

        abstract childRealmCreated?(client: WebSocketRelayClient, realmNumber: number): void;

        abstract childRealmDestroyed?(client: WebSocketRelayClient, realmNumber: number): void;

        abstract handleCommand?(client: WebSocketRelayClient, senderUserNumber: number, target: MessageTarget, command: string, parameters: string[]): void;

        public handleMessage(client: WebSocketRelayClient, senderUserNumber: number, target: MessageTarget, message: string) {
            var parts = CommandChannelHandler.decode(message);
            if (this.handleCommand !== undefined) {
                this.handleCommand(client, senderUserNumber, target, parts[0], parts.slice(1));
            }
        }

        abstract handleData?(client: WebSocketRelayClient, realmNumber: number, name: string, data: string): void;

        public static encode(...parts: Object[]): string {
            var result = '';
            var first = true;
            for (var i in parts) {
                var part = parts[i].toString();
                var fixedPart = part.replace('\\', '\\\\').replace('"', '\"');
                if (part.indexOf(' ') != -1 || part == '') {
                    fixedPart = '"' + part + '"';
                }
                if (first) {
                    first = false;
                } else {
                    result += ' ';
                }
                result += fixedPart;
            }
            return result;
        }

        public static decode(line: string): string[] {

            // A blank line contains no data at all
            if (line === '') {
                return [];
            }

            // Initialise some variables for the DFA-based state machine
            var result = [];
            var lexerState = 0;
            var currentPart = null;

            // Process every character in the line
            for (var i = 0; i < line.length; i++) {
                switch (lexerState) {
                    case 0:
                        // Lexer state 0 is the normal state
                        if (line[i] == ' ') {
                            result.push(currentPart);
                            currentPart = null;
                        } else if (line[i] == '"') {
                            if (currentPart === null) currentPart = '';
                            lexerState = 1;
                        } else {
                            if (currentPart === null) currentPart = '';
                            currentPart += line[i];
                        }
                        break;
                    case 1:
                        // Lexer state 1 is the quote-enclosed string state
                        if (line[i] == '"') {
                            lexerState = 0;
                        } else {
                            currentPart += line[i];
                        }
                        break;
                }
            }

            // Return the parts (making sure to add the last part)
            result.push(currentPart);
            return result;
        }

    }

}