export default class Event {
    constructor(eventName, extraProperties) {
        this.eventName = eventName;
        if (extraProperties && 'eventName' in extraProperties) {
            throw new Error('Property "eventName" is prohibited in extraProperties');
        }
        Object.assign(this, extraProperties);
    }
}
