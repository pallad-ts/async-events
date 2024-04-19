import { Event } from "@src/Event";

describe("Event", () => {
	class Foo extends Event.createClass("FooEvent") {
		constructor(readonly foo: string) {
			super();
		}
	}

	class Foo2 extends Event {
		constructor(readonly foo: string) {
			super("Foo2Event");
		}
	}

	it("creates event with name", () => {
		const event = new Foo("bar");
		const event2 = new Foo2("bar");
		expect(event).toMatchObject({ eventName: "FooEvent", foo: "bar" });
		expect(event2).toMatchObject({ eventName: "Foo2Event", foo: "bar" });
	});

	it("isType checks whether object is an event", () => {
		expect(Event.isType(new Foo("bar"))).toBe(true);
		expect(Event.isType(new Foo2("bar"))).toBe(true);
		expect(Event.isType({})).toBe(false);
	});
});
