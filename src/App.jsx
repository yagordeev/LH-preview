import { CONFIG, MODE } from './config.js';
import React, { useEffect } from 'react';
import { Route, Switch } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { useSelector, useDispatch } from 'react-redux';
import { system_status, notification, authorization } from './actions';
import axios from 'axios';

import Registration from './containers/Auth/Registration.jsx';
import Login from './containers/Auth/Login.jsx';
import Forgot from './containers/Auth/Forgot.jsx';
import Account from './components/Account.jsx';
import Translate from './components/Translate.jsx';
import Vkontakte from './containers/Auth/Social/Vkontakte.jsx';
import Facebook from './containers/Auth/Social/Facebook.jsx';

function App() {
	const dispatch = useDispatch();
	const status = useSelector(state => state.system.status);

	const [cookies, setCookie, removeCookie] = useCookies(['token', 'username']);

	useEffect(() => {
		let flag = true;

		if(flag) {
			//пользователь уже авторизован - ничего не делаем
			if(status === 'authorized') {
				console.log('authorized');
				//пользователь не авторизован - очищаем куки, если есть
			} else if(status === 'unauthorized') {
				removeCookie('token', { path: '/' });
				removeCookie('username', { path: '/' });
				//пользователь проходит авторизацию
			} else if(status === 'registered') {
				alert('done')
			} else {
				// !system.error && dispatch(error_alert(null));
				if(cookies.token && cookies.username) {
					authonticate();
				} else {
					flag && dispatch(system_status('unauthorized'));
				}
			}
		}
		return () => { flag = false };
	}, [status])


	function authonticate() {
		axios.defaults.headers.common['Authorization'] = "Bearer " + cookies.token;
		axios.get(CONFIG[MODE].api + '/users/get_admin_info')
			.then(response => {
				const data = response.data;
				if(response.status === 200) {
					if(data.success === false) {
						//устанавливаем статус - не авторизован
						dispatch(system_status('unauthorized'));
					} else {
						console.log(data);
						//сохраняем данные администратора
						dispatch(authorization({ token: cookies.token, username: cookies.username, full_name: data.full_name, phone: data.phone, img: data.img, darkTheme: false, project: null }));
						//устанавливаем статус - авторизован
						dispatch(system_status('authorized'));
						//убираем ошибки, если есть
						dispatch(notification(null));
					}
				} else if(response.status === 205) {
					//устанавливаем статус - не авторизован
					dispatch(system_status('unauthorized'));
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
	}

	return (
		<div>
			<Translate/>

			{status && (
				(status === 'authorized') ? (
					<Switch>
						<Route exact path="/" component={()=><Account cookie={cookies}/>} />
						<Route path="*" component={()=><Account cookie={cookies}/>} />
					</Switch>
				):(
					<Switch>
						<Route exact path="/" component={Login} />
						<Route exact path="/reset" component={Forgot} />
						<Route exact path="/register" component={Registration}/>
						<Route path="/auth/vkontakte" component={Vkontakte}/>
						<Route path="/auth/facebook" component={Facebook}/>
						<Route path="*" component={Login} />
					</Switch>
				))}
		</div>
	)
}

export default App;