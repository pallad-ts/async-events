export interface Event {
    name: string;
}

export type Listener = (event: Event) => Promise<any>;

export interface AsyncEventDispatcher {
    dispatch(event: Event): Promise<void>;

    start(): Promise<void>;

    /**
     * Stops dispatcher.
     *
     * Allows to finish current calls of listeners.
     */
    stop(): Promise<void>;

    /**
     * Registers listener with given name that listen on provided eventNames.
     * Not providing eventName means that listener will be called for every event.
     *
     * @param listenerName
     * @param listener
     * @param eventName
     */
    on(listenerName: string, listener: Listener, eventName?: string | string[]): Promise<void>

    /**
     * Unregisters listener with given name
     *
     * @param listenerName
     */
    off(listenerName: string): Promise<void>
}