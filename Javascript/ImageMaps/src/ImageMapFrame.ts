namespace ImageMaps {

    export class ImageMapFrame {

        public constructor(public readonly index: number, public readonly image: HTMLCanvasElement) {
        }

        public render(
            context: CanvasRenderingContext2D,
            x: number,
            y: number,
            horizontalAlignment: HorizontalAlignment = HorizontalAlignment.left,
            verticalAlignment: VerticalAlignment = VerticalAlignment.top,
            rotation: number = 0,
            scaleX: number = 1,
            scaleY: number = 1
        ) {
            let width = this.image.width * scaleX;
            let height = this.image.height * scaleY;
            let transformX = 0;
            if (horizontalAlignment == HorizontalAlignment.center) {
                transformX = Math.floor(width / 2);
            } else if (horizontalAlignment == HorizontalAlignment.right) {
                transformX = width;
            }
            let transformY = 0;
            if (verticalAlignment == VerticalAlignment.middle) {
                transformY = Math.floor(height / 2);
            } else if (verticalAlignment == VerticalAlignment.bottom) {
                transformY = height;
            }
            if (rotation == 0) {
                context.drawImage(this.image, x - transformX, y - transformY, width, height);
            } else {
                context.save();
                context.translate(x, y);
                context.rotate(rotation);
                context.drawImage(this.image, -transformX, -transformY, width, height);
                context.restore();
            }
        }

    }

}