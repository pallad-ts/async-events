import {
	EventDispatcherInterface,
	StartStopEventDispatcherInterface,
	EventSubscriberEventDispatcherInterface,
} from "@pallad/async-events";
import { Container, onActivation, Definition } from "@pallad/container";
import { Module as _Module, StandardActions } from "@pallad/modules";

import { eventSubscriberAnnotation } from "./decorators";
import { EVENT_DISPATCHER } from "./references";

export class Module extends _Module<{ container: Container }> {
	constructor(private eventDispatcher: Module.DispatcherFactory | Module.EventDispatcher) {
		super("@pallad/async-events/module");
	}

	init() {
		this.registerAction(StandardActions.INITIALIZATION, ({ container }) => {
			container.registerDefinition(
				Definition.useFactory(() => {
					const dispatcher = this.eventDispatcher;
					if (dispatcher instanceof Function) {
						return dispatcher();
					}
					return dispatcher;
				}, EVENT_DISPATCHER).annotate(
					onActivation(async function (
						this: Container,
						dispatcher: Module.EventDispatcher
					) {
						for (const [, subscriber] of await this.resolveByAnnotation(
							eventSubscriberAnnotation.predicate
						)) {
							dispatcher.registerEventSubscriber(subscriber);
						}

						return dispatcher;
					})
				)
			);
		});

		this.registerAction(StandardActions.APPLICATION_START, async ({ container }) => {
			const eventDispatcher = await container.resolve<
				Module.EventDispatcher & Partial<StartStopEventDispatcherInterface>
			>(EVENT_DISPATCHER);
			if (eventDispatcher.start) {
				await eventDispatcher.start();
			}
		});
		this.registerAction(StandardActions.APPLICATION_STOP, async ({ container }) => {
			const eventDispatcher = await container.resolve<
				Module.EventDispatcher & Partial<StartStopEventDispatcherInterface>
			>(EVENT_DISPATCHER);
			if (eventDispatcher.stop) {
				await eventDispatcher.stop();
			}
		});
	}
}

export namespace Module {
	export type EventDispatcher = EventSubscriberEventDispatcherInterface &
		EventDispatcherInterface;
	export type DispatcherFactory = () => Promise<EventDispatcher> | EventDispatcher;
}
