import {EventInterface} from "./EventInterface";
import {Listener} from "./Listener";
import {EventNames} from "./EventNames";

export interface EventDispatcherInterface {
	dispatch(event: EventInterface): Promise<void>;

	/**
	 * Registers listener that gets notified on given event name.
	 *
	 * If event names are empty then listens on all events
	 */
	on(listener: Listener, eventNames?: EventNames): Promise<void> | void;

	/**
	 * Unregisters listener
	 * If event names are not provided then unregisters from global and event listeners
	 * If event names are provided the unregisters only from provided event names listeners, leaving global listener
	 */
	off(listener: Listener, eventNames?: EventNames): Promise<void> | void;
}
