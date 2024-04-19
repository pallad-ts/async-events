import { Event } from "../Event";
import { EventClass } from "../EventClass";
import { assertEventName } from "./assertEventName";

export function computeEventNameListFromClassList(
	events: EventClass<Event<string>> | Array<EventClass<Event<string>>>
): Set<string> {
	const eventNameList = (Array.isArray(events) ? events : [events]).map(x => x.eventName);

	for (const eventName of eventNameList) {
		assertEventName(eventName);
	}
	return new Set(eventNameList);
}
