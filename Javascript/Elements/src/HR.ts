class $Paragraph extends $Container<HTMLParagraphElement> {

    constructor(existing: HTMLParagraphElement = null) {
        super(existing != null ? existing : 'p');
    }

    public content(text: string): this {
        this.element.textContent = text;
        return this;
    }

}