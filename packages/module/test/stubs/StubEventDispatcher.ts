import { EventDispatcherInterface } from "@pallad/async-events";

export class StubEventDispatcher implements EventDispatcherInterface {
	async dispatch() {}

	on() {}

	off() {}
}
