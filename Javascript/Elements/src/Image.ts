class $Image extends $Element<HTMLImageElement> {

    constructor(existing: HTMLImageElement = null) {
        super(existing != null ? existing : 'img');
    }

    public title(title: string): this {
        this.element.title = title;
        return this;
    }

    public source(fileName: string): this {
        this.element.src = fileName;
        return this;
    }

}