module Processors {

    export class StateContext<T> {

        constructor(public readonly stateEngine: StateEngine<T>, public readonly processors: Processors.ProcessorContext, public readonly global: T) {
        }

    }

}