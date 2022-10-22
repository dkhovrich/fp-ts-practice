import { pipe } from 'fp-ts/function';
import type { option } from 'fp-ts';
import { readerT, task, optionT } from 'fp-ts';
import type { Functor1 } from 'fp-ts/Functor';
import type { Monad1 } from 'fp-ts/Monad';

export const none = optionT.zero(task.Pointed);
export const some = optionT.some(task.Pointed);

export const mapTO = optionT.map(task.Functor);
export const apTO = optionT.ap(task.ApplyPar);
export const chainTO = optionT.chain(task.Monad);

export type MyTaskOption<A> = task.Task<option.Option<A>>;

declare module 'fp-ts/lib/HKT' {
  interface URItoKind<A> {
    readonly MyTaskOption: MyTaskOption<A>;
  }
}

const TaskOptionPointed = {
  URI: 'MyTaskOption' as const,
  of: some,
};

const TaskOptionFunctor: Functor1<'MyTaskOption'> = {
  ...TaskOptionPointed,
  map: (fa, f) => mapTO(f)(fa),
};

const TaskOptionMonad: Monad1<'MyTaskOption'> = {
  ...TaskOptionPointed,
  ...TaskOptionFunctor,
  ap: (fab, fa) => apTO(fa)(fab),
  chain: (fa, f) => chainTO(f)(fa),
};

// ReaderTaskOption:
export const of = readerT.of(TaskOptionPointed);
export const map = readerT.map(TaskOptionFunctor);
export const chain = readerT.chain(TaskOptionMonad);

const program1 = pipe(
  of(42),
  chain(n => of(`${n}!`))
);

void (async () => {
  const result = await program1(undefined)();
  console.log(result); // { _tag: 'Some', value: '42!' }
})();
