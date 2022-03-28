import {ShapeEvent} from "../ShapeEvent";
import {EventNames} from "../EventNames";
import {assertEventName} from "./assertEventName";

export function computeEventNames(events?: EventNames): string[] | undefined {
	if (!events) {
		return undefined;
	}

	const eventsNames = (Array.isArray(events) ? events : [events])
		.map(x => ShapeEvent.Shape.isType(x) ? x.eventName : x)

	for (const eventName of eventsNames) {
		assertEventName(eventName);
	}

	return eventsNames.length > 0 ? eventsNames : undefined;
}
