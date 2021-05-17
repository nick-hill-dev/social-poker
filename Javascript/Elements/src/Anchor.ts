/// <reference path="Element.ts" />

class $Anchor extends $Element<HTMLAnchorElement> {

    constructor(existing: HTMLAnchorElement = null) {
        super(existing != null ? existing : 'a');
    }
    
    public href(href: string): this {
        this.element.href = href;
        return this;
    }

    public js(onclick: (e: MouseEvent) => void): this {
        this.element.addEventListener('click', onclick, false);
        this.element.href = 'javascript:void(0);';
        return this;
    }

    public content(text: string): this {
        this.element.textContent = text;
        return this;
    }

}