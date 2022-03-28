import {DecoratedListenerDescriptor} from "./DecoratedListenerDescriptor";
import {EventNames, ListenerDescriptor} from "@pallad/async-events";
import * as is from 'predicates'
import 'reflect-metadata';

const LISTENERS_KEY = '@pallad/async-events/listeners';


export function addDecoratedListenerDescriptorToTarget(target: Object, methodName: string | symbol, events: EventNames | undefined) {
	let listeners = getDecoratedListenersDescriptorsForTarget(target);
	if (!listeners) {
		listeners = new Set();
		Reflect.defineMetadata(LISTENERS_KEY, listeners, target);
	}

	listeners.add({
		methodName,
		events
	});
}

export function getDecoratedListenersDescriptorsForTarget(target: Object): Set<DecoratedListenerDescriptor> | undefined {
	return Reflect.getMetadata(LISTENERS_KEY, target);
}


export function getListenersDescriptorsForSubscriber(subscriber: Object): ListenerDescriptor[] {
	const listeners = getDecoratedListenersDescriptorsForTarget(Object.getPrototypeOf(subscriber));
	if (listeners) {
		const descriptors = [] as ListenerDescriptor[];
		for (const {methodName, events} of listeners) {
			const method = (subscriber as any)[methodName];
			if (!is.func(method)) {
				// eslint-disable-next-line no-console
				throw new Error(`Method "${methodName.toString()}" is not a function`);
			}
			descriptors.push({
				listener: method.bind(subscriber),
				events
			});
		}
		return descriptors;
	}

	return [];
}
