module Processors {

    /** 
     * Processors that implement this interface can perform initialization work once the processor is added to a state.
     * This interface is implemented by the Processor base class, so make sure to extend that class rather than implement this one directly.
     */
    export interface IProcessor {

        initialize(context: ProcessorContext): void;

        deinitialize(): void;

    }

}