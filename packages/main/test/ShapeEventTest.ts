import { ShapeEvent } from "@src/ShapeEvent";

describe("ShapeEvent", () => {
	class Foo extends ShapeEvent.create("foo") {}

	describe("creating", () => {
		it("throw an error if event name is invalid", () => {
			expect(() => {
				ShapeEvent.create("  ");
			}).toThrowError("cannot be blank");
		});

		it("event created from shaped class contains provided event name", () => {
			expect(new Foo()).toHaveProperty("eventName", "foo");
		});
	});

	describe("checking type", () => {
		it("shape class is type of Shape", () => {
			expect(ShapeEvent.Shape.isType(Foo)).toBe(true);
		});
	});
});
