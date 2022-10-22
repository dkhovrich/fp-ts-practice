import { option, optionT, task } from 'fp-ts';
import { pipe } from 'fp-ts/function';

/**
 * Monad transformers are used when we want to do a fusion of several monads to utilise them in our computations.
 * Example: our monadic function needs to be async (Task), can "throw exceptions" (Either), and wants to "access
 * globals" (Reader). We could create our own ad-hoc version of ReaderTaskEither by using two monad transformers atop
 * the third monad.
 */

/**
 * A simple example — TaskOption. Imagine we have a `Task<A>` — an async computation which never fails and produces
 * a value of type `A`. Now we want to introduce a semantics of "nullability" to that computation, and turn it into
 * `Task<Option<A>>`. But we don't want to manually unwrap all layers one by one in our monadic chains like this:
 */

// Consider these to be library functions — we cannot change them:
const getN = task.of(42);

const program1 = pipe(
  getN,
  task.map(option.of),
  task.chain(maybeN =>
    pipe(
      maybeN,
      option.chain(n => (n % 2 === 0 ? option.some('Awesome') : option.none)),
      task.of
    )
  ),
  task.map(option.map(s => `${s}!`))
);

// We can write the same program manually to avoid using curried functions:
// option.Monad.chain(o => option.Functor.map(o, a => ....))

/**
 * Instead we want to "access" the concrete value of type `A` directly in chains:
 */
export const none = optionT.zero(task.Pointed);
export const some = optionT.some(task.Pointed);

export const map = optionT.map(task.Functor);
export const chain = optionT.chain(task.Monad);

export const liftTask = optionT.fromF(task.Functor);
export const liftOption = optionT.fromOptionK(task.Pointed); // to convert Option<A> into Task<Option<A>>

// Now we can write our programs using these constructs:
const program2 = pipe(
  liftTask(getN),
  chain(n => (n % 2 === 0 ? some('Awesome') : none<string>())),
  map(s => `${s}!`)
);

// Now we can evaluate this program:
void (async () => {
  const result1 = await program1();
  console.log(result1); // => { _tag: 'Some', value: 'Awesome!' }

  const result2 = await program2();
  console.log(result2); // => { _tag: 'Some', value: 'Awesome!' }
})();
