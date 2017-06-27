export interface EventInterface {
    eventName: string;
}
export declare class Event implements EventInterface {
    eventName: string;
    constructor(eventName: string, extraProperties?: Object);
}
