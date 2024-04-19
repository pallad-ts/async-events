import { TypeCheck } from "@pallad/type-check";

import { assertEventName } from "./utils";

const typeCheck = new TypeCheck<Event>("@pallad/async-events/ShapeEvent.Shape");

export class Event<TName extends string = string> {
	constructor(readonly eventName: TName) {
		typeCheck.assign(this);
	}

	static isType = typeCheck.isType;

	static createClass<T extends string>(eventName: T) {
		assertEventName(eventName);
		return class extends Event<T> {
			static eventName = eventName;

			constructor() {
				super(eventName);
			}
		};
	}
}
