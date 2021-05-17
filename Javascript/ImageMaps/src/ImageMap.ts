namespace ImageMaps {

    export class ImageMap {

        public readonly tilesWide: number = 0;

        public readonly tilesHigh: number = 0;

        public readonly count: number = 0;

        private frames: ImageMapFrame[] = [];

        public constructor(
            public readonly image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement,
            public readonly tileWidth: number = 0,
            public readonly tileHeight: number = 0
        ) {
            if (tileWidth == 0) {
                this.tileWidth = image.width;
            }
            if (tileHeight == 0) {
                this.tileHeight = image.height;
            }
            this.tilesWide = Math.ceil(image.width / this.tileWidth);
            this.tilesHigh = Math.ceil(image.height / this.tileHeight);
            this.count = this.tilesWide * this.tilesHigh;
        }

        public render(context: CanvasRenderingContext2D, x: number, y: number, imageIndex: number) {
            var imageIndexX = imageIndex % this.tilesWide;
            var imageIndexY = Math.floor(imageIndex / this.tilesWide);
            context.drawImage(
                this.image,
                imageIndexX * this.tileWidth,
                imageIndexY * this.tileHeight,
                this.tileWidth,
                this.tileHeight,
                x,
                y,
                this.tileWidth,
                this.tileHeight
            );
        }

        public renderAsNewCanvas(imageIndex: number): HTMLCanvasElement {
            let canvas = document.createElement('canvas');
            canvas.width = this.tileWidth;
            canvas.height = this.tileHeight;
            let context = canvas.getContext('2d');
            this.render(context, 0, 0, imageIndex);
            return canvas;
        }

        public getFrame(imageIndex: number): ImageMapFrame {
            if (this.frames[imageIndex] == undefined) {
                let canvas = document.createElement('canvas');
                canvas.width = this.tileWidth;
                canvas.height = this.tileHeight;
                let context = canvas.getContext('2d');
                this.render(context, 0, 0, imageIndex);
                this.frames[imageIndex] = new ImageMapFrame(imageIndex, canvas);
            }
            return this.frames[imageIndex];
        }

    }

}