import { createMachine, interpret } from '../src/index.ts';
import { stateIn } from '../src/guards.ts';

describe('transition "in" check', () => {
  it('should transition if string state path matches current state value', () => {
    const machine = createMachine({
      type: 'parallel',
      states: {
        a: {
          initial: 'a1',
          states: {
            a1: {
              on: {
                EVENT2: {
                  target: 'a2',
                  guard: stateIn({ b: 'b2' })
                }
              }
            },
            a2: {
              id: 'a_a2'
            }
          }
        },
        b: {
          initial: 'b2',
          states: {
            b1: {
              on: {
                EVENT: {
                  target: 'b2',
                  guard: stateIn('#a_a2')
                }
              }
            },
            b2: {
              id: 'b_b2',
              type: 'parallel',
              states: {
                foo: {
                  initial: 'foo2',
                  states: {
                    foo1: {},
                    foo2: {}
                  }
                },
                bar: {
                  initial: 'bar1',
                  states: {
                    bar1: {
                      id: 'bar1'
                    },
                    bar2: {}
                  }
                }
              }
            }
          }
        }
      }
    });
    const actorRef = interpret(machine).start();
    actorRef.send({ type: 'EVENT2' });

    expect(actorRef.getSnapshot().value).toEqual({
      a: 'a2',
      b: {
        b2: {
          foo: 'foo2',
          bar: 'bar1'
        }
      }
    });
  });

  it('should transition if state node ID matches current state value', () => {
    const machine = createMachine({
      type: 'parallel',
      states: {
        a: {
          initial: 'a1',
          states: {
            a1: {
              on: {
                EVENT3: {
                  target: 'a2',
                  guard: stateIn('#b_b2')
                }
              }
            },
            a2: {
              id: 'a_a2'
            }
          }
        },
        b: {
          initial: 'b2',
          states: {
            b1: {},
            b2: {
              id: 'b_b2',
              type: 'parallel',
              states: {
                foo: {
                  initial: 'foo2',
                  states: {
                    foo1: {},
                    foo2: {}
                  }
                },
                bar: {
                  initial: 'bar1',
                  states: {
                    bar1: {
                      id: 'bar1'
                    },
                    bar2: {}
                  }
                }
              }
            }
          }
        }
      }
    });
    const actorRef = interpret(machine).start();
    actorRef.send({ type: 'EVENT3' });

    expect(actorRef.getSnapshot().value).toEqual({
      a: 'a2',
      b: {
        b2: {
          foo: 'foo2',
          bar: 'bar1'
        }
      }
    });
  });

  it('should not transition if string state path does not match current state value', () => {
    const machine = createMachine({
      type: 'parallel',
      states: {
        a: {
          initial: 'a1',
          states: {
            a1: {
              on: {
                EVENT1: {
                  target: 'a2',
                  guard: stateIn('b.b2')
                }
              }
            },
            a2: {
              id: 'a_a2'
            }
          }
        },
        b: {
          initial: 'b1',
          states: {
            b1: {},
            b2: {
              id: 'b_b2',
              type: 'parallel',
              states: {
                foo: {
                  initial: 'foo1',
                  states: {
                    foo1: {},
                    foo2: {}
                  }
                },
                bar: {
                  initial: 'bar1',
                  states: {
                    bar1: {
                      id: 'bar1'
                    },
                    bar2: {}
                  }
                }
              }
            }
          }
        }
      }
    });
    const actorRef = interpret(machine).start();
    actorRef.send({ type: 'EVENT1' });

    expect(actorRef.getSnapshot().value).toEqual({
      a: 'a1',
      b: 'b1'
    });
  });

  it('should not transition if state value matches current state value', () => {
    const machine = createMachine({
      type: 'parallel',
      states: {
        a: {
          initial: 'a1',
          states: {
            a1: {
              on: {
                EVENT2: {
                  target: 'a2',
                  guard: stateIn({ b: 'b2' })
                }
              }
            },
            a2: {
              id: 'a_a2'
            }
          }
        },
        b: {
          initial: 'b2',
          states: {
            b1: {},
            b2: {
              id: 'b_b2',
              type: 'parallel',
              states: {
                foo: {
                  initial: 'foo2',
                  states: {
                    foo1: {},
                    foo2: {}
                  }
                },
                bar: {
                  initial: 'bar1',
                  states: {
                    bar1: {
                      id: 'bar1'
                    },
                    bar2: {}
                  }
                }
              }
            }
          }
        }
      }
    });
    const actorRef = interpret(machine).start();
    actorRef.send({ type: 'EVENT2' });

    expect(actorRef.getSnapshot().value).toEqual({
      a: 'a2',
      b: {
        b2: {
          foo: 'foo2',
          bar: 'bar1'
        }
      }
    });
  });

  it('matching should be relative to grandparent (match)', () => {
    const machine = createMachine({
      type: 'parallel',
      states: {
        a: {
          initial: 'a1',
          states: {
            a1: {},
            a2: {
              id: 'a_a2'
            }
          }
        },
        b: {
          initial: 'b2',
          states: {
            b1: {},
            b2: {
              id: 'b_b2',
              type: 'parallel',
              states: {
                foo: {
                  initial: 'foo1',
                  states: {
                    foo1: {
                      on: {
                        EVENT_DEEP: { target: 'foo2', guard: stateIn('#bar1') }
                      }
                    },
                    foo2: {}
                  }
                },
                bar: {
                  initial: 'bar1',
                  states: {
                    bar1: {
                      id: 'bar1'
                    },
                    bar2: {}
                  }
                }
              }
            }
          }
        }
      }
    });
    const actorRef = interpret(machine).start();
    actorRef.send({ type: 'EVENT_DEEP' });

    expect(actorRef.getSnapshot().value).toEqual({
      a: 'a1',
      b: {
        b2: {
          foo: 'foo2',
          bar: 'bar1'
        }
      }
    });
  });

  it('matching should be relative to grandparent (no match)', () => {
    const machine = createMachine({
      type: 'parallel',
      states: {
        a: {
          initial: 'a1',
          states: {
            a1: {},
            a2: {
              id: 'a_a2'
            }
          }
        },
        b: {
          initial: 'b2',
          states: {
            b1: {},
            b2: {
              id: 'b_b2',
              type: 'parallel',
              states: {
                foo: {
                  initial: 'foo1',
                  states: {
                    foo1: {
                      on: {
                        EVENT_DEEP: { target: 'foo2', guard: stateIn('#bar1') }
                      }
                    },
                    foo2: {}
                  }
                },
                bar: {
                  initial: 'bar2',
                  states: {
                    bar1: {
                      id: 'bar1'
                    },
                    bar2: {}
                  }
                }
              }
            }
          }
        }
      }
    });
    const actorRef = interpret(machine).start();
    actorRef.send({ type: 'EVENT_DEEP' });

    expect(actorRef.getSnapshot().value).toEqual({
      a: 'a1',
      b: {
        b2: {
          foo: 'foo1',
          bar: 'bar2'
        }
      }
    });
  });

  it('should work to forbid events', () => {
    const machine = createMachine({
      initial: 'green',
      states: {
        green: { on: { TIMER: 'yellow' } },
        yellow: { on: { TIMER: 'red' } },
        red: {
          initial: 'walk',
          states: {
            walk: {
              on: { TIMER: 'wait' }
            },
            wait: {
              on: { TIMER: 'stop' }
            },
            stop: {}
          },
          on: {
            TIMER: [
              {
                target: 'green',
                guard: stateIn({ red: 'stop' })
              }
            ]
          }
        }
      }
    });

    const actorRef = interpret(machine).start();

    actorRef.send({ type: 'TIMER' });
    actorRef.send({ type: 'TIMER' });
    actorRef.send({ type: 'TIMER' });
    expect(actorRef.getSnapshot().value).toEqual({ red: 'wait' });

    actorRef.send({ type: 'TIMER' });
    expect(actorRef.getSnapshot().value).toEqual({ red: 'stop' });

    actorRef.send({ type: 'TIMER' });
    expect(actorRef.getSnapshot().value).toEqual('green');
  });
});
