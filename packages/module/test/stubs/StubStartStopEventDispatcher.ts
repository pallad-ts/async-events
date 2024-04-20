import { EventDispatcherInterface, StartStopEventDispatcherInterface } from "@pallad/async-events";

export class StubStartStopEventDispatcher
	implements EventDispatcherInterface, StartStopEventDispatcherInterface
{
	async dispatch() {}

	async start() {}

	async stop() {}

	on() {}

	off() {}
}
