import { Event } from "@src/Event";
import { EventSubscriber } from "@src/EventSubscriber";

describe("EventSubscriber", () => {
	class FooEvent extends Event.createClass("Foo") {}

	it("adding listener automatically binds it to the instance", () => {
		expect.assertions(1);
		class EventSubscriberTest extends EventSubscriber {
			constructor() {
				super();
				this.addListener(FooEvent, this.method);
			}

			method() {
				expect(this).toBeInstanceOf(EventSubscriberTest);
			}
		}

		const subscriber = new EventSubscriberTest();

		for (const listenerDescriptor of subscriber.listenerDescriptorList) {
			listenerDescriptor.listener(new FooEvent());
		}
	});
});
