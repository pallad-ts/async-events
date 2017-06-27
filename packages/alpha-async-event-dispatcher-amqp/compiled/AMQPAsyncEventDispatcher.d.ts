import { AsyncEventDispatcher, Listener, EventInterface } from "alpha-async-event-dispatcher";
import { ConsumerManager, ConnectionManagerOptions, ResultHandler } from "alpha-amqp-consumer";
import * as amqp from "amqplib";
export interface AMQPAsyncEventDispatcherOptions {
    exchangeName: string;
    queuesPrefix: string;
    assertExchangeOptions: amqp.Options.AssertExchange;
    assertQueueOptions: amqp.Options.AssertQueue;
    consumerResultHandler?: ResultHandler;
}
export default class AMQPAsyncEventDispatcher extends AsyncEventDispatcher {
    private consumerManager;
    private listeners;
    static defaultOptions: Partial<AMQPAsyncEventDispatcherOptions>;
    private options;
    constructor(consumerManager: ConsumerManager, options?: Partial<AMQPAsyncEventDispatcherOptions>);
    dispatch(event: EventInterface): Promise<void>;
    start(): Promise<void>;
    stop(): Promise<void>;
    on(listenerName: string, listener: Listener, eventName?: string | string[]): Promise<void>;
    private assertListenerName(listenerName);
    off(listenerName: string): Promise<void>;
    static create(connectionURL: string, options?: ConnectionManagerOptions): Promise<AMQPAsyncEventDispatcher>;
}
