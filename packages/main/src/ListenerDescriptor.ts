import {Listener} from "./Listener";
import {EventNames} from "./EventNames";

export interface ListenerDescriptor {
	listener: Listener;
	events: EventNames | undefined;
}
