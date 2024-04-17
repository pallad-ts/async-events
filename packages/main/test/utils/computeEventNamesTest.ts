import { ShapeEvent } from "@src/ShapeEvent";
import { computeEventNames } from "@src/utils";

describe("computeEventNames", () => {
	class C1 extends ShapeEvent.create("c1") {}

	class C2 extends ShapeEvent.create("c2") {}

	it("undefined if array is empty", () => {
		expect(computeEventNames([])).toBe(undefined);
	});

	it("undefined is event names are undefined", () => {
		expect(computeEventNames(undefined)).toBe(undefined);
	});

	it("extracts shape events names", () => {
		expect(computeEventNames([C1, C2])).toEqual(["c1", "c2"]);
	});

	it("single values are transformed into arrays", () => {
		expect(computeEventNames("foo")).toEqual(["foo"]);
		expect(computeEventNames(C1)).toEqual(["c1"]);
	});
});
