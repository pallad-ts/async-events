import {ConnectionManager, Consumer, ConsumerPolicy} from "alpha-amqp-consumer";
import * as sinon from "sinon";
import {SinonStub} from "sinon";
import AMQPAsyncEventDispatcher from "../AMQPAsyncEventDispatcher";
import * as faker from "faker";

const Channel = require('amqplib/lib/channel_model').Channel;

describe('AMQPAsyncEventDispatcher', () => {
    let connectionManager: ConnectionManager;
    let channel: any;

    beforeEach(() => {
        connectionManager = sinon.createStubInstance(ConnectionManager);
        channel = sinon.createStubInstance(Channel);

        connectionManager.channel = channel;
    });

    it('starting queue asserts new exchange', async () => {
        const EXCHANGE_NAME = faker.random.alphaNumeric(20);
        const dispatcher = new AMQPAsyncEventDispatcher(connectionManager, {
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
        const dispatcher = new AMQPAsyncEventDispatcher(connectionManager);

        (<SinonStub>connectionManager.consume).callsFake(() => {
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
            sinon.assert.calledWith(
                <SinonStub>connectionManager.consume,
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
});