import {
	Listener,
	EventInterface,
	EventDispatcherInterface,
	StartStopEventDispatcherInterface,
	MultiListenersEventDispatcherInterface
} from "@pallad/async-events";
import {
	connect,
	ConsumerManager,
	Consumer,
	Message,
	ResultHandler, ConnectionManager,
} from "alpha-amqp-consumer";
import * as amqp from "amqplib";


interface ListenerConsumer {
	listenerName: string,
	events: string[];
	consumer: Consumer;
}

export class AMQPEventDispatcher implements EventDispatcherInterface, StartStopEventDispatcherInterface, MultiListenersEventDispatcherInterface {
	private listeners: ListenerConsumer[] = [];

	static defaultOptions: Partial<AMQPEventDispatcher.Options> = {
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

	private options: AMQPEventDispatcher.Options;
	private assertExchangePromise?: Promise<void>;

	constructor(private consumerManager: ConsumerManager, options?: Partial<AMQPEventDispatcher.Options>) {
		this.options = {...AMQPEventDispatcher.defaultOptions, ...(options || {})} as AMQPEventDispatcher.Options;
	}

	async dispatch(event: EventInterface): Promise<void> {
		const content = new Buffer(JSON.stringify(event), 'utf8');
		// eslint-disable-next-line @typescript-eslint/await-thenable
		await this.consumerManager.channel!.publish(this.options.exchangeName, event.eventName, content, {
			persistent: true
		});
	}

	async start(): Promise<void> {
		return this.assertExchange();
	}

	async stop(): Promise<void> {
		for (const listener of this.listeners) {
			await listener.consumer.stop();
		}
	}

	async on(listenerName: string, listener: Listener, eventName?: string | string[]): Promise<void> {
		listenerName = listenerName.trim();
		this.assertListenerName(listenerName);
		await this.assertExchange();

		const events = Array.isArray(eventName) ? eventName : (eventName ? [eventName] : ['*']);
		for (const event of events) {
			const queueName = this.options.queuesPrefix + listenerName;
			const assertQueueOptions = {
				...AMQPEventDispatcher.defaultOptions.assertQueueOptions,
				...this.options.assertQueueOptions
			};
			const consumerOptions: Consumer.Options = {
				exchange: this.options.exchangeName,
				pattern: event === '*' ? '#' : event,
				queue: queueName,
				assertQueue: true,
				assertQueueOptions: assertQueueOptions,
			};

			if (this.options.consumerResultHandler) {
				consumerOptions.resultHandler = this.options.consumerResultHandler;
			}

			const consumer = await this.consumerManager.consume((message: Message) => {
				const event: EventInterface = JSON.parse(message.content.toString('utf8'));
				return listener(event);
			}, consumerOptions);
			this.listeners.push({events, consumer, listenerName});
		}
	}

	private assertListenerName(listenerName: string) {
		if (!listenerName.match(/^[a-z0-9_\-]+$/i)) {
			throw new Error(`Invalid listener name "${listenerName}". Listener name must consist of following characters: a-z0-9_\-`);
		}

		if (!listenerName) {
			throw new Error('Listener name cannot be empty');
		}
	}

	private async assertExchange() {
		if (!this.assertExchangePromise) {
			this.assertExchangePromise = this.assertExchangeInternal();
		}
		return this.assertExchangePromise;
	}

	private async assertExchangeInternal() {
		const assertExchangeOptions = Object.assign(
			{},
			AMQPEventDispatcher.defaultOptions.assertExchangeOptions,
			this.options.assertExchangeOptions
		);
		await this.consumerManager.channel!.assertExchange(this.options.exchangeName, 'topic', assertExchangeOptions);
	}

	async off(listenerName: string): Promise<void> {
		listenerName = listenerName.trim();
		this.assertListenerName(listenerName);

		const listenerConsumer = this.listeners.find(l => l.listenerName === listenerName);

		if (listenerConsumer) {
			await listenerConsumer.consumer.stop();
			const index = this.listeners.indexOf(listenerConsumer);
			this.listeners.splice(index, 1);
		}
	}


	static async create(connectionURL: string, options?: ConnectionManager.Options) {
		const consumerManager = await connect(connectionURL, options);

		return new AMQPEventDispatcher(consumerManager);
	}
}


export namespace AMQPEventDispatcher {
	export interface Options {
		exchangeName: string;
		queuesPrefix: string;
		assertExchangeOptions: amqp.Options.AssertExchange;
		assertQueueOptions: amqp.Options.AssertQueue;
		consumerResultHandler?: ResultHandler
	}
}
