import * as is from "predicates";

const REGEXP = /^[a-zA-Z0-9.:_\-]+$/

const assertFormat = is.assert(is.matches(REGEXP), 'Invalid event name format. Allowed characters: a-zA-Z0-9.:_-');
const assertNotBlank = is.assert(is.notBlank, 'Event name cannot be blank');

export function assertEventName(eventName: string) {
	assertNotBlank(eventName);
	assertFormat(eventName);
}
