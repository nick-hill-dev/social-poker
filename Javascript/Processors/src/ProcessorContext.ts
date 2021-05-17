module Processors {

    export class ProcessorContext {

        public processors: IProcessor[] = [];

        /** 
         * Adds the specified processor to the end of the list of active processors.
         * The processor is activated via the initialize method.
         */
        public pushProcessor(processor: IProcessor) {
            this.processors.push(processor);
            processor.initialize(this);
        }

        /** 
         * Removes all processors, deinitializing each one by one.
         * If a state engine is in use, then it will call this method when a state is exited.
         */
        public clear() {
            for (let processor of this.processors) {
                processor.deinitialize();
            }
            this.processors.length = 0;
        }

    }

}