export interface StartStopEventDispatcherInterface {
	/**
	 * Starts dispatcher.
	 */
	start(): void | Promise<void>;

	/**
	 * Stops dispatcher.
	 *
	 * Allows to finish current calls of listeners.
	 */
	stop(): void | Promise<void>;
}
