export interface EventInterface {
    eventName: string;
}
export default class Event implements EventInterface {
    eventName: string;
    constructor(eventName: string, extraProperties?: Object);
}
