import { EventSubscriber } from "./EventSubscriber";

export interface EventSubscriberEventDispatcherInterface {
	/**
	 * Register object that defines event listeners within it
	 */
	registerEventSubscriber(subscriber: EventSubscriber): void | Promise<void>;

	unregisterEventSubscriber(subscriber: EventSubscriber): void | Promise<void>;
}
