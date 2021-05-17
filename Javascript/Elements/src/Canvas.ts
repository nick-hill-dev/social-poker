/// <reference path="Element.ts" />

class $Canvas extends $Element<HTMLCanvasElement> {

    constructor(existing: HTMLCanvasElement = null) {
        super(existing != null ? existing : 'canvas');
    }

    public size(width: number, height: number): this {
        this.element.width = width;
        this.element.height = height;
        return this;
    }

    public with2D(f: (context: CanvasRenderingContext2D) => void): this {
        let context = this.element.getContext('2d');
        f(context);
        return this;
    }

    public onClick(handler: (e: MouseEvent) => void): this {
        this.element.addEventListener('click', handler, false);
        return this;
    }

}