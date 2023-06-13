import { State } from '../State';
import { DevToolsAdapter } from '../types';

interface ReduxDevToolsOptions {
  [key: string]: any;
}

export const createReduxDevTools = (
  options: ReduxDevToolsOptions
): DevToolsAdapter => {
  return (service) => {
    if ((window as any).__REDUX_DEVTOOLS_EXTENSION__) {
      const devTools = (window as any).__REDUX_DEVTOOLS_EXTENSION__.connect(
        {
          name: service.id,
          autoPause: true,
          stateSanitizer: (state: State<any, any>): object => {
            return {
              value: state.value,
              context: state.context
            };
          },
          ...options,
          features: {
            jump: false,
            skip: false,
            ...(options ? options.features : undefined)
          }
        },
        service.logic
      );

      service.subscribe((state) => {
        devTools.send(state.event, state);
      });
    }
  };
};
