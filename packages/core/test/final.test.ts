import { createMachine, interpret, assign } from '../src/index.ts';

describe('final states', () => {
  it('should emit the "done.state.*" event when all nested states are in their final states', () => {
    const onDoneSpy = jest.fn();

    const machine = createMachine({
      id: 'm',
      initial: 'foo',
      states: {
        foo: {
          type: 'parallel',
          states: {
            first: {
              initial: 'a',
              states: {
                a: {
                  on: { NEXT_1: 'b' }
                },
                b: {
                  type: 'final'
                }
              }
            },
            second: {
              initial: 'a',
              states: {
                a: {
                  on: { NEXT_2: 'b' }
                },
                b: {
                  type: 'final'
                }
              }
            }
          },
          onDone: {
            target: 'bar',
            actions: ({ event }) => {
              onDoneSpy(event.type);
            }
          }
        },
        bar: {}
      }
    });

    const actor = interpret(machine).start();

    actor.send({
      type: 'NEXT_1'
    });
    actor.send({
      type: 'NEXT_2'
    });

    expect(actor.getSnapshot().value).toBe('bar');
    expect(onDoneSpy).toHaveBeenCalledWith('done.state.m.foo');
  });

  it('should execute final child state actions first', () => {
    const actual: string[] = [];
    const machine = createMachine({
      initial: 'foo',
      states: {
        foo: {
          initial: 'bar',
          onDone: { actions: () => actual.push('fooAction') },
          states: {
            bar: {
              initial: 'baz',
              onDone: 'barFinal',
              states: {
                baz: {
                  type: 'final',
                  entry: () => actual.push('bazAction')
                }
              }
            },
            barFinal: {
              type: 'final',
              entry: () => actual.push('barAction')
            }
          }
        }
      }
    });

    interpret(machine).start();

    expect(actual).toEqual(['bazAction', 'barAction', 'fooAction']);
  });

  it('should call data expressions on nested final nodes', (done) => {
    interface Ctx {
      revealedSecret?: string;
    }

    const machine = createMachine<Ctx>({
      initial: 'secret',
      context: {
        revealedSecret: undefined
      },
      states: {
        secret: {
          initial: 'wait',
          states: {
            wait: {
              on: {
                REQUEST_SECRET: 'reveal'
              }
            },
            reveal: {
              type: 'final',
              output: {
                secret: () => 'the secret'
              }
            }
          },
          onDone: {
            target: 'success',
            actions: assign({
              revealedSecret: ({ event }) => {
                return event.output.secret;
              }
            })
          }
        },
        success: {
          type: 'final'
        }
      }
    });

    const service = interpret(machine);
    service.subscribe({
      complete: () => {
        expect(service.getSnapshot().context).toEqual({
          revealedSecret: 'the secret'
        });
        done();
      }
    });
    service.start();

    service.send({ type: 'REQUEST_SECRET' });
  });

  it("should only call data expression once when entering root's final state", () => {
    const spy = jest.fn();
    const machine = createMachine({
      initial: 'start',
      states: {
        start: {
          on: {
            FINISH: 'end'
          }
        },
        end: {
          type: 'final',
          output: spy
        }
      }
    });

    const service = interpret(machine).start();
    service.send({ type: 'FINISH', value: 1 });
    expect(spy).toBeCalledTimes(1);
  });
});
