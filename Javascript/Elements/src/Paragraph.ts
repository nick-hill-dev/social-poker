class $Span extends $Container<HTMLSpanElement> {

    constructor(existing: HTMLSpanElement = null) {
        super(existing != null ? existing : 'span');
    }

    public content(text: string): this {
        this.element.textContent = text;
        return this;
    }

}