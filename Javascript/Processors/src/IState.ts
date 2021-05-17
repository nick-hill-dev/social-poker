module Processors {

    export interface IState<T> {

        /** 
         * This function is called by the state engine whenever the current state is changed to this state.
         * The context object provides a means by which you can access global information.
         * It is also possible to add any number of processors via the context object, either now or at a later time during
         * the lifetime of this state.
         */
        stateEntered?(context: StateContext<T>): void;

        /** 
         * This function is called by the state engine whenever this state is exited and some other state activated.
         */
        stateExited?(): void;

    }

}