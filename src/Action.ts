export type ActionType = `${string}::${string}::${string}`;

export type Action<T extends ActionType> = { type: T };
