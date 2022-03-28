import {LocalEventDispatcher} from "@src/LocalEventDispatcher";
import * as sinon from 'sinon';
import {ShapeEvent} from "@pallad/async-events";

class FooEvent extends ShapeEvent.create('foo') {

}

class BarEvent extends ShapeEvent.create('bar') {

}

const EVENT_FOO = new FooEvent();
const EVENT_BAR = new BarEvent();

describe('LocalEventDispatcher', () => {
	let eventDispatcher: LocalEventDispatcher;

	beforeEach(() => {
		eventDispatcher = new LocalEventDispatcher();
	});

	describe('global listeners', () => {
		it('got notified on every event', async () => {
			const stub = sinon.stub();
			eventDispatcher.on(stub);
			eventDispatcher.on(sinon.stub(), FooEvent);
			await eventDispatcher.dispatch(EVENT_FOO);
			await eventDispatcher.dispatch(EVENT_BAR);

			sinon.assert.calledWith(stub, EVENT_FOO);
			sinon.assert.calledWith(stub, EVENT_BAR);
		});


		it('listener does not get notified once unregistered', async () => {
			const stub = sinon.stub();
			eventDispatcher.on(stub);
			eventDispatcher.off(stub);
			await eventDispatcher.dispatch(EVENT_FOO);
			await eventDispatcher.dispatch(EVENT_BAR);

			sinon.assert.notCalled(stub);
		});
	});

	describe('dead event listeners', () => {
		it('notifies listener once there are no listeners for given event', async () => {
			const stub = sinon.stub();
			eventDispatcher.on(sinon.stub(), [FooEvent]);
			eventDispatcher.onDeadEventListener(stub);

			await eventDispatcher.dispatch(EVENT_FOO);
			await eventDispatcher.dispatch(EVENT_BAR);

			sinon.assert.calledOnce(stub);
			sinon.assert.calledWith(stub, EVENT_BAR);
		});

		it('dead event listener is not notified once unregistered', async () => {
			const stub = sinon.stub();
			eventDispatcher.onDeadEventListener(stub);
			eventDispatcher.offDeadEventListener(stub);

			await eventDispatcher.dispatch(EVENT_FOO);
			await eventDispatcher.dispatch(EVENT_BAR);

			sinon.assert.notCalled(stub);
		})
	});

	describe('dispatching', () => {
		it('all listeners are notified at the same time', () => {
			const stub1 = sinon.stub().returns(new Promise(r => setTimeout(r, 50)));
			const stub2 = sinon.stub();

			eventDispatcher.on(stub1);
			eventDispatcher.on(stub2);

			// do not await for event on purpose
			eventDispatcher.dispatch(EVENT_FOO);

			sinon.assert.calledOnce(stub1);
			sinon.assert.calledOnce(stub2);
		});

		it('same listener is dispatched only once even with multiple registrations', async () => {
			const stub = sinon.stub();

			eventDispatcher.on(stub);
			eventDispatcher.on(stub);
			eventDispatcher.on(stub, FooEvent);

			await eventDispatcher.dispatch(EVENT_FOO);
			sinon.assert.calledOnce(stub);
		});

		describe('notifies listeners that got registered only for specific event', () => {
			let stub1: sinon.SinonStub;
			let stub2: sinon.SinonStub;
			let stub3: sinon.SinonStub;
			let globalStub: sinon.SinonStub;

			beforeEach(() => {
				stub1 = sinon.stub();
				stub2 = sinon.stub();
				stub3 = sinon.stub();
				globalStub = sinon.stub();

				eventDispatcher.on(globalStub);
				eventDispatcher.on(stub1, 'foo');
				eventDispatcher.on(stub2, [FooEvent, 'bar']);
				eventDispatcher.on(stub3, BarEvent);
			});

			it('case 1', async () => {
				await eventDispatcher.dispatch(EVENT_FOO);
				sinon.assert.calledWith(stub1, EVENT_FOO)
				sinon.assert.calledWith(stub2, EVENT_FOO)
				sinon.assert.notCalled(stub3);
				sinon.assert.calledWith(globalStub, EVENT_FOO);
			})

			it('case 2', async () => {
				await eventDispatcher.dispatch(EVENT_BAR);
				sinon.assert.notCalled(stub1)
				sinon.assert.calledWith(stub2, EVENT_BAR)
				sinon.assert.calledWith(stub3, EVENT_BAR);
				sinon.assert.calledWith(globalStub, EVENT_BAR);
			});
		});
	});

	describe('registering listeners', () => {
		it('unregistering listener prevents from further notifications', () => {
			const stub = sinon.stub();
			eventDispatcher.on(stub, FooEvent);
			eventDispatcher.on(stub, BarEvent);

			eventDispatcher.off(stub);
		});

		it('unregistering listener with event names leaves global and unregister only for provided event names', async () => {
			const dispatcher = new LocalEventDispatcher();
			const stub = sinon.stub();
			dispatcher.on(stub, FooEvent);
			dispatcher.on(stub);
			dispatcher.off(stub, [FooEvent]);
			await dispatcher.dispatch(EVENT_FOO);
			sinon.assert.calledOnce(stub);
			dispatcher.off(stub);
			await dispatcher.dispatch(EVENT_FOO);
			sinon.assert.calledOnce(stub);
		});
	});
});
