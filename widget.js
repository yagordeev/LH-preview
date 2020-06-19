window.addEventListener('load', function(w, d) {

	// let DOMAIN = 'https://chat.leadhunt.one';
	let DOMAIN = 'http://10.0.1.8:3001';

	var style = d.createElement('style');
	style.innerHTML = `
#leadhunt_widget {
position: fixed;
bottom: 2vh;
right: 2vh;
height: 100%;
width: 100%;
max-height: 85px;
max-width: 85px;
border-radius: 20px;
z-index: 999;
transition: all .3s;
filter: drop-shadow(0px 10px 15px rgba(55, 54, 110, 0.3));
overflow: hidden;
}
#leadhunt_widget.open {
max-height: 600px;
max-width: 380px;
}
#leadhunt_widget_iframe {
height: 100%; width: 100%; border: none;  pointer-events: all;
}

@media screen and (max-width: 768px) {
#leadhunt_widget {
	bottom: 1vh;
	right: 1vh;
}
#leadhunt_widget.open {
max-height: 100vh !important;
max-width: 100% !important;
border-radius: 0px !important;
bottom: 0px;
right: 0px;
}
}
`;

	var leadhunt = d.createElement('div');
	leadhunt.id = 'leadhunt_widget';

	var iframe = d.createElement('iframe');
	iframe.id = 'leadhunt_widget_iframe';
	iframe.name = 'leadhunt';
	iframe.src = DOMAIN + '/?projectID=' + w.ProjectID + '&domain=' + w.location.hostname;
	iframe.scrolling = 'no';

	var closechat = d.createElement('div');
	closechat.id = 'leadhunt_widget_closechat';
	closechat.innerHTML = '✕'

	d.head.appendChild(style);
	d.body.appendChild(leadhunt);
	leadhunt.appendChild(iframe);

	//получаем сообщение от iframe
	w.addEventListener('message', function(get) {
		if(get.origin !== DOMAIN) {
			return false;
		} else {
			const data = get.data;
			if(data.width) leadhunt.style.width = data.width;
			if(data.height) leadhunt.style.height = data.height;
			if(data.wl_class) leadhunt.className = data.wl_class;
		}
	});

	//отправляем сообщение action в iframe с name="leadhunt"
	function widgetAction(post) {
		w.frames.leadhunt.postMessage(post, DOMAIN);
	}

	//открываем чат по кнопке
	let openChat = d.querySelectorAll(".open_leadhunt_chat");
	for(let button of openChat) {
		button.addEventListener('click', (event) => widgetAction("open_widget"));
	}


}(window, document));