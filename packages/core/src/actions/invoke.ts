import isDevelopment from '#is-development';
import { EventObject, InvokeDefinition, MachineContext } from '../types';
import { invoke as invokeActionType } from '../actionTypes';
import { isActorRef } from '../actors/index';
import { createDynamicAction } from '../../actions/dynamicAction';
import {
  AnyInterpreter,
  BaseDynamicActionObject,
  DynamicInvokeActionObject,
  InvokeActionObject
} from '../index';
import { actionTypes, error } from '../actions';
import { resolveReferencedActor } from '../utils';
import { ActorStatus, interpret } from '../interpreter';
import { cloneState } from '../State';

export function invoke<
  TContext extends MachineContext,
  TExpressionEvent extends EventObject,
  TEvent extends EventObject
>(
  invokeDef: InvokeDefinition<TContext, TEvent>
): BaseDynamicActionObject<
  TContext,
  TExpressionEvent,
  TEvent,
  InvokeActionObject,
  DynamicInvokeActionObject<TContext, TEvent>['params']
> {
  return createDynamicAction(
    { type: invokeActionType, params: invokeDef },
    (event, { state, actorContext }) => {
      const type = actionTypes.invoke;
      const { id, src } = invokeDef;

      let resolvedInvokeAction: InvokeActionObject;
      if (isActorRef(src)) {
        resolvedInvokeAction = {
          type,
          params: {
            ...invokeDef,
            ref: src
          }
        } as InvokeActionObject;
      } else {
        const referenced = resolveReferencedActor(
          state.machine.options.actors[src]
        );

        if (!referenced) {
          resolvedInvokeAction = {
            type,
            params: invokeDef
          } as InvokeActionObject;
        } else {
          const input =
            'input' in invokeDef ? invokeDef.input : referenced.input;
          const ref = interpret(referenced.src, {
            id,
            src,
            parent: actorContext?.self,
            systemId: invokeDef.systemId,
            input:
              typeof input === 'function'
                ? input({
                  context: state.context,
                  event,
                  self: actorContext?.self
                })
                : input
          });

          resolvedInvokeAction = {
            type,
            params: {
              ...invokeDef,
              ref
            }
          } as InvokeActionObject;
        }
      }

      const actorRef = resolvedInvokeAction.params.ref!;
      const invokedState = cloneState(state, {
        children: {
          ...state.children,
          [id]: actorRef
        }
      });

      resolvedInvokeAction.execute = (actorCtx) => {
        const parent = actorCtx.self as AnyInterpreter;
        const { id, ref } = resolvedInvokeAction.params;
        if (!ref) {
          if (isDevelopment) {
            console.warn(
              `Actor type '${resolvedInvokeAction.params.src}' not found in machine '${actorCtx.id}'.`
            );
          }
          return;
        }
        actorCtx.defer(() => {
          if (actorRef.status === ActorStatus.Stopped) {
            return;
          }
          try {
            actorRef.start?.();
          } catch (err) {
            parent.send(error(id, err));
            return;
          }
        });
      };

      return [invokedState, resolvedInvokeAction];
    }
  );
}
