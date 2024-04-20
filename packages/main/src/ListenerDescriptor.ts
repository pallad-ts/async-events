import { Listener } from "./Listener";

export interface ListenerDescriptor {
	listener: Listener<any>;
	eventNameList: Set<string>;
}
