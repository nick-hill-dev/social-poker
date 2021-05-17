class $Label extends $Element<HTMLLabelElement> {

    constructor(existing: HTMLLabelElement = null) {
        super(existing != null ? existing : 'label');
    }

    public content(text: string): this {
        this.element.textContent = text;
        return this;
    }

}