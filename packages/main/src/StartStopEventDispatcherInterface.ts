export interface StartStopEventDispatcherInterface {
	/**
	 * Starts dispatcher.
	 */
	start(): Promise<void>;

	/**
	 * Stops dispatcher.
	 *
	 * Allows to finish current calls of listeners.
	 */
	stop(): Promise<void>;
}
