/// <reference path="IProcessor.ts" />

module Processors {

    /** 
     * Processors that implement this interface can perform processing at regular intervals.
     */
    export interface ITickProcessor extends IProcessor {

        tick(timeElapsed: number): void;

    }

}