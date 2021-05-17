/// <reference path="IProcessor.ts" />

module Processors {

    /** 
     * Processors that implement this interface can handle mouse events.
     */
    export interface IMouseProcessor extends IProcessor {

        handleMouseDown(ev: MouseEvent): void;

        handleMouseMove(ev: MouseEvent): void;

        handleMouseUp(ev: MouseEvent): void;

        handleLeftClick(ev: MouseEvent): void;

        handleRightClick(ev: MouseEvent): void;

        handleDoubleClick(ev: MouseEvent): void;

        handleMouseWheel(ev: MouseWheelEvent): void;

    }

}