/// <reference path="Element.ts" />

class $Select extends $Element<HTMLSelectElement> {

    constructor(existing: HTMLSelectElement = null) {
        super(existing != null ? existing : 'select');
    }

    public name(name: string): this {
        this.element.name = name;
        return this;
    }

    public value(value: string): this {
        this.element.value = value;
        return this;
    }

    public multiple(multiple: boolean): this {
        this.element.multiple = multiple;
        return this;
    }

    public size(size: number): this {
        this.element.size = size;
        return this;
    }

    public options(options: any): this {
        $Select.setOptions(this.element, options);
        return this;
    }

    public clear(): this {
        this.element.options.length = 0;
        return this;
    }

    public getSelectedValue(): string {
        var option = <HTMLOptionElement>this.element.options[this.element.selectedIndex];
        return option.value;
    }

    public addItem(value: string, text: string): this {
        var option = document.createElement('option');
        option.value = value;
        option.textContent = text;
        this.element.appendChild(option);
        return this;
    }

    public setItem(value: string, text: string): this {
        for (let i = 0; i < this.element.length; i++) {
            let option = this.element.options[i];
            if (option.value == value) {
                option.textContent = text;
                return this;
            }
        }
        throw 'Could not set value of item "' + value + '" in the select element.';
    }

    public removeItem(value: string): this {
        for (let i = 0; i < this.element.length; i++) {
            if (this.element.options[i].value == value) {
                this.element.remove(i);
                return this;
            }
        }
        throw 'Could not remove item "' + value + '" from the select element.';
    }

    public values(values: string[]): this {
        let oldValue = this.element.value;
        this.clear();
        for (var value of values) {
            this.addItem(value, value);
        }
        if (values.indexOf(oldValue) != -1) {
            this.element.value = oldValue;
        }
        return this;
    }

    public sortByText(): this {
        let options = this.element.options;
        let optionsArray = [];
        for (let i = 0; i < options.length; i++) {
            optionsArray.push(options[i]);
        }
        optionsArray = optionsArray.sort((a, b) => {
            let left = a.textContent.toLowerCase();
            let right = b.textContent.toLowerCase();
            if (left < right) {
                return -1;
            }
            if (left > right) {
                return 1;
            }
            return 0;
        });
        for (let i = 0; i <= options.length; i++) {
            options[i] = optionsArray[i];
        }
        return this;
    }
    
    public static setOptions(element: HTMLSelectElement, options: any) {
        for (var key in options) {
            var option = document.createElement('option');
            option.value = key;
            option.textContent = options[key];
            element.appendChild(option);
        }
    }

}