import { createAnnotationFactory } from "@pallad/container";

export const eventSubscriberAnnotation = createAnnotationFactory(
	"@pallad/async-events/EventSubscriber"
);
