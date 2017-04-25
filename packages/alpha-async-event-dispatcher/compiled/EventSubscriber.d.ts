import { Listener } from "./AsyncEventDispatcher";
export interface MultiEventListener {
    events: string | string[];
    listenerName: string;
    listener: Listener;
}
export interface EventSubscriberInterface {
    getListeners(): MultiEventListener[] | MultiEventListener;
}
