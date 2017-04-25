"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const alpha_amqp_consumer_1 = require("alpha-amqp-consumer");
const find = require("array-find");
class AMQPAsyncEventDispatcher {
    constructor(connectionManager, options) {
        this.connectionManager = connectionManager;
        this.options = options;
        this.listeners = [];
        this.options = Object.assign({}, AMQPAsyncEventDispatcher.defaultOptions, options || {});
    }
    dispatch(event) {
        return __awaiter(this, void 0, void 0, function* () {
            const content = new Buffer(JSON.stringify(event), 'utf8');
            yield this.connectionManager.channel.publish(this.options.exchangeName, event.name, content, {
                persistent: true
            });
        });
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            const assertExchangeOptions = Object.assign({}, AMQPAsyncEventDispatcher.defaultOptions.assertExchangeOptions, this.options.assertExchangeOptions);
            yield this.connectionManager.channel.assertExchange(this.options.exchangeName, 'topic', assertExchangeOptions);
        });
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            for (const listener of this.listeners) {
                yield listener.consumer.stop();
            }
        });
    }
    on(listenerName, listener, eventName) {
        return __awaiter(this, void 0, void 0, function* () {
            listenerName = listenerName.trim();
            this.assertListenerName(listenerName);
            const events = Array.isArray(eventName) ? eventName : (eventName ? [eventName] : ['*']);
            for (const event of events) {
                const queueName = this.options.queuesPrefix + listenerName;
                const assertQueueOptions = Object.assign({}, AMQPAsyncEventDispatcher.defaultOptions.assertQueueOptions, this.options.assertQueueOptions);
                const consumer = yield this.connectionManager.consume({
                    exchange: this.options.exchangeName,
                    pattern: event,
                    queue: queueName,
                    assertQueue: true,
                    assertQueueOptions: assertQueueOptions
                }, (message) => {
                    const event = JSON.parse(message.content.toString('utf8'));
                    return listener(event);
                });
                this.listeners.push({ events, consumer, listenerName });
            }
        });
    }
    assertListenerName(listenerName) {
        if (!listenerName.match(/^[a-z0-9_\-]+$/i)) {
            throw new Error(`Invalid listener name "${listenerName}". Listener name must consist of following characters: a-z0-9_\-`);
        }
        if (!listenerName) {
            throw new Event('Listener name cannot be empty');
        }
    }
    off(listenerName) {
        return __awaiter(this, void 0, void 0, function* () {
            listenerName = listenerName.trim();
            this.assertListenerName(listenerName);
            const listenerConsumer = find(this.listeners, (l) => l.listenerName === listenerName);
            yield listenerConsumer.consumer.stop();
            const index = this.listeners.indexOf(listenerConsumer);
            this.listeners.splice(index, 1);
        });
    }
    static create(connectionURL, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const manager = yield alpha_amqp_consumer_1.connect(connectionURL, options);
            return new AMQPAsyncEventDispatcher(manager);
        });
    }
}
AMQPAsyncEventDispatcher.defaultOptions = {
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
exports.default = AMQPAsyncEventDispatcher;
