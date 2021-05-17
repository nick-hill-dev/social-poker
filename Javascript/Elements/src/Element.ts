/// <reference path="Node.ts" />

class $Element<T extends HTMLElement> extends $Node {

    public element: T = null;

    constructor(what: string | T) {
        super(typeof what === 'string' ? <T>document.createElement(<string>what) : <T>what);
        this.element = <T>this.node;
    }

    public id(id: string): this {
        this.element.id = id;
        return this;
    }

    public className(className: string): this {
        this.element.className = className;
        return this;
    }

    public style(f: (style: CSSStyleDeclaration) => void): this {
        f(this.element.style);
        return this;
    }

    public parent(container: HTMLElement | $Node): this {
        if (container['$isWrapper'] !== undefined) {
            (<$Node>container).node.appendChild(this.element);
        } else {
            (<HTMLElement>container).appendChild(this.element);
        }
        return this;
    }

    public then(f: (element: this) => void): this {
        f(this);
        return this;
    }

    public thenCustom(f: (element: T) => void): this {
        f(this.element);
        return this;
    }

}