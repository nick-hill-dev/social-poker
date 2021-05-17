/// <reference path="../Interfaces/Processor.ts" />

module Processors {

    /** 
     * Enables regular processing at a specified interval.
     * Makes it possible to integrate processors that implement interfaces: ITickProcessor.
     */
    export class TickProcessor extends Processor {

        private lastTime: number = 0;

        private enabled: boolean = true;

        private handle: number = 0;

        public constructor(public readonly interval: number = 1000 / 60) {
            super();
        }

        public initialize(context: ProcessorContext) {
            super.initialize(context);
            this.handleTick();
            this.handle = setInterval(this.handleTick, this.interval);
        }

        public deinitialize() {
            super.deinitialize();
            this.enabled = false;
            clearInterval(this.handle);
        }

        private handleTick = () => {
            if (!this.enabled) {
                return;
            }
            let now = Date.now();
            let timeElapsed = this.lastTime == 0 ? 0 : now - this.lastTime;
            this.lastTime = now;
            for (let processor of this.context.processors) {
                let concrete = <ITickProcessor>processor;
                if (concrete.tick != undefined) {
                    concrete.tick(timeElapsed);
                }
            }
        }

    }

}