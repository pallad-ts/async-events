import {assertEventName} from "@src/utils";

describe('assertEventName', () => {
	it('cannot be blank', () => {
		expect(() => {
			assertEventName('  ');
		})
			.toThrowError(/cannot be blank/);
	});

	it('can contain only subset of characters: %s', () => {
		expect(() => {
			assertEventName('%som');
		})
			.toThrowError(/Invalid event name format/);
	});
});
