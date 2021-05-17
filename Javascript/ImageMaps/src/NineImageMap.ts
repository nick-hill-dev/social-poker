namespace ImageMaps {

    export class NineImageMap {

        public readonly width: number;

        public readonly height: number;

        public constructor(
            public readonly image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement,
            public readonly leftMargin: number,
            public readonly topMargin: number,
            public readonly rightMargin: number,
            public readonly bottomMargin: number
        ) {
            this.width = image.width;
            this.height = image.height;
        }

        public static extract(imageMap: ImageMap, imageIndex: number, leftMargin: number, topMargin: number, rightMargin: number, bottomMargin: number): NineImageMap {
            let canvas = document.createElement('canvas');
            canvas.width = imageMap.tileWidth;
            canvas.height = imageMap.tileHeight;
            let context = canvas.getContext('2d');
            if (context == null) {
                throw 'Cannot get 2D context of new canvas element.';
            }
            imageMap.render(context, 0, 0, imageIndex);
            return new NineImageMap(canvas, leftMargin, topMargin, rightMargin, bottomMargin);
        }

        public render(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
            let x1 = this.leftMargin;
            let y1 = this.topMargin;
            let x2 = this.width - this.rightMargin;
            let y2 = this.height - this.bottomMargin;
            let marginsX = x1 + this.rightMargin;
            let marginsY = y1 + this.bottomMargin;
            
            // Left strip
            context.drawImage(this.image, 0, 0, x1, y1, x, y, x1, y1);
            context.drawImage(this.image, 0, y1, x1, this.height - marginsY, x, y + y1, x1, height - marginsY);
            context.drawImage(this.image, 0, y2, x1, this.bottomMargin, x, y + height - this.bottomMargin, x1, this.bottomMargin);

            // Middle strip
            let w = width - marginsX;
            if (w > 0) {
                context.drawImage(this.image, x1, 0, x2 - x1, y1, x + x1, y, w, y1);
                context.drawImage(this.image, x1, y1, this.width - marginsX, this.height - marginsY, x + x1, y + y1, w, height - marginsY);
                context.drawImage(this.image, x1, y2, x2 - x1, this.bottomMargin, x + x1, y + height - this.bottomMargin, w, this.bottomMargin);
            }

            // Right strip
            context.drawImage(this.image, x2, 0, this.rightMargin, y1, x + width - this.rightMargin, y, this.rightMargin, y1);
            context.drawImage(this.image, x2, y1, this.rightMargin, this.height - marginsY, x + width - this.rightMargin, y + y1, this.rightMargin, height - marginsY);
            context.drawImage(this.image, x2, y2, this.rightMargin, this.bottomMargin, x + width - this.rightMargin, y + height - this.bottomMargin, this.rightMargin, this.bottomMargin);
        }

    }

}