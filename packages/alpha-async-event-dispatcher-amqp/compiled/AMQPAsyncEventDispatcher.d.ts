import { AsyncEventDispatcher, Listener, EventInterface } from "alpha-async-event-dispatcher";
import { ConsumerManager, ConnectionManagerOptions } from "alpha-amqp-consumer";
import * as amqp from "amqplib";
export interface AMQPAsyncEventDispatcherOptions {
    exchangeName?: string;
    queuesPrefix?: string;
    assertExchangeOptions?: amqp.Options.AssertExchange;
    assertQueueOptions?: amqp.Options.AssertQueue;
    consumerResultHandler: any;
}
export default class AMQPAsyncEventDispatcher extends AsyncEventDispatcher {
    private consumerManager;
    private options;
    private listeners;
    static defaultOptions: AMQPAsyncEventDispatcherOptions;
    constructor(consumerManager: ConsumerManager, options?: AMQPAsyncEventDispatcherOptions);
    dispatch(event: EventInterface): Promise<void>;
    start(): Promise<void>;
    stop(): Promise<void>;
    on(listenerName: string, listener: Listener, eventName?: string | string[]): Promise<void>;
    private assertListenerName(listenerName);
    off(listenerName: string): Promise<void>;
    static create(connectionURL: string, options?: ConnectionManagerOptions): Promise<AMQPAsyncEventDispatcher>;
}
