class $Repeater {

    public element: HTMLElement = null;

    public template: (index: number) => HTMLElement = null;

    constructor(element: HTMLElement) {
        this.element = element;
    }

    public clear() {
        while (this.element.firstChild) {
            this.element.removeChild(this.element.firstChild);
        }
    }

    public appendFromTemplate(): HTMLElement {
        var currentLength = this.element.childNodes.length;
        var element = this.template(currentLength);
        this.element.appendChild(element);
        return element;
    }

    public removeAt(index: number) {
        var child = this.element.childNodes[index];
        this.element.removeChild(child);
    }

    public remove(element: HTMLElement) {
        this.element.removeChild(element);
    }

}