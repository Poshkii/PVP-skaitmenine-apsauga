export function showNotification(title: string, message: string, notificationId?: string) {
    console.log("test notification");
    const id = notificationId || 'notification_' + Date.now();

    browser.notifications.create(id, {
        type: 'basic',
        iconUrl: 'icon/128.png',
        title: title,
        message: message,
        priority: 2
    });

    return id;
}