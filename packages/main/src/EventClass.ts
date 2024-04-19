import { Event } from "./Event";

export interface EventClass<T extends Event<string>> {
	eventName: T["eventName"];

	new (...args: any[]): T;
}
