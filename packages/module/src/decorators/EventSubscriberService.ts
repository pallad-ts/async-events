import { Service } from "@pallad/container";

import { eventSubscriberAnnotation } from "./annotations";

// eslint-disable-next-line @typescript-eslint/naming-convention
export function EventSubscriberService(): ClassDecorator {
	return target => {
		Service()(target as any);
		eventSubscriberAnnotation.decorator()(target);
	};
}
