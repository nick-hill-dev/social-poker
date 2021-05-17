module Processors {

    export class StateEngine<T> {

        private currentState: IState<T> = null;

        private readonly context: StateContext<T> = null;

        constructor(data: T) {
            let processorContext = new Processors.ProcessorContext();
            this.context = new StateContext(this, processorContext, data);
        }

        /** 
         * Changes the current state.
         * The previous state is informed of exit and the new state is informed of entry.
         * All processors added to this state are unloaded, so that the new state can add a fresh list.
         */
        public changeState(newState: IState<T>) {
            if (this.currentState != null && this.currentState.stateExited != null) {
                this.currentState.stateExited();
            }
            this.context.processors.clear();
            this.currentState = newState;
            if (newState.stateEntered != null) {
                newState.stateEntered(this.context);
            }
        }

        public getCurrentState(): IState<T> {
            return this.currentState;
        }

        public getCurrentProcessors(): Processors.IProcessor[] {
            return this.context.processors.processors;
        }

    }

}