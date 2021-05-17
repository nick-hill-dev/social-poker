class LoaderOptions {

    public log: boolean = false;

    public constructor(public readonly basePath: string = '') {
    }

    public static basicWithLogging(basePath: string = ''): LoaderOptions {
        var options = new LoaderOptions(basePath);
        options.log = true;
        return options;

    }

}