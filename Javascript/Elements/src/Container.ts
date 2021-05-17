/// <reference path="Element.ts" />

class $Container<T extends HTMLElement> extends $Element<T> {

    constructor(what: string | T) {
        super(what);
    }

    public append(element: HTMLElement | $Node): this {
        if (element['$isWrapper'] !== undefined) {
            this.element.appendChild((<$Node>element).node);
        } else {
            this.element.appendChild(<HTMLElement>element);
        }
        return this;
    }

    public elements(elements: HTMLElement[] | $Node[]): this {
        for (let element of elements) {
            if (element['$isWrapper'] !== undefined) {
                this.element.appendChild((<$Node>element).node);
            } else {
                this.element.appendChild(<HTMLElement>element);
            }
        }
        return this;
    }

    public onClick(handler: (e: MouseEvent) => void): $Container<T> {
        this.element.addEventListener('click', handler, false);
        return this;
    }

}