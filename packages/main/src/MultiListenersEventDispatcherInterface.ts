import { ListenerDescriptor } from "./ListenerDescriptor";

export interface MultiListenersEventDispatcherInterface {
	/**
	 * Registers many listeners at the same time
	 *
	 * This method allows specific event dispatcher to perform optimizations related to registering many listeners
	 */
	onMany(listeners: ListenerDescriptor[]): Promise<void> | void;

	/**
	 * Unregisters many listeners at the same time
	 *
	 * This method allows specific event dispatcher to perform optimizations related to unregistering many listeners
	 */
	offMany(listeners: ListenerDescriptor[]): Promise<void> | void;
}
