import {EventInterface} from "./EventInterface";

export interface Listener<TResult = unknown> {
	(event: EventInterface): Promise<TResult> | TResult;
}
