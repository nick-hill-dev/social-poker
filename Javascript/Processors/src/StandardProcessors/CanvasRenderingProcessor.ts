/// <reference path="../Interfaces/Processor.ts" />

module Processors {

    /** 
     * Enables regular rendering onto a canvas element.
     * Makes it possible to integrate processors that implement interfaces: ICanvasRenderingProcessor.
     */
    export class CanvasRenderingProcessor extends Processor {

        private surface: CanvasRenderingContext2D;

        private enabled: boolean = true;

        public constructor(public readonly canvas: HTMLCanvasElement) {
            super();
            this.surface = canvas.getContext('2d');
        }

        public initialize(context: ProcessorContext) {
            super.initialize(context);
            requestAnimationFrame((time: number) => this.handleRenderFrame(time));
        }

        public deinitialize() {
            super.deinitialize();
            this.enabled = false;
        }

        private handleRenderFrame(time: number) {
            if (!this.enabled) {
                return;
            }
            for (let processor of this.context.processors) {
                let concrete = <ICanvasRenderingProcessor>processor;
                if (concrete.regularRendering != undefined) {
                    concrete.regularRendering(this.canvas, this.surface, time);
                }
            }
            requestAnimationFrame((time: number) => this.handleRenderFrame(time));
        }

    }

}