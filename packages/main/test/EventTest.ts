import { Event } from "@src/Event";
import * as faker from "faker";

describe("Event", () => {
	const EVENT_NAME = faker.random.alphaNumeric(10);

	describe("creating", () => {
		it("simple event", () => {
			const event = new Event(EVENT_NAME);
			expect(event).toHaveProperty("eventName", EVENT_NAME);
		});

		it("event with extra properties", () => {
			const extraProperties = {
				property1: faker.random.alphaNumeric(10),
				property2: faker.random.alphaNumeric(10),
			};

			const event = new Event(EVENT_NAME, extraProperties);
			expect(event).toMatchObject({
				eventName: EVENT_NAME,
				...extraProperties,
			});
		});

		it('using "eventName" in extraProperties throws an error', () => {
			expect(() => {
				new Event("event-name", { eventName: "someProperty" });
			}).toThrow(/prohibited in extraProperties/);
		});

		it("throw an error if event name is blank", () => {
			expect(() => {
				new Event("  ");
			}).toThrowError(/cannot be blank/);
		});
	});
});
