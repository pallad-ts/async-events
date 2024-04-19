import { Listener } from "./Listener";

export interface ListenerDescriptor {
	listener: Listener<any>;
	events: string | string[] | undefined;
}
