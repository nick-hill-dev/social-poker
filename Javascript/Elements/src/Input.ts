class $Input extends $Element<HTMLInputElement> {

    constructor(existing: HTMLInputElement = null, type: string = null) {
        super(existing != null ? existing : 'input');
        if (type != null) {
            this.element.type = type;
        }
    }
   
    public name(name: string): this {
        this.element.name = name;
        return this;
    }

    public getValue(): string {
        return this.element.value;
    }

    public value(value: string): this {
        this.element.value = value;
        return this;
    }

    public placeholder(placeholder: string): this {
        this.element.placeholder = placeholder;
        return this;
    }
    
    public maxLength(maxLength: number): this {
        this.element.maxLength = maxLength;
        return this;
    }

}