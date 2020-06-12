import { CONFIG, MODE } from '../../../config.js';
import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { system_status, notification, arrange_messengers, room_message, add_message, notify_message, count_dialogs, count_message, clear_count, project_settings } from '../../../actions';
import io from 'socket.io-client';
import axios from 'axios';

import Skeleton from '@material-ui/lab/Skeleton';

import Messenger from './Messenger.jsx';
import Localized from '../../../components/Localized.jsx';

const socket = io(CONFIG[MODE].server);

function ChatRooms() {

	const dispatch = useDispatch();

	const system = useSelector(state => state.system);
	const user = useSelector(state => state.user);
	const settings = useSelector(state => state.project[user.project].settings);
	const currentRoom = useSelector(state => state.project[user.project].current_room);

	const [messengers, setMessengers] = useState([]);
	const [activeMessengers, setActiveMessengers] = useState([]);
	const [showDialogs, setShowDialogs] = useState(false)

	console.log('CHATROOMS RENDER');

	useEffect(() => {
		let flag = true;

		if(flag) {
			let limits = settings.messengers.limit;
			//вытаскиваем только activated мессенджеры
			let activated = Object.keys(limits).filter((item, i) => limits[item].activated);
			if(activated.length !== activeMessengers.length) {
				setActiveMessengers(activated);
				// выводим подключенные мессенджеры (messengers)
				dispatch(arrange_messengers(activated));
				// сохраняем в стейт
				(messengers.length !== activated.length) && setMessengers(activated);
				// запрашиваем историю сообщений
				history(null, activated);
			}
		}
		return () => { flag = false };
	}, [settings])

	useEffect(() => {
		let flag = true;
		flag && socket.emit('ADD_USER', user.token, 'baseMessenger');

		//получаем настройки проекта, если изменятся
		socket.on("PROJECT_SETTINGS" + user.project, function(data, msg) {
			if(flag) {
				let settings = JSON.parse(data);
				//сохраняем настройки проекта
				dispatch(project_settings(user.project, settings));
				console.log('PROJECT_SETTINGS', settings, msg);
				//показываем уведомление, если есть
				msg && dispatch(notification(Localized(null, { language: system.language, req: 'notify_settings_' + msg })))
			}
		});

		//получаем новый диалог
		socket.on("ADD_ROOM" + user.project, function(room, project) {
			if(flag) {
				history(room.roomName, room.messenger)
				console.log('ADD_ROOM', room.roomName);
			}
		})
		return () => { flag = false };
	}, [])

	useEffect(() => {
		let flag = true;
		//получаем новое сообщение (или отправленное свое)
		socket.on("MESSAGE" + user.project, function(msg) {
			const message = JSON.parse(msg)
			const new_message = Localized(null, {
				language: system.language,
				req: 'new_message'
			})
			//системное сообщение "Новое сообщение"
			const notifyMessage = {
				author: '',
				is_me: "local",
				full_name: "system",
				message: new_message,
				operator: true,
				reply: "",
				type: "system",
				system: 'new_message',
				time: message.time,
				messenger: message.messenger,
				roomName: message.roomName
			}

			if(flag) {
				console.log('currentRoom', currentRoom);
				//если собщение пришло вне активной комнаты и не системное - добавляем системное сообщение
				if(currentRoom !== message.roomName && message.type !== 'system') {
					// console.log('count[message.roomName]', count[message.roomName]);
					dispatch(notify_message(message.messenger, message.roomName, notifyMessage, 'add'))
				}
				//сохраняем основное сообщение в чате
				dispatch(add_message(message.roomName, message));
				//если сообщение написал оператор
				if(message.operator && message.type !== 'system') {
					//если админ не в комнате -> оставляем "новое сообщение"
					if(message.author === user.username) {
						//удаляем уведомление "новое сообщение"
						dispatch(notify_message(message.messenger, message.roomName, notifyMessage, 'remove'))
					}
					//если в чате есть новые сообщения - удаляем из счетчика мессенджера комнату
					if(message.messenger === 'projectMessenger') {
						//если сообщение от админа
						(message.author === user.username) && dispatch(count_dialogs(message.messenger, message.roomName, 1, 'remove'));
					} else {
						dispatch(count_dialogs(message.messenger, message.roomName, 1, 'remove'));
					}
					//очищаем счетчик комнаты
					dispatch(clear_count(message.roomName));
				}
				if(message.messenger === 'projectMessenger') {
					if(message.type !== 'system' && message.author !== user.username) {
						//если в чате еще нет новых сообщений - добавляем к счетчику мессенджера комнату
						dispatch(count_dialogs(message.messenger, message.roomName, 1, 'add'));
						//сохраняем количество новых сообщений комнаты
						dispatch(count_message(message.roomName, 1, 'add'));
						//проигрываем звук
						playSound();
					}
				} else {
					//добавлям в счетчик все новые сообщения, кроме сообщений админа и системных
					if(!message.operator && message.type !== 'system') {
						//если в чате еще нет новых сообщений - добавляем к счетчику мессенджера комнату
						dispatch(count_dialogs(message.messenger, message.roomName, 1, 'add'));
						//сохраняем количество новых сообщений комнаты
						dispatch(count_message(message.roomName, 1, 'add'));
						//проигрываем звук
						playSound();
						const title = document.title;
						document.title = new_message + '!';
						setTimeout(() => {
							document.title = title;
						}, 3000)
					}
				}
				console.log('MESSAGE', message);
			}
		})
		return () => { flag = false };
	}, [currentRoom])

	//история сообщений
	function history(room, msgrs) {
		axios.defaults.headers.common['Authorization'] = "Bearer " + user.token;
		axios.post(CONFIG[MODE].api + '/users/get_room_history', room ? { "roomName": room } : {})
			.then(response => {
				if(response.status === 200) {
					let data = response.data;
					if(data.success === false) {
						//показываем сообщение сервера
						dispatch(notification(Localized(null, { language: system.language, req: data.msg })))
					} else {
						//уведомление "новое сообщение"
						const notyfyMessage = Localized(null, { language: system.language, req: 'new_message' })
						//подготавливаем все диалоги
						if(!room) {
							//объект для всех диалогов
							let d = {};
							//расскладываем сообщения по диалогам
							data.map(message => !d[message.roomName] ? (
								d[message.roomName] = [message]
							) : (
								d[message.roomName].push(message)
							))
							//обрабатываем все диалоги
							Object.keys(d).map((i, index) => (
								prepareDialog(d[i][0].messenger, d[i], d[i][0].roomName, notyfyMessage)
							));
							//показываем диалоги на странице
							msgrs.length > 0 && setShowDialogs(true);
						} else {
							//обрабатываем запрошенный диалог
							prepareDialog(data[0].messenger, data, data[0].roomName, notyfyMessage)
						}
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

	//обработка диалога
	function prepareDialog(messenger, data, room, notyfyMessage) {
		//сохраняем историю сообщений комнаты
		dispatch(room_message(messenger, data, room, notyfyMessage, user.username))
		//считаем количество последних сообщений клиента
		let count = 0;
		if(messenger === 'projectMessenger') {
			for(let i = data.length - 1; i >= 0; i--) {
				//если первое сообщение системное - перепрыгиваем
				if(data[i].author === user.username) {
					if(i === (data.length - 1) && data[i].type === 'system') {
						/* ничего не делаем */
					} else {
						break; //тормозим счетчик на сообщении от оператора
					}
				} else(data[i].type !== 'system') && count++;
			}
		} else {
			for(let i = data.length - 1; i >= 0; i--) {
				//если первое сообщение системное - перепрыгиваем
				if(data[i].operator) {
					//тормозим счетчик на сообщении от любого оператора
					if(data[i].type !== 'system') break;
				} else {
					//плюсуем
					if(data[i].type !== 'system') count++
				};
			}
		}
		//если есть новые сообщения - добавляем к счетчику мессенджера +1
		if(count > 0) {
			dispatch(count_dialogs(messenger, room, 1, 'add'))
		}
		//сохраняем количество новых сообщений комнаты
		dispatch(count_message(room, count, 'add'));
	}

	async function playSound() {
		var audio = new Audio(); // Создаём новый элемент Audio
		audio.src = '/sound/all-eyes-on-me.mp3'; // Указываем путь к звуку
		try {
			await audio.play();
		} catch (err) {
			console.log('Sound notifications are not allowed on this device, please enable it in the settings.');
		}
	}

	return (
		(!showDialogs) ? (
			<div id="messenger" className={currentRoom ? "fade hide" : "fade"} style={{marginTop: '10px'}}>
				{messengers.length > 0 ? (
					(messengers.map((loading, index) =>
						<React.Fragment key={loading}>
							{index === 1 && <hr></hr>}
							<div className="block fade unclickable">
								<div className="header flex-row">
									<Skeleton variant="text" width={'50%'} height={25}/>
									<div className="flex-row">
										<Skeleton variant="circle" width={30} height={30} />
										<Skeleton variant="text" width={10} height={25} style={{ marginLeft: '5px' }} />
										<Skeleton variant="circle" width={30} height={30} style={{ marginLeft: '15px' }}/>
										<Skeleton variant="text" width={10} height={25} style={{ marginLeft: '5px' }}/>
									</div>
								</div>
								<Skeleton className="skeleton"/>
							</div>
						</React.Fragment>
					))
				):(
					<div id="emptyMessenger" className="block fade">
						<div>
							<Localized language={system.language} req='no_messages'/>
						</div>
						<Skeleton animation="wave" className="skeleton"/>
					</div>
				)}
			</div>
		) : (
			<div id="messenger" className={currentRoom ? "fade hide" : "fade"}>
				{messengers.map((item, i) => item === 'projectMessenger' &&
					<Messenger
						key={item}
						messenger={item}
					/>
				)}
				<hr className="fade-top"></hr>
				{messengers.map((item, i) => item !== 'projectMessenger' &&
					<Messenger
						key={item}
						messenger={item}
					/>
				)}
			</div>
		)
	)
}

export default ChatRooms;