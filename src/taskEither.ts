import { pipe } from "fp-ts/function";
import { task, eitherT } from "fp-ts";

const getN = task.of(42);

export const left = eitherT.left(task.Pointed);
export const right = eitherT.right(task.Pointed);
export const rightF = eitherT.rightF(task.Functor);

export const map = eitherT.map(task.Functor);
export const mapLeft = eitherT.mapLeft(task.Functor);
const bimap = eitherT.bimap(task.Functor);
export const chain = eitherT.chain(task.Monad);

const program1 = pipe(
  rightF(getN),
  chain((n) => (n % 2 === 0 ? right(n) : left(new Error("Invalid number")))),
  map((n) => `${n}!`)
);

const program2 = pipe(
  rightF(getN),
  chain((n) => (n % 2 === 0 ? right(n) : left("Invalid number"))),
  bimap(
    (error) => new Error(error),
    (n) => `${n}`!
  )
);

(async () => {
  const result1 = await program1();
  console.log(result1);

  const result2 = await program2();
  console.log(result2);
})();
