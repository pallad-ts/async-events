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
const AMQPAsyncEventDispatcher_1 = require("./AMQPAsyncEventDispatcher");
(() => __awaiter(this, void 0, void 0, function* () {
    const dispatcher = yield AMQPAsyncEventDispatcher_1.default.create('amqp://localhost?heartbeat=20');
    yield dispatcher.on('some-listener', (event) => {
        console.log(event);
        return Promise.resolve('test');
    }, 'event1');
    yield dispatcher.dispatch({ name: 'event1' });
}))();
