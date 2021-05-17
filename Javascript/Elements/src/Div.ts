class $Div extends $Container<HTMLDivElement> {

    constructor(existing: HTMLDivElement = null) {
        super(existing != null ? existing : 'div');
    }

    public clear(): this {
        while (this.element.firstChild) {
            this.element.removeChild(this.element.firstChild);
        }
        return this;
    }

    public hide(): this {
        if (this.element.style.display != 'none') {
            this.element['$oldDisplay'] = this.element.style.display;
            this.element.style.display = 'none';
        }
        return this;
    }

    public show(): this {
        if (this.element.style.display == 'none') {
            let oldDisplay = this.element['$oldDisplay'];
            if (oldDisplay !== undefined) {
                this.element.style.display = oldDisplay;
                delete this.element['$oldDisplay'];
            } else {
                this.element.style.display = 'inline';
            }
        }
        return this;
    }

}