import { EventObject, SingleOrArray, MachineContext } from '../types';
import { pure as pureActionType } from '../actionTypes';
import { createDynamicAction } from '../../actions/dynamicAction';
import {
  BaseActionObject,
  BaseDynamicActionObject,
  DynamicPureActionObject,
  PureActionObject
} from '..';
import { toArray } from '../utils';
import { toActionObjects } from '../actions';

export function pure<
  TContext extends MachineContext,
  TExpressionEvent extends EventObject,
  TEvent extends EventObject = TExpressionEvent
>(
  getActions: ({
    context,
    event
  }: {
    context: TContext;
    event: TExpressionEvent;
  }) => SingleOrArray<BaseActionObject | string> | undefined
): BaseDynamicActionObject<
  TContext,
  TExpressionEvent,
  TEvent,
  PureActionObject,
  DynamicPureActionObject<TContext, TExpressionEvent>['params']
> {
  return createDynamicAction(
    {
      type: pureActionType,
      params: {
        get: getActions
      }
    },
    (event, { state }) => {
      return [
        state,
        {
          type: pureActionType,
          params: {
            actions:
              toArray(
                toActionObjects(getActions({ context: state.context, event }))
              ) ?? []
          }
        }
      ];
    }
  );
}
