"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Event {
    constructor(eventName, extraProperties) {
        this.eventName = eventName;
        if (extraProperties && 'eventName' in extraProperties) {
            throw new Error('Property "eventName" is prohibited in extraProperties');
        }
        Object.assign(this, extraProperties);
    }
}
exports.default = Event;
