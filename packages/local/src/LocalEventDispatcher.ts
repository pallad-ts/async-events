import { setImmediate } from "node:timers";

import {
	DeadEventsEventDispatcherInterface,
	Event,
	EventClass,
	EventDispatcherInterface,
	EventSubscriber,
	EventSubscriberEventDispatcherInterface,
	Listener,
	utils,
} from "@pallad/async-events";

export class LocalEventDispatcher
	implements
		EventDispatcherInterface,
		DeadEventsEventDispatcherInterface,
		EventSubscriberEventDispatcherInterface
{
	private eventToListenerList = new Map<string, Set<Listener<Event<string>>>>();
	private deadEventListenerList = new Set<Listener<Event<string>>>();

	static defaultOptions: LocalEventDispatcher.Options = {
		useDeferredDispatch: false,
	};

	private options: LocalEventDispatcher.Options;

	constructor(options?: LocalEventDispatcher.Options) {
		this.options = {
			...LocalEventDispatcher.defaultOptions,
			...(options || {}),
		};

		this.dispatchRun = this.dispatchRun.bind(this);
	}

	async dispatch(event: Event<string>): Promise<void> {
		if (this.options.useDeferredDispatch) {
			setImmediate(this.dispatchRun, event);
		} else {
			await this.dispatchRun(event);
		}
	}

	private async dispatchRun(event: Event<string>) {
		let listeners = this.getListenersForEventName(event.eventName);

		if (listeners.size === 0) {
			listeners = this.deadEventListenerList;
		}

		await Promise.all(
			Array.from(listeners.values()).map(listener => {
				return listener(event);
			})
		);
	}

	private getListenersForEventName(eventName: string): Set<Listener<Event<string>>> {
		const listeners = this.eventToListenerList.get(eventName);
		return listeners ?? new Set();
	}

	on<T extends EventClass<Event<string>>>(
		eventClassList: T | T[],
		listener: Listener<InstanceType<T>>
	) {
		const eventNameList = utils.computeEventNameListFromClassList(eventClassList);

		this.addListener(eventNameList, listener);
	}

	private addListener(eventNameList: Set<string>, listener: (...args: any[]) => unknown) {
		for (const eventName of eventNameList) {
			let currentListeners = this.eventToListenerList.get(eventName);
			if (!currentListeners) {
				currentListeners = new Set();
				this.eventToListenerList.set(eventName, currentListeners);
			}

			currentListeners.add(listener as Listener<any>);
		}
	}

	off<T extends EventClass<Event<string>>>(
		eventClassList: T | T[],
		listener: Listener<InstanceType<T>>
	): Promise<void> | void {
		const eventNameList = utils.computeEventNameListFromClassList(eventClassList);
		this.removeListener(eventNameList, listener);
	}

	private removeListener(eventNameList: Set<string>, listener: (...args: any[]) => unknown) {
		for (const eventName of eventNameList) {
			const listenerList = this.eventToListenerList.get(eventName);
			if (listenerList) {
				listenerList.delete(listener as Listener<any>);
				if (listenerList.size === 0) {
					this.eventToListenerList.delete(eventName);
				}
			}
		}
	}

	onDeadEventListener(listener: Listener<Event<string>>) {
		this.deadEventListenerList.add(listener);
	}

	offDeadEventListener(listener: Listener<Event<string>>) {
		this.deadEventListenerList.delete(listener);
	}

	registerEventSubscriber(subscriber: EventSubscriber) {
		for (const listenerDescriptor of subscriber.listenerDescriptorList) {
			this.addListener(listenerDescriptor.eventNameList, listenerDescriptor.listener);
		}
	}

	unregisterEventSubscriber(subscriber: EventSubscriber) {
		for (const listenerDescriptor of subscriber.listenerDescriptorList) {
			this.removeListener(listenerDescriptor.eventNameList, listenerDescriptor.listener);
		}
	}
}

export namespace LocalEventDispatcher {
	export interface Options {
		useDeferredDispatch: boolean;
	}
}
