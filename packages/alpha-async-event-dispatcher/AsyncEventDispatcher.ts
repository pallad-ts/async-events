import {EventSubscriberInterface, MultiEventListener} from "./EventSubscriber";
export * from "./Event";
import {EventInterface} from "./Event";

export type Listener = (event: EventInterface) => Promise<any>;

export interface AsyncEventDispatcherInterface {
    dispatch(event: EventInterface): Promise<void>;

    start(): Promise<void>;

    /**
     * Stops dispatcher.
     *
     * Allows to finish current calls of listeners.
     */
    stop(): Promise<void>;

    /**
     * Registers listener with given name that listen on provided eventNames.
     * Not providing eventName means that listener will be called for every event.
     *
     * @param listenerName
     * @param listener
     * @param eventName
     *
     * @throws {Error} is listener already exists
     * @throws {TypeError}
     */
    on(listenerName: string, listener: Listener, eventName?: string | string[]): Promise<void>

    /**
     * Unregisters listener with given name
     *
     * @param listenerName
     */
    off(listenerName: string): Promise<void>

    /**
     * Registers subscribers that provide event listener for particular events
     *
     * @param subscriber
     */
    registerSubscriber(subscriber: EventSubscriberInterface): Promise<void>;

    /**
     * Unregisters listeners provided by subscriber
     *
     * @param subscriber
     */
    unregisterSubscriber(subscriber: EventSubscriberInterface): Promise<void>;
}


export abstract class AsyncEventDispatcher implements AsyncEventDispatcherInterface {
    private subscribers: Map<EventSubscriberInterface, string[]> = new Map();

    abstract dispatch(event: EventInterface): Promise<void>;

    abstract start(): Promise<void>

    abstract stop(): Promise<void>

    abstract on(listenerName: string, listener: Listener, eventName?: string | string[]): Promise<void>;

    abstract off(listenerName: string): Promise<void>;

    async registerSubscriber(subscriber: EventSubscriberInterface): Promise<void> {
        const eventListeners = subscriber.getListeners();
        const multiListeners = Array.isArray(eventListeners) ? eventListeners : [eventListeners];

        for (const eventListener of multiListeners) {
            let listener: Listener;
            if (typeof eventListener.listener === 'string') {
                const methodName = eventListener.listener;
                const method = subscriber[methodName];
                if (!(method instanceof Function)) {
                    throw new TypeError(`Subscriber has not method "${methodName}"`);
                }
                listener = method.bind(subscriber);
            } else {
                if (!(eventListener.listener instanceof Function)) {
                    throw new TypeError(`Listener for "${eventListener.listenerName}" is not a function`);
                }
                listener = eventListener.listener;
            }
            await this.on(eventListener.listenerName, listener, eventListener.events);
        }
        this.subscribers.set(subscriber, multiListeners.map(l => l.listenerName));
    }

    async unregisterSubscriber(subscriber: EventSubscriberInterface): Promise<void> {
        if (!this.subscribers.has(subscriber)) {
            throw new Error('Provided subscriber is not registered');
        }

        const multiListeners = this.subscribers.get(subscriber);
        for (const listenerName of multiListeners) {
            await this.off(listenerName);
        }
        this.subscribers.delete(subscriber);
    }
}