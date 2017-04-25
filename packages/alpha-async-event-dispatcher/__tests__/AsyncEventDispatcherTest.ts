import {AsyncEventDispatcher, Listener} from "../AsyncEventDispatcher";
import {EventInterface} from "../Event";
import * as sinon from "sinon";
import {EventSubscriberInterface, MultiEventListener} from "../EventSubscriber";
import {SinonSpy} from "sinon";
import {assert} from "chai";

class FakeEventDispatcher extends AsyncEventDispatcher {

    async dispatch(event: EventInterface): Promise<void> {
    }

    async start(): Promise<void> {
    }

    async stop(): Promise<void> {
    }

    async on(listenerName: string, listener: Listener, eventName?: string | string[]): Promise<void> {
    }

    async off(listenerName: string): Promise<void> {
    }
}

class FakeSubscriber implements EventSubscriberInterface {

    someListenerSpy = sinon.spy();

    constructor(private listeners: MultiEventListener[]) {
    }

    getListeners() {
        return this.listeners;
    }

    someListener() {
        this.someListenerSpy.apply(this, arguments);
    }
}

describe('AsyncEventDispatcher', () => {
    let dispatcher: AsyncEventDispatcher;

    beforeEach(() => {
        dispatcher = new FakeEventDispatcher();

        sinon.spy(dispatcher, 'dispatch');
        sinon.spy(dispatcher, 'start');
        sinon.spy(dispatcher, 'stop');
        sinon.spy(dispatcher, 'on');
        sinon.spy(dispatcher, 'off');
    });

    it('registering subscriber registers listeners returned by it', async () => {
        const listener = sinon.spy();
        const subscriber = new FakeSubscriber([
            {
                events: ['event1', 'event2'],
                listener,
                listenerName: 'listener1'
            },
            {
                events: 'some-event',
                listener: 'someListener',
                listenerName: 'listener2'
            }
        ]);

        await dispatcher.registerSubscriber(subscriber);

        sinon.assert.calledWith(<SinonSpy>dispatcher.on, 'listener1', listener, ['event1', 'event2']);
        sinon.assert.calledWithMatch(<SinonSpy>dispatcher.on, 'listener2', sinon.match.any, 'some-event');

        const methodListener = (<SinonSpy>dispatcher.on).getCall(1).args[1];
        methodListener();
        sinon.assert.called(subscriber.someListenerSpy);
    });

    it('throws an error when registering listener as method name that does not exist', () => {
        const subscriber = new FakeSubscriber([
            {
                listener: 'someMethod',
                listenerName: 'some-listener'
            }
        ]);

        return assert.isRejected(
            dispatcher.registerSubscriber(subscriber),
            'Subscriber has not method "someMethod"'
        )
            .then(e => assert.instanceOf(e, TypeError));
    });

    it('throws an error when registering listener that is not a function', () => {
        const subscriber = new FakeSubscriber([
            {
                listener: <any>[],
                listenerName: 'listener1'
            }
        ]);

        return assert.isRejected(
            dispatcher.registerSubscriber(subscriber),
            'Listener for "listener1" is not a function'
        )
            .then(e => assert.instanceOf(e, TypeError));
    });

    it('unregistering subscriber removes all its defined listeners', async () => {
        const listener = sinon.spy();
        const subscriber = new FakeSubscriber([
            {
                events: ['event1', 'event2'],
                listener,
                listenerName: 'listener1'
            },
            {
                events: 'some-event',
                listener: 'someListener',
                listenerName: 'listener2'
            }
        ]);

        await dispatcher.registerSubscriber(subscriber);
        await dispatcher.unregisterSubscriber(subscriber);

        sinon.assert.calledWith(<SinonSpy>dispatcher.off, 'listener1');
        sinon.assert.calledWith(<SinonSpy>dispatcher.off, 'listener2');
    });

    it('throws an error when unregistering subscriber that has not been registered', () => {
        const subscriber = new FakeSubscriber([]);
        return assert.isRejected(
            dispatcher.unregisterSubscriber(subscriber),
            'Provided subscriber is not registered'
        );
    });
});