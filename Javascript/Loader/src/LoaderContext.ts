class LoaderContext {

    private newFileNames: string[] = [];

    public queueDataFile(fileName: string) {
        this.newFileNames.push(fileName);
    }

    public getQueuedDataFiles(): string[] {
        return this.newFileNames;
    }

    public constructor(public readonly fileName: string) {
    }

}