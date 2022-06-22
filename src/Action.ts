export type ActionClass = string;
export type ActionComponent = string;
export type ActionVerb = string;
export type ActionType = `${ActionClass}::${ActionComponent}::${ActionVerb}`;
export type ActionParts = [ActionClass, ActionComponent, ActionVerb];
export type Action<T extends ActionType> = { type: T };

export function actionParts(type: ActionType): ActionParts {
  return type.split("::") as ActionParts;
}
