export interface EventInterface {
    eventName: string;
}

export default class Event implements EventInterface {
    constructor(public eventName: string, extraProperties?: Object) {
        if (extraProperties && 'eventName' in extraProperties) {
            throw new Error('Property "eventName" is prohibited in extraProperties');
        }

        Object.assign(this, extraProperties);
    }
}