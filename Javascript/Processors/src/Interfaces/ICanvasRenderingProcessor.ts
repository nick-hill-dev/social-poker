/// <reference path="IProcessor.ts" />

module Processors {

    /** 
     * Processors that implement this interface can draw onto a canvas surface regularly.
     */
    export interface ICanvasRenderingProcessor extends IProcessor {

        regularRendering(canvas: HTMLCanvasElement, surface: CanvasRenderingContext2D, time: number): void;

    }

}