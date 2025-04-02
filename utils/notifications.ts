export function showNotification(title: string, message: string, notificationId?: string) {
    const id = notificationId || 'notification_' + Date.now();

    browser.notifications.create(id, {
        type: 'basic',
        iconUrl: 'icons/128.png',
        title: title,
        message: message,
        priority: 2
    });

    return id;
}