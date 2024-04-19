import { Event } from "@src/Event";
import { computeEventNameListFromClassList } from "@src/utils";

describe("computeEventNameListFromClassList", () => {
	class C1 extends Event.createClass("C1") {}

	class C2 extends Event.createClass("C2") {}

	it("extracts shape events names", () => {
		expect(computeEventNameListFromClassList([C1, C2])).toEqual(new Set(["C1", "C2"]));
	});

	it("single values are transformed into arrays", () => {
		expect(computeEventNameListFromClassList(C1)).toEqual(new Set(["C1"]));
		expect(computeEventNameListFromClassList(C2)).toEqual(new Set(["C2"]));
	});
});
