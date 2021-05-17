function $http(
    details: { method: string; url: string; requestData?: string, contentType?: string; mimeType?: string },
    successCallback: (responseData: string) => void,
    errorCallback: (errorMessage: string) => void = null) {

    // Create a request
    let request = new XMLHttpRequest();
    request.open(details.method, details.url, true);
    if (details.contentType !== undefined) {
        request.setRequestHeader('Content-Type', details.contentType);
    }
    if (details.mimeType !== undefined) {
        request.overrideMimeType(details.mimeType);
    }
    request.onload = function (ev: Event) {
        if (request.status == 200) {
            if (successCallback !== undefined && successCallback !== null) {
                successCallback(request.responseText);
            }
        } else {
            let message = details.method + ' failed with HTTP status code ' + request.status + ': "' + details.url + '".';
            if (errorCallback !== undefined && errorCallback !== null) {
                errorCallback(message);
            } else {
                throw message;
            } 
        }
    };

    // Ensure we handle errors
    request.onerror = function (ev: ProgressEvent) {
        let message = details.method + ' failed due to network issue: "' + details.url + '".';
        if (errorCallback !== undefined && errorCallback !== null) {
            errorCallback(message);
        } else {
            throw message;
        }
    };

    // Send the request
    request.send(details.requestData);
}

function $httpGet(url: string, successCallback: (text: string) => void, errorCallback: (errorMessage: string) => void = null) {
    $http({ method: 'GET', url: url, mimeType: 'text/plain' }, successCallback, errorCallback);
}

function $httpGetImage(url: string, successCallback: (image: HTMLImageElement) => void, errorCallback: (errorMessage: string) => void = null) {
    let image = new Image();
    image.onload = function (ev: Event) {
        if (successCallback !== undefined && successCallback !== null) {
            successCallback(image);
        }
    };
    image.onerror = function (ev: ErrorEvent) {
        let message = 'GET image failed: "' + url + '".';
        if (errorCallback !== undefined && errorCallback !== null) {
            errorCallback(message);
        } else {
            throw message;
        }
    };
    image.src = url;
}

function $httpGetImages(urls: string[], successCallback: (images: HTMLImageElement[]) => void, errorCallback: (errorMessage: string) => void = null) {
    let i = 0;
    let successfulImages: HTMLImageElement[] = [];
    let gotAnImage = function (image: HTMLImageElement) {
        successfulImages.push(image);
        if (successfulImages.length == urls.length) {
            successCallback(successfulImages);
        } else {
            i++;
            $httpGetImage(urls[i], gotAnImage, errorCallback);
        }
    };
    if (urls.length == 0) {
        successCallback([]);
    } else {
        $httpGetImage(urls[i], gotAnImage, errorCallback);
    }
}

function $httpGetJson(url: string, successCallback: (json: any) => void, errorCallback: (errorMessage: string) => void = undefined) {
    $http({ method: 'GET', url: url, mimeType: 'application/json' }, (responseData: string) => {
        if (successCallback !== undefined && successCallback !== null) {
            let json = JSON.parse(responseData);
            successCallback(json);
        }
    }, errorCallback);
}

function $httpGetBinary(url: string, successCallback: (data: ArrayBuffer) => void, errorCallback: (errorMessage: string) => void = null) {

    // Handle response
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';
    request.onload = function (ev: Event) {
        successCallback(request.response);
    }

    // Handle errors
    request.onerror = function (ev: ProgressEvent) {
        let message = 'GET binary failed: "' + url + '".';
        if (errorCallback !== undefined && errorCallback !== null) {
            errorCallback(message);
        } else {
            throw message;
        }
    };

    // Send the request    
    request.send();
}

function $httpPost(url: string, data: string, successCallback: (response: string) => void, errorCallback: (errorMessage: string) => void = undefined) {
    $http({ method: 'POST', url: url, requestData: data }, successCallback, errorCallback);
}

function $httpPostJson(url: string, data: any, successCallback: (response: any) => void, errorCallback: (errorMessage: string) => void = undefined) {
    let requestString = JSON.stringify(data);
    $http({ method: 'POST', url: url, requestData: requestString, contentType: 'application/json; charset=UTF-8' }, (responseText: string) => {
        if (successCallback !== undefined && successCallback !== null) {
            let responseJson = JSON.stringify(responseText);
            successCallback(responseJson);
        }
    }, errorCallback);
}