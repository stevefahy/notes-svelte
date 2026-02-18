import { writable } from "svelte/store";
import type { NotificationObject } from "@/lib/types";

const initialState: NotificationObject = {
  notification: {
    n_status: null,
    title: null,
    message: null,
  },
};

function createNotificationStore() {
  const { subscribe, set } = writable(initialState);

  const ShowNotification = (param: NotificationObject) => {
    set(param);
  };

  return { subscribe, ShowNotification };
}

export const notificationStore = createNotificationStore();
