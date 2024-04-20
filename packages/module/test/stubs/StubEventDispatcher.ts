import { undefined } from "predicates";

import {
	EventDispatcherInterface,
	EventSubscriber,
	EventSubscriberEventDispatcherInterface,
} from "@pallad/async-events";

export class StubEventDispatcher
	implements EventDispatcherInterface, EventSubscriberEventDispatcherInterface
{
	async dispatch() {}

	on() {}

	off() {}

	registerEventSubscriber(subscriber: EventSubscriber): void | Promise<void> {
	}

	unregisterEventSubscriber(subscriber: EventSubscriber): void | Promise<void> {
	}
}
