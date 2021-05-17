/// <reference path="../Interfaces/Processor.ts" />

module Processors {

    /** 
     * Enables capturing of keyboard and mouse events.
     * Makes it possible to integrate processors that implement interfaces: IKeyboardProcessor, IMouseProcessor.
     */
    export class IOProcessor extends Processor {

        public initialize(context: ProcessorContext) {
            super.initialize(context);
            window.addEventListener('keydown', this.processKeyDown, false);
            window.addEventListener('keypress', this.processKeyPress, false);
            window.addEventListener('keyup', this.processKeyUp, false);
            window.addEventListener('mousedown', this.processMouseDown, false);
            window.addEventListener('mousemove', this.processMouseMove, false);
            window.addEventListener('mouseup', this.processMouseUp, false);
            window.addEventListener('click', this.processLeftClick, false);
            window.addEventListener('contextmenu', this.processRightClick, false);
            window.addEventListener('dblclick', this.processDoubleClick, false);
            document.addEventListener('wheel', this.processMouseWheel, false);
        }

        public deinitialize() {
            super.deinitialize();
            window.removeEventListener('keydown', this.processKeyDown);
            window.removeEventListener('keypress', this.processKeyPress);
            window.removeEventListener('keyup', this.processKeyUp);
            window.removeEventListener('mousedown', this.processMouseDown);
            window.removeEventListener('mousemove', this.processMouseMove);
            window.removeEventListener('mouseup', this.processMouseUp);
            window.removeEventListener('click', this.processLeftClick);
            window.removeEventListener('contextmenu', this.processRightClick);
            window.removeEventListener('dblclick', this.processDoubleClick);
            document.removeEventListener('wheel', this.processMouseWheel);
        }

        private processKeyDown = (ev: KeyboardEvent) => {
            for (let processor of this.context.processors) {
                let concrete = <IKeyboardProcessor>processor;
                if (concrete.handleKeyDown != undefined) {
                    concrete.handleKeyDown(ev);
                }
            }
            ev.preventDefault();
        }

        private processKeyPress = (ev: KeyboardEvent) => {
            for (let processor of this.context.processors) {
                let concrete = <IKeyboardProcessor>processor;
                if (concrete.handleKeyPress != undefined) {
                    concrete.handleKeyPress(ev);
                }
            }
            ev.preventDefault();
        }

        private processKeyUp = (ev: KeyboardEvent) => {
            for (let processor of this.context.processors) {
                let concrete = <IKeyboardProcessor>processor;
                if (concrete.handleKeyUp != undefined) {
                    concrete.handleKeyUp(ev);
                }
            }
            ev.preventDefault();
        }

        private processMouseDown = (ev: MouseEvent) => {
            for (let processor of this.context.processors) {
                let concrete = <IMouseProcessor>processor;
                if (concrete.handleMouseDown != undefined) {
                    concrete.handleMouseDown(ev);
                }
            }
            ev.preventDefault();
        }

        private processMouseMove = (ev: MouseEvent) => {
            for (let processor of this.context.processors) {
                let concrete = <IMouseProcessor>processor;
                if (concrete.handleMouseMove != undefined) {
                    concrete.handleMouseMove(ev);
                }
            }
            ev.preventDefault();
        }

        private processMouseUp = (ev: MouseEvent) => {
            for (let processor of this.context.processors) {
                let concrete = <IMouseProcessor>processor;
                if (concrete.handleMouseUp != undefined) {
                    concrete.handleMouseUp(ev);
                }
            }
            ev.preventDefault();
        }

        private processLeftClick = (ev: MouseEvent) => {
            for (let processor of this.context.processors) {
                let concrete = <IMouseProcessor>processor;
                if (concrete.handleLeftClick != undefined) {
                    concrete.handleLeftClick(ev);
                }
            }
            ev.preventDefault();
        }

        private processRightClick = (ev: MouseEvent) => {
            for (let processor of this.context.processors) {
                let concrete = <IMouseProcessor>processor;
                if (concrete.handleRightClick != undefined) {
                    concrete.handleRightClick(ev);
                }
            }
            ev.preventDefault();
        }

        private processDoubleClick = (ev: MouseEvent) => {
            for (let processor of this.context.processors) {
                let concrete = <IMouseProcessor>processor;
                if (concrete.handleDoubleClick != undefined) {
                    concrete.handleDoubleClick(ev);
                }
            }
            ev.preventDefault();
        }

        private processMouseWheel = (ev: MouseWheelEvent) => {
            for (let processor of this.context.processors) {
                let concrete = <IMouseProcessor>processor;
                if (concrete.handleMouseWheel != undefined) {
                    concrete.handleMouseWheel(ev);
                }
            }
            ev.preventDefault();
        }

    }

}