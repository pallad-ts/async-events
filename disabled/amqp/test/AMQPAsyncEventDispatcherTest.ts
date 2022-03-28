import * as sinon from "sinon";
import {SinonStub} from "sinon";
import * as faker from "faker";
import {Consumer, ConsumerManager} from "alpha-amqp-consumer";
import {AMQPEventDispatcher} from "@src/index";

const Channel = require('amqplib/lib/channel_model').Channel;

describe('AMQPAsyncEventDispatcher', () => {
	let consumerManager: sinon.SinonStubbedInstance<ConsumerManager>;
	let channel: any;

	beforeEach(() => {
		consumerManager = sinon.createStubInstance(ConsumerManager);
		channel = sinon.createStubInstance(Channel);

		consumerManager.channel = channel;
	});

	it('starting dispatcher asserts new exchange', async () => {
		const EXCHANGE_NAME = faker.random.alphaNumeric(20);
		const dispatcher = new AMQPEventDispatcher(
			consumerManager as unknown as ConsumerManager,
			{
				exchangeName: EXCHANGE_NAME
			}
		);

		(<SinonStub>channel.assertExchange).resolves({exchange: EXCHANGE_NAME});

		await dispatcher.start();

		sinon.assert.calledWith(
			channel.assertExchange,
			EXCHANGE_NAME,
			'topic',
			AMQPEventDispatcher.defaultOptions.assertExchangeOptions
		);
	});


	it('listening on events creates queue and binds to exchange', async () => {
		const dispatcher = new AMQPEventDispatcher(consumerManager as unknown as ConsumerManager);

		consumerManager.consume.callsFake(() => {
			return Promise.resolve(sinon.createStubInstance(Consumer) as unknown as Consumer);
		});

		const LISTENER_NAME = faker.random.alphaNumeric(20);
		const LISTENER = sinon.spy();
		const EVENTS = [
			faker.random.alphaNumeric(10),
			faker.random.alphaNumeric(10),
			faker.random.alphaNumeric(10)
		];
		await dispatcher.on(LISTENER_NAME, LISTENER, EVENTS);

		for (const event of EVENTS) {
			sinon.assert.calledWithMatch(
				consumerManager.consume,
				sinon.match.func as any,
				{
					exchange: AMQPEventDispatcher.defaultOptions.exchangeName,
					assertQueue: true,
					assertQueueOptions: AMQPEventDispatcher.defaultOptions.assertQueueOptions,
					queue: 'listener-' + LISTENER_NAME,
					pattern: event
				}
			);
		}
	});
});
