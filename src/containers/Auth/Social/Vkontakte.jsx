import { CONFIG, MODE } from '../../../config.js';
import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { system_status, notification } from '../../../actions';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import jsonp from 'jsonp';

import Localized from '../../../components/Localized.jsx';

const query = new URLSearchParams(window.location.hash);
let access_token = query.get('#access_token');
let expires_in = query.get('expires_in');
let user_id = query.get('user_id');
let email = query.get('email');

function Vkontakte() {

	let history = useHistory();

	const [cookies, setCookie] = useCookies(['token', 'username']);

	const dispatch = useDispatch();
	const system = useSelector(state => state.system);

	useEffect(() => {
		access_token && getData(access_token)
	}, [access_token])

	//получаем данные пользователя
	function getData(access_token) {
		jsonp(`https://api.vk.com/method/users.get?user_ids=${user_id}&fields=uid,email,first_name,last_name,photo&access_token=${access_token}&v=5.103`, null, (err, get) => {
			if(err) {} else {
				let response = get.response[0];
				let data = {
					access_token: access_token,
					email: email,
					first_name: response.first_name,
					last_name: response.last_name,
					user_id: response.id,
					photo: response.photo
				}
				//отправляем данные на сервер
				auth(data);
			}
		});
	}

	async function auth(req) {
		await axios.post(CONFIG[MODE].api + '/sign_up_vk', req)
			.then(response => {
				const data = response.data;
				if(data.success === false) {
					//показываем сообщение сервера
					dispatch(notification(Localized(null, { language: system.language, req: data.msg })))
				} else {
					setCookie('username', data.username, { path: '/', maxAge: 12 * 2592000, httpOnly: false });
					setCookie('token', data.token, { path: '/', maxAge: 12 * 2592000, httpOnly: false });
					dispatch(system_status('identifed'));
				}
			})
			.catch((error) => {
				//статус ошибки
				error.response ? (
					console.log('Looks like there was a problem' +
						(error.response.config.url && (' with ' + error.response.config.url)) +
						(error.response.status && ('. Status Code: ' + error.response.status))
					)
				) : console.log('ERROR', error);
			});
		history.push('/')
	}


	return null
}

export default Vkontakte;