import { AsyncEventDispatcher, Listener, Event } from "alpha-async-event-dispatcher";
import { ConnectionManagerOptions, ConnectionManager } from "alpha-amqp-consumer";
import * as amqp from "amqplib";
export interface AMQPAsyncEventDispatcherOptions {
    exchangeName?: string;
    queuesPrefix?: string;
    assertExchangeOptions?: amqp.Options.AssertExchange;
    assertQueueOptions?: amqp.Options.AssertQueue;
}
export default class AMQPAsyncEventDispatcher implements AsyncEventDispatcher {
    private connectionManager;
    private options;
    private listeners;
    static defaultOptions: AMQPAsyncEventDispatcherOptions;
    constructor(connectionManager: ConnectionManager, options?: AMQPAsyncEventDispatcherOptions);
    dispatch(event: Event): Promise<void>;
    start(): Promise<void>;
    stop(): Promise<void>;
    on(listenerName: string, listener: Listener, eventName?: string | string[]): Promise<void>;
    private assertListenerName(listenerName);
    off(listenerName: string): Promise<void>;
    static create(connectionURL: string, options?: ConnectionManagerOptions): Promise<AMQPAsyncEventDispatcher>;
}
