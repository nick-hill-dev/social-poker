function $id(id: string): HTMLElement | null {
    return document.getElementById(id);
}

function $name(name: string): HTMLElement | null {
    let elements = document.getElementsByName(name);
    return elements.length == 0 ? null : elements[0];
}

function $names(name: string): HTMLElement[] {
    let result: HTMLElement[] = [];
    let elements = document.getElementsByName(name);
    for (let i = 0; i < elements.length; i++) {
        result.push(elements[i]);
    }
    return result;
}

function $classes(name: string): Element[] {
    let result: Element[] = [];
    let elements = document.getElementsByClassName(name);
    for (let i = 0; i < elements.length; i++) {
        result.push(elements[i]);
    }
    return result;
}