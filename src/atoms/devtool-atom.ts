import { atom, PrimitiveAtom } from 'jotai';
import { atomFamily } from 'jotai/utils';
import deepEqual from 'fast-deep-equal/es6';

type Config = {
  instanceID?: number;
  name?: string;
  serialize?: boolean;
  actionCreators?: any;
  latency?: number;
  predicate?: any;
  autoPause?: boolean;
};

type Message = {
  type: string;
  payload?: any;
  state?: any;
};

type ConnectionResult = {
  subscribe: (dispatch: any) => () => void;
  unsubscribe: () => void;
  send: (action: string, state: any) => void;
  init: (state: any) => void;
  error: (payload: any) => void;
};

type Extension = {
  connect: (options?: Config) => ConnectionResult;
};

const atomMap = new WeakMap();

export const IS_DEVTOOL_ENV =
  typeof process === 'object' &&
  process.env.NODE_ENV === 'development' &&
  typeof window !== 'undefined' &&
  '__REDUX_DEVTOOLS_EXTENSION__' in window;

const getExtension = (): Extension => {
  try {
    return (window as any).__REDUX_DEVTOOLS_EXTENSION__ as Extension;
  } catch (e) {
    throw new Error('Please install or enable Redux Devtools');
  }
};

type DevtoolsAtom = ConnectionResult & { shouldInit?: boolean };

export const devtoolAtom = atomFamily<PrimitiveAtom<any>, void>(
  anAtom =>
    atom(get => {
      if (!IS_DEVTOOL_ENV) return;
      const isWriteable = !!anAtom.write;
      const isTimeTravelingAtom = atom(false);
      const lastValueAtom = atom(undefined);
      const atomName = anAtom.debugLabel || anAtom.toString();
      const extension = getExtension();
      const cached = atomMap.get(anAtom);
      const devtools: DevtoolsAtom = cached || extension.connect({ name: atomName });

      if (!cached) {
        devtools.shouldInit = true;
        atomMap.set(anAtom, devtools);
      } else if (cached.shouldInit) {
        devtools.shouldInit = false;
        atomMap.set(anAtom, devtools);
      }

      let unsubscribe: undefined | (() => void);

      const subscribeAtom = atom<void, { type: 'mount' }>(
        get => {
          if (isWriteable) {
            const isTimeTraveling = get(isTimeTravelingAtom);
            if (!isTimeTraveling)
              devtools.send(`${atomName} - ${new Date().toLocaleString()}`, get(anAtom));
          }
        },
        (get, set, update) => {
          const listener = (message: Message) => {
            if (message.type === 'DISPATCH' && message.state) {
              if (
                message.payload?.type === 'JUMP_TO_ACTION' ||
                message.payload?.type === 'JUMP_TO_STATE'
              ) {
                set(isTimeTravelingAtom, true);
              }
              if (message.payload?.type !== 'TOGGLE_ACTION') set(anAtom, JSON.parse(message.state));
            } else if (message.type === 'DISPATCH' && message.payload?.type === 'COMMIT') {
              devtools.init(get(lastValueAtom));
            } else if (message.type === 'DISPATCH' && message.payload?.type === 'IMPORT_STATE') {
              const computedStates = message.payload.nextLiftedState?.computedStates || [];
              computedStates.forEach(({ state }: { state: any }, index: number) => {
                if (index === 0) {
                  devtools?.init(state);
                } else {
                  set(anAtom, state);
                }
              });
            }
          };

          switch (update.type) {
            case 'mount': {
              unsubscribe = isWriteable ? devtools.subscribe(listener) : undefined;
              if (devtools.shouldInit) devtools.init(get(anAtom));
            }
          }
        }
      );

      subscribeAtom.onMount = setAtom => {
        setAtom({ type: 'mount' });
        return () => unsubscribe?.();
      };

      get(subscribeAtom);
      if (!isWriteable) {
        devtools.send(`${atomName} - ${new Date().toLocaleString()}`, get(anAtom));
      }
    }),
  deepEqual
);
