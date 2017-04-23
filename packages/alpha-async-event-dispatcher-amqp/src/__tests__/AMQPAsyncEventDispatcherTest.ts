import {ConnectionManager} from "alpha-amqp-consumer";
import * as sinon from "sinon";

const Channel = require('amqplib/lib/channel_model').Channel;

describe('AMQPAsyncEventDispatcher', () => {
    let connectionManager: ConnectionManager;
    let channel: any;

    beforeEach(() => {
        connectionManager = sinon.createStubInstance(ConnectionManager);
        channel = sinon.createStubInstance(Channel);

        connectionManager.channel = channel;
    });

    it('starting queue asserts new exchange', () => {

    });
});