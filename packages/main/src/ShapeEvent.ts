import {Event} from "./Event";
import {EventInterface} from "./EventInterface";
import {assertEventName} from "./utils";
import {TypeCheck} from "@pallad/type-check";

const typeCheck = new TypeCheck<ShapeEvent.Shape>('@pallad/async-events/ShapeEvent.Shape');

export namespace ShapeEvent {
	export function create<TName extends string>(name: TName): Shape<TName> {
		assertEventName(name);
		const clazz = class extends Event<TName> {
			static eventName = name;

			constructor() {
				super(name);
			}
		}

		typeCheck.assign(clazz);

		return clazz;
	}

	export interface Shape<TName extends string = string> {
		readonly eventName: TName;

		new(...args: any[]): EventInterface;
	}

	export namespace Shape {
		export const isType = typeCheck.isType;
	}
}
