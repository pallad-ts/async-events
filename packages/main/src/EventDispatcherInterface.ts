import { Event } from "./Event";
import { EventClass } from "./EventClass";
import { Listener } from "./Listener";

export interface EventDispatcherInterface {
	dispatch(event: Event): Promise<void>;

	/**
	 * Registers listener that gets notified on given event name.
	 */
	on<T extends EventClass<Event<string>>>(
		eventClassList: T | T[],
		listener: Listener<InstanceType<T>>
	): Promise<void> | void;

	/**
	 * Unregisters listener
	 */
	off<T extends EventClass<Event<string>>>(
		eventClassList: T | T[],
		listener: Listener<InstanceType<T>>
	): Promise<void> | void;
}
