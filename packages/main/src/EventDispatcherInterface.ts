import {EventInterface} from "./EventInterface";
import {Listener} from "./Listener";
import {EventNames} from "./EventNames";

export interface EventDispatcherInterface<
	TEventMap extends Record<string, EventInterface> = Record<
		string,
		EventInterface
	>,
> {
	dispatch(event: EventInterface): Promise<void>;

	/**
	 * Registers listener that gets notified on given event name.
	 *
	 * If event names are empty then listens on all events
	 */
	on<TEventNameOrType>(
		eventNames: EventNames,
		listener: Listener,
	): Promise<void> | void;

	onAllEvents(listener: Listener): Promise<void> | void;

	/**
	 * Unregisters listener
	 * If event names are not provided then unregisters from global and event listeners
	 */
	off(eventNames: EventNames, listener: Listener): Promise<void> | void;

	offAllEvents(listener: Listener): Promise<void> | void;
}

export namespace EventDispatcherInterface {
	export type EventInterfaceForName<
		TEventMap extends Record<string, EventInterface>,
		TEventName extends keyof TEventMap,
	> = TEventMap[TEventName];


	export type EventInterfaceForInput<TEventMap extends Record<string, EventInterface>, T extends string | EventInterface> =
}
