import {Module} from "@src/Module";
import {EventSubscriberService, references} from "@src/index";
import {EVENT_DISPATCHER} from "@src/references";
import * as sinon from "sinon";

import {Event, EventSubscriber} from "@pallad/async-events";
import {createContainer, Definition} from "@pallad/container";
import {Engine, StandardActions} from "@pallad/modules";

import {StubEventDispatcher} from "./stubs/StubEventDispatcher";

class Foo extends Event.createClass("foo") {
}

describe("Module", () => {
	function setup(module: Module) {
		const container = createContainer();
		const engine = new Engine({container});

		engine.registerModule(module);
		return {engine, container, module};
	}

	it("simple integration", async () => {
		@EventSubscriberService()
		class Subscriber extends EventSubscriber {
			foo() {
			}
		}

		@EventSubscriberService()
		class Subscriber2 extends EventSubscriber {
			foo() {
			}
		}

		const eventDispatcher = sinon.createStubInstance(StubEventDispatcher);
		const {engine, container} = setup(new Module(eventDispatcher));

		container.registerDefinition(Definition.fromClassWithDecorator(Subscriber))
			.registerDefinition(Definition.fromClassWithDecorator(Subscriber2));

		await engine.runAction(StandardActions.INITIALIZATION);
		await engine.runAction(StandardActions.APPLICATION_START);

		await container.resolve(EVENT_DISPATCHER);

		sinon.assert.calledTwice(eventDispatcher.registerEventSubscriber);
		sinon.assert.calledWith(eventDispatcher.registerEventSubscriber, sinon.match.instanceOf(Subscriber));
		sinon.assert.calledWith(eventDispatcher.registerEventSubscriber, sinon.match.instanceOf(Subscriber2));
	});

	it("accessing event dispatcher from container", async () => {
		const eventDispatcher = sinon.createStubInstance(StubEventDispatcher);
		const {container, engine} = setup(new Module(eventDispatcher));

		await engine.runAction(StandardActions.INITIALIZATION);
		await engine.runAction(StandardActions.APPLICATION_START);
		const dispatcherFromContainer = await container.resolve(references.EVENT_DISPATCHER);

		expect(eventDispatcher).toBe(dispatcherFromContainer);
	});
});
