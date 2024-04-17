import { EventNames } from "@pallad/async-events";

export interface DecoratedListenerDescriptor {
	methodName: string | symbol;
	events: EventNames | undefined;
}
