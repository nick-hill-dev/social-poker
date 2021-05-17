class $Table extends $Element<HTMLTableElement> {

    private activeRow: HTMLTableRowElement = null;

    constructor(existing: HTMLTableElement = null) {
        super(existing != null ? existing : 'table');
    }

    public newRow(): HTMLTableRowElement {
        this.activeRow = document.createElement('tr');
        this.element.appendChild(this.activeRow);
        return this.activeRow;
    }

    public newCell(content: HTMLElement[] | string = undefined): HTMLTableCellElement {
        return new $TableRow(this.activeRow).newCell(content);
    }

    public addRowStrings(values: string[]) {
        this.newRow();
        for (let value of values) {
            this.newCell(value);
        }
    }

}