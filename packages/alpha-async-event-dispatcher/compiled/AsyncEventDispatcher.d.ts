import { EventSubscriberInterface } from "./EventSubscriber";
export * from "./Event";
import { EventInterface } from "./Event";
export declare type Listener = (event: EventInterface) => Promise<any>;
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
    on(listenerName: string, listener: Listener, eventName?: string | string[]): Promise<void>;
    /**
     * Unregisters listener with given name
     *
     * @param listenerName
     */
    off(listenerName: string): Promise<void>;
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
export declare abstract class AsyncEventDispatcher implements AsyncEventDispatcherInterface {
    private subscribers;
    abstract dispatch(event: EventInterface): Promise<void>;
    abstract start(): Promise<void>;
    abstract stop(): Promise<void>;
    abstract on(listenerName: string, listener: Listener, eventName?: string | string[]): Promise<void>;
    abstract off(listenerName: string): Promise<void>;
    registerSubscriber(subscriber: EventSubscriberInterface): Promise<void>;
    unregisterSubscriber(subscriber: EventSubscriberInterface): Promise<void>;
}
