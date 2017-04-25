import {AsyncEventDispatcherInterface, Listener, EventInterface} from "alpha-async-event-dispatcher";
import {ConnectionManagerOptions, connect, ConnectionManager, Consumer, Message} from "alpha-amqp-consumer";
import * as find from 'array-find';
import * as amqp from "amqplib";

export interface AMQPAsyncEventDispatcherOptions {
    exchangeName?: string;
    queuesPrefix?: string;
    assertExchangeOptions?: amqp.Options.AssertExchange;
    assertQueueOptions?: amqp.Options.AssertQueue;
}

interface ListenerConsumer {
    listenerName: string,
    events: string[];
    consumer: Consumer;
}

export default class AMQPAsyncEventDispatcher implements AsyncEventDispatcherInterface {

    private listeners: ListenerConsumer[] = [];

    static defaultOptions: AMQPAsyncEventDispatcherOptions = {
        exchangeName: 'async-events',
        queuesPrefix: 'listener-',
        assertExchangeOptions: {
            durable: true,
            internal: false
        },
        assertQueueOptions: {
            autoDelete: false,
            durable: true
        }
    };

    constructor(private connectionManager: ConnectionManager, private options?: AMQPAsyncEventDispatcherOptions) {

        this.options = Object.assign({}, AMQPAsyncEventDispatcher.defaultOptions, options || {});
    }

    async dispatch(event: EventInterface): Promise<void> {
        const content = new Buffer(JSON.stringify(event), 'utf8');
        await this.connectionManager.channel.publish(this.options.exchangeName, event.eventName, content, {
            persistent: true
        });
    }

    async start(): Promise<void> {
        const assertExchangeOptions = Object.assign(
            {},
            AMQPAsyncEventDispatcher.defaultOptions.assertExchangeOptions,
            this.options.assertExchangeOptions
        );

        await this.connectionManager.channel.assertExchange(this.options.exchangeName, 'topic', assertExchangeOptions);
    }

    async stop(): Promise<void> {
        for (const listener of this.listeners) {
            await listener.consumer.stop();
        }
    }

    async on(listenerName: string, listener: Listener, eventName?: string | string[]): Promise<void> {
        listenerName = listenerName.trim();
        this.assertListenerName(listenerName);

        const events = Array.isArray(eventName) ? eventName : (eventName ? [eventName] : ['*']);
        for (const event of events) {
            const queueName = this.options.queuesPrefix + listenerName;
            const assertQueueOptions = Object.assign(
                {},
                AMQPAsyncEventDispatcher.defaultOptions.assertQueueOptions,
                this.options.assertQueueOptions
            );
            const consumer = await this.connectionManager.consume({
                exchange: this.options.exchangeName,
                pattern: event,
                queue: queueName,
                assertQueue: true,
                assertQueueOptions: assertQueueOptions
            }, (message: Message) => {
                const event: EventInterface = JSON.parse(message.content.toString('utf8'));
                return listener(event);
            });

            this.listeners.push({events, consumer, listenerName});
        }
    }

    private assertListenerName(listenerName: string) {
        if (!listenerName.match(/^[a-z0-9_\-]+$/i)) {
            throw new Error(`Invalid listener name "${listenerName}". Listener name must consist of following characters: a-z0-9_\-`);
        }

        if (!listenerName) {
            throw new Event('Listener name cannot be empty');
        }
    }

    async off(listenerName: string): Promise<void> {
        listenerName = listenerName.trim();
        this.assertListenerName(listenerName);

        const listenerConsumer = find(this.listeners, (l) => l.listenerName === listenerName);

        await listenerConsumer.consumer.stop();
        const index = this.listeners.indexOf(listenerConsumer);
        this.listeners.splice(index, 1);
    }


    static async create(connectionURL: string, options?: ConnectionManagerOptions) {
        const manager = await connect(connectionURL, options);

        return new AMQPAsyncEventDispatcher(manager);
    }
}