module Processors {

    /** 
     * The base class for all processors which provides class-wide access to the processor context object.
     * All processors must extend this base class.
     */
    export abstract class Processor implements IProcessor {

        protected context: ProcessorContext | null = null;

        public initialize(context: ProcessorContext) {
            this.context = context;
        }

        public deinitialize() {
        }

    }

}