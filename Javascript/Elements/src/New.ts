class $New {

    public element<T extends HTMLElement>(name: string): $Element<T> {
        return new $Element<T>(name);
    }

    public anchor(): $Anchor {
        return new $Anchor();
    }

    public button(): $Button {
        return new $Button();
    }

    public canvas(): $Canvas {
        return new $Canvas();
    }

    public checkBox(): $CheckBox {
        return new $CheckBox();
    }

    public div(): $Div {
        return new $Div();
    }
    
    public hr(): $HR {
        return new $HR();
    }

    public image(): $Image {
        return new $Image();
    }

    public input(type: string): $Input {
        return new $Input(null, type);
    }

    public label(): $Label {
        return new $Label();
    }

    public paragraph(): $Paragraph {
        return new $Paragraph();
    }

    public span(): $Span {
        return new $Span();
    }

    public textBox(): $Input {
        return this.input('text');
    }

    public select(): $Select {
        return new $Select();
    }

    public table(): $Table {
        return new $Table();
    }

}