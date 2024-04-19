import { Event } from "./Event";

export interface Listener<TEvent extends Event<any>> {
	(event: TEvent): Promise<void> | void;
}
