import AMQPAsyncEventDispatcher from "./AMQPAsyncEventDispatcher";
import {Event} from "alpha-async-event-dispatcher";

(async () => {
    const dispatcher = await AMQPAsyncEventDispatcher.create('amqp://localhost?heartbeat=20');

    await dispatcher.on('some-listener', (event: Event) => {
        console.log(event);
        return Promise.resolve('test');
    }, 'event1');

    await dispatcher.dispatch({name: 'event1'});

})();
