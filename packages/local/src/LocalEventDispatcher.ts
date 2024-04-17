import { setImmediate } from "timers";

import {
	DeadEventsEventDispatcherInterface,
	EventDispatcherInterface,
	EventInterface,
	EventNames,
	Listener,
	utils,
} from "@pallad/async-events";

export class LocalEventDispatcher
	implements EventDispatcherInterface, DeadEventsEventDispatcherInterface
{
	private eventToListeners = new Map<string, Set<Listener>>();
	private allEventsListeners = new Set<Listener>();
	private deadEventListeners = new Set<Listener>();

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

	async dispatch(event: EventInterface) {
		if (this.options.useDeferredDispatch) {
			setImmediate(this.dispatchRun, event);
		} else {
			await this.dispatchRun(event);
		}
	}

	private async dispatchRun(event: EventInterface) {
		let listeners = this.getListenersForEvent(event.eventName);

		if (listeners.size === 0) {
			listeners = this.deadEventListeners;
		}

		await Promise.all(
			Array.from(listeners.values()).map(listener => {
				return listener(event);
			})
		);
	}

	private getListenersForEvent(eventName: string): Set<Listener> {
		return new Set(
			([] as Listener[]).concat(
				Array.from(this.getListenersForEventName(eventName)),
				Array.from(this.allEventsListeners)
			)
		);
	}

	private getListenersForEventName(eventName: string): Set<Listener> {
		const listeners = this.eventToListeners.get(eventName);
		return listeners ?? new Set();
	}

	on(listener: Listener, eventNames?: EventNames) {
		const finalEventNames = utils.computeEventNames(eventNames);

		if (finalEventNames === undefined) {
			this.allEventsListeners.add(listener);
		} else {
			for (const eventName of finalEventNames) {
				let currentListeners = this.eventToListeners.get(eventName);
				if (!currentListeners) {
					currentListeners = new Set();
					this.eventToListeners.set(eventName, currentListeners);
				}

				currentListeners.add(listener);
			}
		}
	}

	off(listener: Listener, eventNames?: EventNames) {
		const finalEventNames = utils.computeEventNames(eventNames);
		if (finalEventNames === undefined) {
			this.removeFromAllEventsListeners(listener);
		}
		this.removeFromEventsListeners(listener, finalEventNames);
	}

	private removeFromAllEventsListeners(listener: Listener) {
		this.allEventsListeners.delete(listener);
	}

	private removeFromEventsListeners(listener: Listener, eventNames?: string[] | undefined) {
		const eventNamesToSearch = eventNames ?? this.eventToListeners.keys();

		for (const eventName of eventNamesToSearch) {
			const listeners = this.eventToListeners.get(eventName);
			if (listeners) {
				listeners.delete(listener);
				if (listeners.size === 0) {
					this.eventToListeners.delete(eventName);
				}
			}
		}
	}

	onDeadEventListener(listener: Listener) {
		this.deadEventListeners.add(listener);
	}

	offDeadEventListener(listener: Listener) {
		this.deadEventListeners.delete(listener);
	}
}

export namespace LocalEventDispatcher {
	export interface Options {
		useDeferredDispatch: boolean;
	}
}
