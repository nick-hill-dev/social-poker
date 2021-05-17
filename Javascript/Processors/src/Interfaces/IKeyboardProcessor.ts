/// <reference path="IProcessor.ts" />

module Processors {

    /** 
     * Processors that implement this interface can handle keyboard events.
     */
    export interface IKeyboardProcessor extends IProcessor {

        handleKeyDown(ev: KeyboardEvent): void;

        handleKeyPress(ev: KeyboardEvent): void;

        handleKeyUp(ev: KeyboardEvent): void;

    }

}