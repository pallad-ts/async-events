import * as faker from "faker";
import {assert} from "chai";
import {Event} from "../Event";

describe('Event', () => {
    const EVENT_NAME = faker.random.alphaNumeric(10);

    describe('creating', () => {

        it('simple event', () => {
            const event = new Event(EVENT_NAME);
            assert.propertyVal(event, 'eventName', EVENT_NAME);
        });

        it('event with extra properties', () => {
            const extraProperties = {
                property1: faker.random.alphaNumeric(10),
                property2: faker.random.alphaNumeric(10)
            };

            const event = new Event(EVENT_NAME, extraProperties);
            assert.propertyVal(event, 'eventName', EVENT_NAME);
            assert.propertyVal(event, 'property1', extraProperties.property1);
            assert.propertyVal(event, 'property2', extraProperties.property2);
        });

        it('using "eventName" in extraProperties throws an error', () => {
            assert.throws(() => {
                new Event('event-name', {eventName: 'someProperty'});
            }, Error, /prohibited in extraProperties/);
        });
    })
});