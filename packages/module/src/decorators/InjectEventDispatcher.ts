import { Inject } from "@pallad/container";

import { eventDispatcherReference } from "../references";

// eslint-disable-next-line @typescript-eslint/naming-convention
export function InjectEventDispatcher() {
	return Inject(eventDispatcherReference);
}
