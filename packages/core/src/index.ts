import { doneInvoke, forwardTo, sendParent, sendTo } from './actions';
export { assign } from './actions/assign';
export { cancel } from './actions/cancel';
export { choose } from './actions/choose';
export { log } from './actions/log';
export { pure } from './actions/pure';
export { raise } from './actions/raise';
export { stop } from './actions/stop';
import { interpret, Interpreter, ActorStatus } from './interpreter';
import { createMachine } from './Machine';
import { mapState } from './mapState';
import { State } from './State';
import { StateNode } from './StateNode';
export { SimulatedClock } from './SimulatedClock';
export { StateMachine } from './StateMachine';
export { getStateNodes } from './stateUtils';
export { waitFor } from './waitFor';
export * from './typegenTypes';
export * from './types';
// TODO: decide from where those should be exported
export { matchesState, pathToStateValue, toObserver } from './utils';
export {
  StateNode,
  State,
  mapState,
  sendTo,
  sendParent,
  forwardTo,
  interpret,
  Interpreter,
  ActorStatus as InterpreterStatus,
  doneInvoke,
  createMachine
};
export {
  fromPromise,
  fromObservable,
  fromCallback,
  fromEventObservable,
  fromTransition
} from './actors/index';

export { stateIn, not, and, or } from './guards';

declare global {
  interface SymbolConstructor {
    readonly observable: symbol;
  }
}
