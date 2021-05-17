function $new(): $New {
    return new $New();
}

function $newBuilder<T extends $Element<U>, U extends HTMLElement>(f: () => T, parent: HTMLElement | $Node = null, id: string = null): T {
    let builder = f();
    if (parent != null) {
        builder.parent(parent);
    }
    if (id != null) {
        builder.id(id);
    }
    return builder;
}

function $newAnchor(parent: HTMLElement | $Node = null, id: string = null): $Anchor {
    return $newBuilder(() => $new().anchor(), parent, id);
}

function $newButton(parent: HTMLElement | $Node = null, id: string = null): $Button {
    return $newBuilder(() => $new().button(), parent, id);
}

function $newCanvas(parent: HTMLElement | $Node = null, id: string = null): $Canvas {
    return $newBuilder(() => $new().canvas(), parent, id);
}

function $newDiv(parent: HTMLElement | $Node = null, id: string = null): $Div {
    return $newBuilder(() => $new().div(), parent, id);
}

function $newHR(parent: HTMLElement | $Node = null, id: string = null): $HR {
    return $newBuilder(() => $new().hr(), parent, id);
}

function $newImage(parent: HTMLElement | $Node = null, id: string = null): $Image {
    return $newBuilder(() => $new().image(), parent, id);
}

function $newLabel(parent: HTMLElement | $Node = null, id: string = null): $Label {
    return $newBuilder(() => $new().label(), parent, id);
}

function $newParagraph(parent: HTMLElement | $Node = null, id: string = null): $Paragraph {
    return $newBuilder(() => $new().paragraph(), parent, id);
}

function $newSpan(parent: HTMLElement | $Node = null, id: string = null): $Span {
    return $newBuilder(() => $new().span(), parent, id);
}

function $newSelect(parent: HTMLElement | $Node = null, id: string = null): $Select {
    return $newBuilder(() => $new().select(), parent, id);
}

function $newTable(parent: HTMLElement | $Node = null, id: string = null): $Table {
    return $newBuilder(() => $new().table(), parent, id);
}

function $asAnchor(id: string): $Anchor {
    let element = <HTMLAnchorElement>document.getElementById(id);
    return new $Anchor(element);
}

function $asButton(id: string): $Button {
    let element = <HTMLButtonElement>document.getElementById(id);
    return new $Button(element);
}

function $asDiv(id: string): $Div {
    let element = <HTMLDivElement>document.getElementById(id);
    return new $Div(element);
}

function $asImage(id: string): $Image {
    let element = <HTMLImageElement>document.getElementById(id);
    return new $Image(element);
}

function $asInput(id: string): $Input {
    let element = <HTMLInputElement>document.getElementById(id);
    return new $Input(element);
}

function $asLabel(id: string): $Label {
    let element = <HTMLLabelElement>document.getElementById(id);
    return new $Label(element);
}

function $asPanels(ids: string[]): $Panels {
    return new $Panels(ids);
}

function $asPanelsAuto(id: string): $Panels {
    let panels = new $Panels([]);
    let element = document.getElementById(id);
    for (let i = 0; i < element.childNodes.length; i++) {
        let childElement = <HTMLElement>element.childNodes[i];
        if (childElement.id !== undefined) {
            panels.ids.push(childElement.id);
        }
    }
    return panels;
}

function $asParagraph(id: string): $Paragraph {
    let element = <HTMLParagraphElement>document.getElementById(id);
    return new $Paragraph(element);
}

function $asRepeater(id: string): $Repeater {
    let element = document.getElementById(id);
    return new $Repeater(element);
}

function $asSelect(id: string): $Select {
    let element = <HTMLSelectElement>document.getElementById(id);
    return new $Select(element);
}

function asTable(id: string): $Table {
    let element = <HTMLTableElement>document.getElementById(id);
    return new $Table(element);
}