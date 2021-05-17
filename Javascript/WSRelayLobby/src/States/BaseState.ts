module WSRelayLobby {

    export abstract class BaseState {

        public constructor(protected readonly container: HTMLDivElement) {
            this.clearContainer();
        }

        protected getUser(users: User[], userNumber: number): User {
            for (let user of users) {
                if (user.number == userNumber) {
                    return user;
                }
            }
            return null;
        }

        protected clearContainer() {
            while (this.container.firstChild) {
                this.container.removeChild(this.container.firstChild);
            }
        }
        
        protected addHeading(text: string): HTMLHeadingElement {
            let element = document.createElement('h1');
            element.textContent = text;
            this.container.appendChild(element);
            return element;
        }

        protected addLabel(text: string): HTMLParagraphElement {
            let element = document.createElement('p');
            element.textContent = text;
            this.container.appendChild(element);
            return element;
        }

        protected addButton(text: string, onClick: () => void): HTMLButtonElement {
            let element = document.createElement('button');
            element.textContent = text;
            element.addEventListener('click', () => onClick(), false);
            this.container.appendChild(element);
            return element;
        }

        protected addTextBox(text: string): HTMLInputElement {
            let element = document.createElement('input');
            element.setAttribute('type', 'text');
            element.value = text;
            this.container.appendChild(element);
            return element;
        }

    }

}