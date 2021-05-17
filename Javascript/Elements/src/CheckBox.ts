/// <reference path="Container.ts" />

class $CheckBox extends $Container<HTMLDivElement> {

    public checkBoxElement: HTMLElement = null;

    public labelElement: HTMLLabelElement = null;

    constructor() {
        super('div');
        this.checkBoxElement = $new().input('checkbox').element;
        this.labelElement = $new().label().element;
        this.append(this.checkBoxElement);
        this.append(this.labelElement);
    }

    public containerID(id: string): this {
        this.element.id = id;
        return this;
    }

    public id(id: string): this {
        this.checkBoxElement.id = id;
        this.labelElement.htmlFor = id;
        return this;
    }

    public label(text: string): this {
        this.labelElement.textContent = text;
        return this;
    }

}