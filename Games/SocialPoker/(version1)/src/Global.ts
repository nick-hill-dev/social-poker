window.onload = () => {
    
    let serverAddress: string = 'ws://127.0.0.1/relay';

    let loaderOptions = new LoaderOptions('data');
    loaderOptions.log = true;

    let loader = new Loader(loaderOptions);
    loader.whenEncounterSection('server', (c, json) => {
        serverAddress = json.address;
    });

    loader.whenLoadingComplete(() => {
        let element = <HTMLDivElement>document.getElementById('mainDiv');
        let session = new Session(element, serverAddress);
        session.start();
    });

    loader.startLoading(['server.json']);
};