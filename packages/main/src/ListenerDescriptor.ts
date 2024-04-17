import { EventNames } from "./EventNames";
import { Listener } from "./Listener";

export interface ListenerDescriptor {
	listener: Listener;
	events: EventNames | undefined;
}
