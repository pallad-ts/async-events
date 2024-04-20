import { TypeCheck } from "@pallad/type-check";

import { Event } from "./Event";
import { EventClass } from "./EventClass";
import { Listener } from "./Listener";
import { ListenerDescriptor } from "./ListenerDescriptor";
import { computeEventNameListFromClassList } from "./utils";

const typeCheck = new TypeCheck<EventSubscriber>("@pallad/async-events/EventSubscriber");

export class EventSubscriber extends typeCheck.clazz {
	private listenerList: ListenerDescriptor[] = [];

	get listenerDescriptorList(): ListenerDescriptor[] {
		return this.listenerList;
	}

	addListener<T extends EventClass<Event<string>>>(
		eventClassList: T | T[],
		listener: Listener<InstanceType<T>>
	) {
		const finalEventNameList = computeEventNameListFromClassList(eventClassList);

		this.listenerList.push({
			listener: listener.bind(this),
			eventNameList: finalEventNameList,
		});

		return this;
	}
}
