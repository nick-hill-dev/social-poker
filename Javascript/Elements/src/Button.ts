/// <reference path="Element.ts" />

class $Button extends $Element<HTMLButtonElement> {

    constructor(existing: HTMLButtonElement = null) {
        super(existing != null ? existing : 'button');
    }

    public text(text: string): this {
        this.element.textContent = text;
        return this;
    }

    public lines(lines: string[]): this {
        for (let i = 0; i < lines.length; i++) {
            let span = document.createElement('span');
            span.innerText = lines[i];
            this.element.appendChild(span);
            if (i < lines.length - 1) {
                this.element.appendChild(document.createElement('br'));
            }
        }
        return this;
    }

    public onClick(handler: (e: MouseEvent) => void): this {
        this.element.addEventListener('click', handler, false);
        return this;
    }

}