import { EventNames, ShapeEvent } from "@pallad/async-events";

import { addDecoratedListenerDescriptorToTarget } from "./helpers";

// eslint-disable-next-line @typescript-eslint/naming-convention
export function EventListener(
	eventName: string | ShapeEvent.Shape,
	...eventNames: Array<string | ShapeEvent.Shape>
): MethodDecorator {
	return (target, property, descriptor) => {
		addDecoratedListenerDescriptorToTarget(target, property, eventNames.concat(eventName));
	};
}
