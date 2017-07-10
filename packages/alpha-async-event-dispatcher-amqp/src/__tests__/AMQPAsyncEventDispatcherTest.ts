import {ConnectionManager, Consumer, ConsumerPolicy} from "alpha-amqp-consumer";
import * as sinon from "sinon";
import {SinonStub} from "sinon";
import AMQPAsyncEventDispatcher from "../AMQPAsyncEventDispatcher";
import * as faker from "faker";
import ConsumerManager from "alpha-amqp-consumer/compiled/ConsumerManager";

const Channel = require('amqplib/lib/channel_model').Channel;

describe('AMQPAsyncEventDispatcher', () => {
    let consumerManager: ConnectionManager;
    let channel: any;

    beforeEach(() => {
        consumerManager = sinon.createStubInstance(ConsumerManager);
        channel = sinon.createStubInstance(Channel);

        consumerManager.channel = channel;
    });

    it('starting dispatcher asserts new exchange', async () => {
        const EXCHANGE_NAME = faker.random.alphaNumeric(20);
        const dispatcher = new AMQPAsyncEventDispatcher(consumerManager, {
            exchangeName: EXCHANGE_NAME
        });

        (<SinonStub>channel.assertExchange).resolves({exchange: EXCHANGE_NAME});

        await dispatcher.start();

        sinon.assert.calledWith(
            channel.assertExchange,
            EXCHANGE_NAME,
            'topic',
            AMQPAsyncEventDispatcher.defaultOptions.assertExchangeOptions
        );
    });


    it('listening on events creates queue and binds to exchange', async () => {
        const dispatcher = new AMQPAsyncEventDispatcher(consumerManager);

        (<SinonStub>consumerManager.consume).callsFake(() => {
            return Promise.resolve(sinon.createStubInstance(Consumer));
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
                <SinonStub>consumerManager.consume,
                sinon.match.func,
                <ConsumerPolicy>{
                    exchange: AMQPAsyncEventDispatcher.defaultOptions.exchangeName,
                    assertQueue: true,
                    assertQueueOptions: AMQPAsyncEventDispatcher.defaultOptions.assertQueueOptions,
                    queue: 'listener-' + LISTENER_NAME,
                    pattern: event
                }
            );
        }
    });

    it('')
});