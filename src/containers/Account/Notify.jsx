import { CONFIG, MODE } from '../../config.js';
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { system_status, notification, add_projects } from '../../actions';
import io from 'socket.io-client';
import axios from 'axios';

import Localized from '../../components/Localized.jsx';

const socket = io(CONFIG[MODE].server);

function Notify(props) {
	const dispatch = useDispatch();

	const system = useSelector(state => state.system);
	const user = useSelector(state => state.user);

	const [notify, setNotify] = useState([]);


	useEffect(() => {
		let flag = true;
		if(flag) {
			//проверяем наличие активных приглашений
			axios.defaults.headers.common['Authorization'] = "Bearer " + user.token;
			axios.get(CONFIG[MODE].api + '/projects/get_invitations')
				.then(response => {
					if(response.status === 200) {
						let data = response.data;
						if(data.success === false) {
							//показываем сообщение сервера
							dispatch(notification(Localized(null, { language: system.language, req: data.msg })))
						} else {
							//сохраняем данные всех имеющихся приглашений
							setNotify(data);
						}
					} else if(response.status === 205) {
						//устанавливаем статус - не авторизован
						dispatch(system_status('unauthorized'));
						//показываем сообщение, что токен устарел
						dispatch(notification(Localized(null, { language: system.language, req: "notify_invalid_session" })))
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
		return () => { flag = false };
	}, []);

	useEffect(() => {
		let flag = true;
		//передаем количество приглашений
		props.onCount(notify.length);
		//получение нового приглашения в режиме реального времени
		socket.on('GET_INVITATION' + user.username, function(data) {
			let info = JSON.parse(data);
			//сохраняем данные приглашения
			if(flag) {
				console.log('INVITATION', info, notify);
				//проверяем, есть ли приглашение с этим проектом
				let unique = notify.filter(i => i.project === info.project).length === 0;
				if(unique) {
					setNotify(prev => [...prev, info]);
					//системное уведомление
					dispatch(notification(
						Localized(null, {
							language: system.language,
							req: 'invitation_description',
							param: info.project_name
						})
					));
				}
			}
		});

		socket.on('REMOVE_INVITATION' + user.username, function(data) {
			let info = JSON.parse(data);
			//сохраняем данные приглашения
			if(flag) {
				console.log('REMOVE_FROM_PROJECT', info);

				setNotify(prev => prev.filter(i => i.project !== info.project));
				//системное уведомление
				dispatch(notification(
					Localized(null, {
						language: system.language,
						req: 'invitation_removed',
						param: info.project_name
					})
				));

			}
		});
		return () => { flag = false };
	}, [notify])

	//функция ответа на приглашение
	function answer(project, answer) {
		let invData = JSON.stringify({
			token: user.token,
			project: project,
			accept: answer
		})
		socket.emit("ACCEPT_INVITATION", invData);
		//убираем приглашение из массива
		setNotify(prev => (
			prev.filter((i, key) => i.project !== project)
		))
		//если ответ положительный - добавляем проект
		answer && addProject(project)
	}

	function addProject(project) {
		let data = notify.filter(i => (i.project === project))
		dispatch(add_projects(data[0], false))
	}

	return (
		<div>
			{notify.length > 0 && (
				<div className="hr_title flex-row" style={{'paddingTop': '15px'}}>
					<hr/><div>
						<Localized language={system.language} req='notifications'/>
					</div><hr/>
				</div>
			)}

			{notify.map((i, key)=>(
				<div key={key} className="notify flex-column-100 area">
					<div className="title">
						<Localized language={system.language} req='invitation'/>
					</div>
					<div className="description contrast-text">
						<Localized language={system.language} req='invitation_description' param={i.project_name}/>
					</div>
					<div className="accept_block flex-row">
						<button type="button" className="button" onClick={()=>answer(i.project, true)}>
							<Localized language={system.language} req='accept_button'/>
						</button>
						<button type="button" className="button" onClick={()=>answer(i.project, false)}>
							<Localized language={system.language} req='decline_button'/>
						</button>
					</div>
				</div>
			))}
		</div>
	)
}

export default Notify;