import {Engine, StandardActions} from "@pallad/modules";
import {createStandard} from "alpha-dic";
import {Module} from "@src/Module";
import {StubEventDispatcher} from "./stubs/StubEventDispatcher";
import * as sinon from 'sinon';
import {ShapeEvent} from "@pallad/async-events";
import {EventListener} from "@src/decorators/EventListener";
import {references} from "@src/index";
import {eventSubscriberAnnotation} from "@src/annotations";
import {EVENT_DISPATCHER} from "@src/references";

class Foo extends ShapeEvent.create('foo') {

}

describe('Module', () => {

	function setup(module: Module) {
		const container = createStandard();
		const engine = new Engine({container});

		engine.registerModule(module);
		return {engine, container, module};
	}

	it('simple integration', async () => {
		class Subscriber1 {
			@EventListener(Foo)
			foo() {

			}
		}

		class Subscriber2 {
			@EventListener(Foo)
			foo2() {

			}
		}

		const eventDispatcher = sinon.createStubInstance(StubEventDispatcher);
		const {engine, container} = setup(new Module(eventDispatcher));

		container.definitionWithValue(new Subscriber1())
			.annotate(eventSubscriberAnnotation());

		// eslint-disable-next-line @typescript-eslint/require-await
		container.definitionWithFactory(async () => {
			return new Subscriber2();
		})
			.annotate(eventSubscriberAnnotation());

		await engine.runAction(StandardActions.INITIALIZATION);
		await container.get(EVENT_DISPATCHER);

		sinon.assert.calledTwice(eventDispatcher.on);
	});

	it('accessing event dispatcher from container', async () => {
		const eventDispatcher = sinon.createStubInstance(StubEventDispatcher);
		const {container, engine} = setup(new Module(eventDispatcher));

		await engine.runAction(StandardActions.INITIALIZATION);
		const dispatcherFromContainer = await container.get(references.EVENT_DISPATCHER);

		expect(eventDispatcher)
			.toBe(dispatcherFromContainer);
	});
});
