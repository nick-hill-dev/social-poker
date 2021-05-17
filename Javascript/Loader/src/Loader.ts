class Loader {

    private started: boolean = false;

    private pendingDataFileNames: string[] = [];

    private handlersForLoadingFile: Array<(context: LoaderContext) => void> = [];

    private handlersForLoadedFile: Array<(context: LoaderContext, json: any) => void> = [];

    private handlersForProcessedFile: Array<(context: LoaderContext, json: any) => void> = [];

    private handlersForSections: LoaderSectionProcessor[] = [];

    private handlersForUnknownSections: Array<(context: LoaderContext, sectionName: string, json: any) => void> = [];

    private handlersForCompletion: Array<() => void> = [];

    public constructor(private readonly options: LoaderOptions) {
    }

    public whenLoadingFile(handler: (context: LoaderContext) => void) {
        this.handlersForLoadingFile.push(handler);
    }

    public whenLoadedFile(handler: (context: LoaderContext, json: any) => void) {
        this.handlersForLoadedFile.push(handler);
    }

    public whenProcessedFile(handler: (context: LoaderContext, json: any) => void) {
        this.handlersForProcessedFile.push(handler);
    }

    public whenEncounterSection(sectionName: string, handler: (context: LoaderContext, json: any) => void) {
        this.handlersForSections.push(new LoaderSectionProcessor(sectionName, handler));
    }

    public whenEncounterUnknownSection(handler: (context: LoaderContext, sectionName: string, json: any) => void) {
        this.handlersForUnknownSections.push(handler);
    }

    public whenLoadingComplete(handler: () => void) {
        this.handlersForCompletion.push(handler);
    }

    public startLoading(initialFileNames: string[]) {
        if (this.started) {
            throw 'It is only possible to begin loading files once using the file loader.';
        }
        this.started = true;

        for (let initialFileName of initialFileNames) {
            this.pendingDataFileNames.push(initialFileName);
        }
        this.getNextDataFile();
    }

    private getNextDataFile() {

        let fileName = this.pendingDataFileNames.shift();
        let url = (this.options.basePath == '' ? '' : this.options.basePath + '/') + fileName;
        if (this.options.log) {
            console.groupCollapsed('Loading: ' + url);
        }

        let context = new LoaderContext(fileName);
        for (let handler of this.handlersForLoadingFile) {
            handler(context);
        }

        let request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.overrideMimeType('application/json');

        request.onload = () => {
            this.handleDataFileLoaded(context, request.responseText);
        };

        request.onerror = () => {
            if (this.options.log) {
                console.error('Failed to load file.');
                console.groupEnd();
            }
            throw 'Cannot load: ' + url;
        };

        request.send();
    }

    private handleDataFileLoaded(context: LoaderContext, text: string) {

        if (this.options.log) {
            console.log('File was loaded successfully.');
        }

        let json = JSON.parse(text);
        for (let handler of this.handlersForLoadedFile) {
            handler(context, json);
        }

        if (this.handlersForSections.length > 0 || this.handlersForUnknownSections.length > 0) {
            for (let key in json) {
                let found = false;

                for (let handler of this.handlersForSections) {
                    if (handler.sectionName == key) {
                        found = true;
                        if (this.options.log) {
                            console.log('Parsing section: ' + key);
                        }
                        handler.handler(context, json[key]);
                    }
                }

                if (!found && this.handlersForUnknownSections.length > 0) {
                    for (let handler of this.handlersForUnknownSections) {
                        if (this.options.log) {
                            console.log('Parsing unknown section: ' + key);
                        }
                        handler(context, key, json[key]);
                    }
                }

            }
        }

        for (let fileName of context.getQueuedDataFiles()) {
            this.pendingDataFileNames.push(fileName);
        }

        for (let handler of this.handlersForProcessedFile) {
            handler(context, json);
        }

        if (this.options.log) {
            console.groupEnd();
        }

        if (this.pendingDataFileNames.length > 0) {
            this.getNextDataFile();
        } else {
            this.handleAllFilesLoaded();
        }
    }

    private handleAllFilesLoaded() {
        for (let handler of this.handlersForCompletion) {
            handler();
        }
    }

}