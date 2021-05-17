class $TableRow {

    public element: HTMLTableRowElement = null;

    private activeCell: HTMLTableCellElement = null;

    constructor(element: HTMLTableRowElement) {
        this.element = element;
    }

    public newCell(content: HTMLElement[] | string = undefined): HTMLTableCellElement {
        this.activeCell = document.createElement('td');
        if (content != undefined) {
            if (typeof content == 'string') {
                this.activeCell.textContent = content;
            } else {
                for (let child of content) {
                    this.activeCell.appendChild(<HTMLElement>child);
                }
            }
        }
        this.element.appendChild(this.activeCell);
        return this.activeCell;
    }

}