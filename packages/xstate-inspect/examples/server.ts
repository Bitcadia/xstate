import { inspect } from '@xstate/inspect/server';
import WebSocket from 'ws';
import { createMachine, interpret, sendTo } from 'xstate';
import { fromCallback } from 'xstate/actors';

inspect({
  server: new WebSocket.Server({
    port: 8888
  })
});

const machine = createMachine({
  initial: 'inactive',
  invoke: {
    id: 'ponger',
    src: fromCallback((cb, receive) => {
      receive((event) => {
        if (event.type === 'PING') {
          cb({
            type: 'PONG',
            arr: [1, 2, 3]
          });
        }
      });
    })
  },
  states: {
    inactive: {
      after: {
        1000: 'active'
      }
    },
    active: {
      entry: sendTo('ponger', { type: 'PING' }, { delay: 1000 }),
      on: {
        PONG: 'inactive'
      }
    }
  }
});

const actor = interpret(machine, { devTools: true });
actor.subscribe((s) => console.log(s.value));
actor.start();
