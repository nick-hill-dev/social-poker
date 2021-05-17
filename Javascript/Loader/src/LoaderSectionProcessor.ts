class LoaderSectionProcessor {

    public constructor(public readonly sectionName: string, public handler: (context: LoaderContext, json: any) => void) {
    }

}