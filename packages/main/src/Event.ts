import { EventInterface } from "./EventInterface";
import { assertEventName } from "./utils";

export class Event<TName extends string = string> implements EventInterface<TName> {
	constructor(
		public eventName: TName,
		extraProperties?: Object
	) {
		assertEventName(this.eventName);

		if (extraProperties && "eventName" in extraProperties) {
			throw new Error('Property "eventName" is prohibited in extraProperties');
		}

		Object.assign(this, extraProperties);
	}
}
