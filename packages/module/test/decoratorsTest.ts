import {Event, ShapeEvent} from "@pallad/async-events";
import {EventListener} from "@src/decorators/EventListener";
import * as sinon from 'sinon';
import {getListenersDescriptorsForSubscriber} from "@src/decorators/helpers";
import {GlobalEventListener} from "@src/decorators/GlobalEventListener";

describe('decorators', () => {
	class FooEvent extends ShapeEvent.create('foo') {

	}

	class BarEvent extends ShapeEvent.create('bar') {

	}

	class SimpleEvent extends Event {
		constructor() {
			super('simple');
		}
	}

	it('extract listeners from event subscriber and binds them to object', () => {
		class Subscriber {
			@EventListener(FooEvent)
			onFoo() {

			}

			@EventListener(BarEvent)
			onBar() {

			}
		}

		const subscriber = sinon.createStubInstance(Subscriber);
		const listeners = getListenersDescriptorsForSubscriber(subscriber);

		const event = new Event('test');
		for (const listener of listeners) {
			listener.listener(event);
		}

		sinon.assert.calledOn(subscriber.onFoo, subscriber);
		sinon.assert.calledOn(subscriber.onBar, subscriber);

		expect(listeners[0].events).toEqual([FooEvent]);
		expect(listeners[1].events).toEqual([BarEvent]);
	});

	it('allows to register multiple events to listener', () => {
		class Subscriber {
			@EventListener(FooEvent, BarEvent)
			listener() {

			}
		}

		const subscriber = sinon.createStubInstance(Subscriber);
		const listeners = getListenersDescriptorsForSubscriber(subscriber);

		expect(listeners[0].events).toEqual([BarEvent, FooEvent]);
	});

	it('fails if decorated property is not a function', () => {
		class Subscriber {
			// @ts-ignore
			@EventListener(FooEvent, BarEvent)
			iWillFail = 'test';

			someFunc() {

			}
		}

		const subscriber = sinon.createStubInstance(Subscriber);
		expect(() => {
			getListenersDescriptorsForSubscriber(subscriber);
		})
			.toThrowError('Method "iWillFail" is not a function');
	});

	it('returns empty array is no listeners found', () => {
		expect(getListenersDescriptorsForSubscriber({}))
			.toEqual([]);
	});

	it('allows to register global event listener', () => {
		class Subscriber {
			@GlobalEventListener()
			listener() {

			}
		}

		const subscriber = sinon.createStubInstance(Subscriber);
		const listeners = getListenersDescriptorsForSubscriber(subscriber);

		expect(listeners[0].events).toBe(undefined);
	});
});
