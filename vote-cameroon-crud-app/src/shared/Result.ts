// Functional Error Handling with Either Pattern
export type Either<E, A> = Left<E> | Right<A>;

export class Left<E> {
  constructor(public readonly value: E) {}
  
  isLeft(): this is Left<E> {
    return true;
  }
  
  isRight(): this is Right<never> {
    return false;
  }
}

export class Right<A> {
  constructor(public readonly value: A) {}
  
  isLeft(): this is Left<never> {
    return false;
  }
  
  isRight(): this is Right<A> {
    return true;
  }
}

export const left = <E>(value: E): Either<E, never> => new Left(value);
export const right = <A>(value: A): Either<never, A> => new Right(value);

// Result type alias for convenience
export type Result<E, A> = Either<E, A>;

// Utility functions for working with Either
export const isLeft = <E, A>(either: Either<E, A>): either is Left<E> => either.isLeft();
export const isRight = <E, A>(either: Either<E, A>): either is Right<A> => either.isRight();

export const fold = <E, A, B>(
  onLeft: (error: E) => B,
  onRight: (value: A) => B
) => (either: Either<E, A>): B => {
  return either.isLeft() ? onLeft(either.value) : onRight(either.value);
};

export const map = <E, A, B>(
  fn: (value: A) => B
) => (either: Either<E, A>): Either<E, B> => {
  return either.isLeft() ? either : right(fn(either.value));
};

export const flatMap = <E, A, B>(
  fn: (value: A) => Either<E, B>
) => (either: Either<E, A>): Either<E, B> => {
  return either.isLeft() ? either : fn(either.value);
};
