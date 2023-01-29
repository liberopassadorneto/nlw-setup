self.addEventListener('push', function (event) {
  event.waitUntil(
    self.registration.showNotification('Push Notification', {
      body: 'This is a push notification',
    })
  );
});
