import 'clientjs';

(function ($, plugin) {

	let active = false;
	const $body = $('body');

	$(function () {

		if ('serviceWorker' in navigator && 'PushManager' in window) {

			navigator.serviceWorker.ready
				.then(function (registration) {

					/**
					 * Show toggler (hidden by default)
					 */

					$body.addClass('pwp-notification');

					/**
					 * add trigger
					 */

					const $toggler = $('#pwp-notification-button');
					if ($toggler.length) {
						$toggler.on('click', function () {
							if (active) {
								deregisterPushDevice();
							} else {
								registerPushDevice();
							}
						});
					}

					/**
					 * check if is already registered
					 */

					registration.pushManager.getSubscription()
						.then(function (subscription) {
							if (subscription) {
								changePushStatus(true);
							}
						});
				});
		}
	});

	function changePushStatus(status) {
		active = status;
		$body.removeClass('pwp-notification--loader');
		if (status) {
			$body.addClass('pwp-notification--on');
		} else {
			$body.removeClass('pwp-notification--on');
		}
	}

	const registerPushDevice = function () {
		$body.addClass('pwp-notification--loader');
		navigator.serviceWorker.ready
			.then(function (registration) {

				registration.pushManager.subscribe({
					userVisibleOnly: true
				})
					.then(function (subscription) {
						const subscription_id = subscription.endpoint.split('gcm/send/')[1];
						handleSubscriptionID(subscription_id, 'add');
						changePushStatus(true);
					})
					.catch(function () {
						changePushStatus(false);
						alert(plugin['message_pushadd_failed']);
					});
			});
	};

	const deregisterPushDevice = function () {
		$body.addClass('pwp-notification--loader');
		navigator.serviceWorker.ready
			.then(function (registration) {
				registration.pushManager.getSubscription()
					.then(function (subscription) {
						if (!subscription) {
							return;
						}
						subscription.unsubscribe()
							.then(function () {
								const subscription_id = subscription.endpoint.split('gcm/send/')[1];
								handleSubscriptionID(subscription_id, 'remove');
								changePushStatus(false);
							})
							.catch(function () {
								changePushStatus(true);
								alert(plugin['message_pushremove_failed']);
							});
					});
			});
	};

	function handleSubscriptionID(subscription_id, handle) {

		const client = new ClientJS();
		const clientData = {
			'browser': {
				'browser': client.getBrowser(),
				'version': client.getBrowserVersion(),
				'major': client.getBrowserMajorVersion(),
			},
			'os': {
				'os': client.getOS(),
				'version': client.getOSVersion(),
			},
			'device': {
				'device': client.getDevice(),
				'type': client.getDeviceType(),
				'vendor': client.getDeviceVendor()
			}
		};

		const action = 'pwp_ajax_handle_device_id';

		$.ajax({
			url: plugin['AjaxURL'],
			type: 'POST',
			dataType: 'json',
			data: {
				action: action,
				user_id: subscription_id,
				handle: handle,
				clientData: clientData,
			}
		}).done(function (data) {
			//console.log(data);
		});
	}

	window.pwpRegisterPushDevice = registerPushDevice;
	window.pwpDeregisterPushDevice = deregisterPushDevice;

})(jQuery, PwpJsVars);