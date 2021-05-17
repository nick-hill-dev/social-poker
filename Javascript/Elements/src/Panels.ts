class $Panels {

    public ids: string[] = [];

    constructor(ids: string[]) {
        this.ids = ids;
    }

    public hide(...ids: string[]) {
        for (let id of ids) {
            let element = document.getElementById(id);
            if (element.style.display != 'none') {
                element['$oldDisplay'] = element.style.display;
                element.style.display = 'none';
            }
        }
    }

    public hideAll() {
        for (let id of this.ids) {
            this.hide(id);
        }
    }

    public show(...ids: string[]) {
        for (let id of ids) {
            let element = document.getElementById(id);
            if (element.style.display == 'none') {
                let oldDisplay = element['$oldDisplay'];
                if (oldDisplay !== undefined) {
                    element.style.display = oldDisplay;
                    delete element['$oldDisplay'];
                } else {
                    element.style.display = 'inline';
                }
            }
        }
    }

    public showAll() {
        for (let id of this.ids) {
            this.show(id);
        }
    }

    public showOnly(...ids: string[]) {
        this.hideAll();
        for (let id of ids) {
            this.show(id);
        }
    }

}