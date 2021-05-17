namespace ImageMaps {

    export class FontImageMap {

        private imageMap: ImageMap;

        public fillStyle: string = null;

        public constructor(
            image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement,
            glyphWidth: number = 0,
            glyphHeight: number = 0
        ) {
            this.imageMap = new ImageMap(image, glyphWidth, glyphHeight);
        }

        public render(context: CanvasRenderingContext2D, x: number, y: number, text: string) {
            if (this.fillStyle == null) {
                for (let i = 0; i < text.length; i++) {
                    let code = text.charCodeAt(i);
                    this.imageMap.render(context, x, y, code);
                    x += this.imageMap.tileWidth;
                }
            } else {
                var tempCanvas = document.createElement('canvas');
                tempCanvas.width = text.length * this.imageMap.tileWidth;
                tempCanvas.height = this.imageMap.tileHeight * 2;
                var tempContext = tempCanvas.getContext('2d');
                tempContext.fillStyle = this.fillStyle;
                tempContext.fillRect(0, 0, tempCanvas.width, this.imageMap.tileHeight);
                for (var i = 0; i < text.length; i++) {
                    var code = text.charCodeAt(i);
                    this.imageMap.render(tempContext, i * this.imageMap.tileWidth, this.imageMap.tileHeight, code);
                }
                tempContext.globalCompositeOperation = 'destination-in';
                tempContext.drawImage(tempCanvas, 0, this.imageMap.tileHeight, tempCanvas.width, this.imageMap.tileHeight, 0, 0, tempCanvas.width, this.imageMap.tileHeight);
                context.drawImage(tempCanvas, x, y);
            }
        }

    }

}