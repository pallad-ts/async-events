import { LocalEventDispatcher } from "@src/LocalEventDispatcher";
import * as sinon from "sinon";

import { setImmediate } from "node:timers";

import { Event } from "@pallad/async-events";

class FooEvent extends Event.createClass("foo") {}

class BarEvent extends Event.createClass("bar") {}

const EVENT_FOO = new FooEvent();
const EVENT_BAR = new BarEvent();

describe("LocalEventDispatcher", () => {
	let eventDispatcher: LocalEventDispatcher;

	beforeEach(() => {
		eventDispatcher = new LocalEventDispatcher();
	});

	describe("deferred dispatch", () => {
		it("calls listeners in setImmediate", async () => {
			const dispatcher = new LocalEventDispatcher({ useDeferredDispatch: true });
			const stub = sinon.stub();
			dispatcher.on(FooEvent, stub);

			await dispatcher.dispatch(EVENT_FOO);
			sinon.assert.notCalled(stub);

			await new Promise(r => {
				setImmediate(() => {
					sinon.assert.calledWith(stub, EVENT_FOO);
					r(undefined);
				});
			});
		});
	});

	describe("dead event listeners", () => {
		it("notifies listener once there are no listeners for given event", async () => {
			const stub = sinon.stub();
			eventDispatcher.on(FooEvent, sinon.stub());
			eventDispatcher.onDeadEventListener(stub);

			await eventDispatcher.dispatch(EVENT_FOO);
			await eventDispatcher.dispatch(EVENT_BAR);

			sinon.assert.calledOnce(stub);
			sinon.assert.calledWith(stub, EVENT_BAR);
		});

		it("dead event listener is not notified once unregistered", async () => {
			const stub = sinon.stub();
			eventDispatcher.onDeadEventListener(stub);
			eventDispatcher.offDeadEventListener(stub);

			await eventDispatcher.dispatch(EVENT_FOO);
			await eventDispatcher.dispatch(EVENT_BAR);

			sinon.assert.notCalled(stub);
		});
	});

	describe("dispatching", () => {
		it("all listeners are notified at the same time", () => {
			const stub1 = sinon.stub().returns(new Promise(r => setTimeout(r, 50)));
			const stub2 = sinon.stub();

			eventDispatcher.on(FooEvent, stub1);
			eventDispatcher.on(FooEvent, stub2);

			// do not await for event on purpose
			eventDispatcher.dispatch(EVENT_FOO);

			sinon.assert.calledOnce(stub1);
			sinon.assert.calledOnce(stub2);
		});

		it("same listener is dispatched only once even with multiple registrations", async () => {
			const stub = sinon.stub();

			eventDispatcher.on(FooEvent, stub);
			eventDispatcher.on(FooEvent, stub);
			eventDispatcher.on(FooEvent, stub);

			await eventDispatcher.dispatch(EVENT_FOO);
			sinon.assert.calledOnce(stub);
		});

		describe("notifies listeners that got registered only for specific event", () => {
			let stub1: sinon.SinonStub;
			let stub2: sinon.SinonStub;
			let stub3: sinon.SinonStub;

			beforeEach(() => {
				stub1 = sinon.stub();
				stub2 = sinon.stub();
				stub3 = sinon.stub();

				eventDispatcher.on(FooEvent, stub1);
				eventDispatcher.on([FooEvent, BarEvent], stub2);
				eventDispatcher.on(BarEvent, stub3);
			});

			it("case 1", async () => {
				await eventDispatcher.dispatch(EVENT_FOO);
				sinon.assert.calledWith(stub1, EVENT_FOO);
				sinon.assert.calledWith(stub2, EVENT_FOO);
				sinon.assert.notCalled(stub3);
			});

			it("case 2", async () => {
				await eventDispatcher.dispatch(EVENT_BAR);
				sinon.assert.notCalled(stub1);
				sinon.assert.calledWith(stub2, EVENT_BAR);
				sinon.assert.calledWith(stub3, EVENT_BAR);
			});
		});
	});

	describe("registering listeners", () => {
		it("unregistering listener prevents from further notifications", () => {
			const stub = sinon.stub();
			eventDispatcher.on(FooEvent, stub);
			eventDispatcher.on(BarEvent, stub);

			eventDispatcher.off([FooEvent, BarEvent], stub);

			eventDispatcher.dispatch(EVENT_FOO);

			sinon.assert.notCalled(stub);
		});
	});
});
