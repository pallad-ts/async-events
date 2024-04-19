import { Event } from "./Event";
import { Listener } from "./Listener";

export interface DeadEventsEventDispatcherInterface {
	/**
	 * Registers a listener that got notified once there is no listeners registered for event
	 */
	onDeadEventListener(listener: Listener<Event<string>>): Promise<void> | void;

	/**
	 * Removes listener register via `onDeadEventListener`
	 */
	offDeadEventListener(listener: Listener<Event<string>>): Promise<void> | void;
}
