import {addDecoratedListenerDescriptorToTarget} from "./helpers";

// eslint-disable-next-line @typescript-eslint/naming-convention
export function GlobalEventListener(): MethodDecorator {
	return (target, property) => {
		addDecoratedListenerDescriptorToTarget(target, property, undefined);
	}
}
