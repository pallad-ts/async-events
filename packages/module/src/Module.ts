import {Module as _Module, StandardActions} from "@pallad/modules";
import {Container, onActivation} from "alpha-dic";
import {EVENT_DISPATCHER} from "./references";
import {ListenerDescriptor, EventDispatcherInterface, MultiListenersEventDispatcherInterface, StartStopEventDispatcherInterface} from "@pallad/async-events";
import {eventSubscriberAnnotation} from "./annotations";
import {getListenersDescriptorsForSubscriber} from "./decorators/helpers";

async function registerListenersDescriptorsToEventDispatcher(
	eventDispatcher: EventDispatcherInterface & Partial<MultiListenersEventDispatcherInterface>,
	listenersDescriptors: ListenerDescriptor[]
) {
	if (eventDispatcher.onMany) {
		await eventDispatcher.onMany(listenersDescriptors);
	} else {
		for (const listenerDescriptor of listenersDescriptors) {
			await eventDispatcher.on(listenerDescriptor.listener, listenerDescriptor.events);
		}
	}
}

export class Module extends _Module<{ container: Container }> {
	constructor(private eventDispatcher: EventDispatcherInterface | Module.DispatcherFactory) {
		super('@pallad/async-events/module');
	}

	init() {
		this.registerAction(StandardActions.INITIALIZATION, ({container}) => {
			container.definitionWithFactory(EVENT_DISPATCHER, () => {
				const dispatcher = this.eventDispatcher;
				if (dispatcher instanceof Function) {
					return dispatcher()
				}
				return dispatcher;
			})
				.annotate(onActivation(async function (this: Container, dispatcher: EventDispatcherInterface) {
					const subscribers = await this.getByAnnotation(eventSubscriberAnnotation.predicate);
					let listenersDescriptors = [] as ListenerDescriptor[];
					for (const subscriber of subscribers) {
						listenersDescriptors = listenersDescriptors.concat(getListenersDescriptorsForSubscriber(subscriber));
					}

					await registerListenersDescriptorsToEventDispatcher(dispatcher, listenersDescriptors);
					return dispatcher;
				}))
		});

		this.registerAction(StandardActions.APPLICATION_START, async ({container}) => {
			const eventDispatcher = await container.get<EventDispatcherInterface & Partial<StartStopEventDispatcherInterface>>(EVENT_DISPATCHER);
			if (eventDispatcher.start) {
				await eventDispatcher.start();
			}
		})
		this.registerAction(StandardActions.APPLICATION_STOP, async ({container}) => {
			const eventDispatcher = await container.get<EventDispatcherInterface & Partial<StartStopEventDispatcherInterface>>(EVENT_DISPATCHER);
			if (eventDispatcher.stop) {
				await eventDispatcher.stop();
			}
		});
	}
}

export namespace Module {
	export type DispatcherFactory = () => Promise<EventDispatcherInterface> | EventDispatcherInterface
}
