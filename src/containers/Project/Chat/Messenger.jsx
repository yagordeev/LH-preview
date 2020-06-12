import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import Dialog from './Dialog.jsx';
import CountMessage from './CountMessage.jsx';
import Localized from '../../../components/Localized.jsx';

function Messenger(props) {

	const messenger = props.messenger;

	const user = useSelector(state => state.user);
	const system = useSelector(state => state.system);
	const project = useSelector(state => state.project[user.project]);
	const operators = useSelector(state => state.project[user.project].settings.operators);
	const dialogs = useSelector(state => state.chat[messenger]);

	const [filtered, setFiltered] = useState([]);
	const [operatorChat, setOperatorChat] = useState({ room: '', count: 0 });

	const [lastMessage, setLastMessage] = useState({});

	const [count, setCount] = useState(0);
	const [show, setShow] = useState(false);

	useEffect(() => {
		let flag = true;
		if(flag) {
			//общий чат
			let projectDialog = dialogs[Object.keys(dialogs)[0]] || false;
			if(projectDialog) {
				let operators_room = projectDialog[0] && projectDialog[0].roomName;
				let chat_operators = [];
				projectDialog.map(f => f.system === 'enter' && chat_operators.push(f.author));
				let operators_settings = operators.map(f => f.email);
				let arrays = [chat_operators, operators_settings]
				let active_operators = arrays.reduce((join, current) => join.filter(el => current.includes(el)));
				//счетаем количество людей в общем чате
				setOperatorChat((prev) => ({ ...prev, room: operators_room, count: active_operators.length }))
			}
			let lastMessagesArray = {};
			//выбираем последние сообщения в каждом диалоге
			Object.keys(dialogs).map(name => {
				for(let i = dialogs[name].length - 1; i >= 0; i--) {
					if(dialogs[name][i].messenger === 'projectMessenger') {
						if(i === 0) {
							lastMessagesArray[name] = dialogs[name][i]
							break;
						} else {
							if(dialogs[name][i].type === 'human') {
								lastMessagesArray[name] = dialogs[name][i]
								break;
							}
						}
					} else {
						if(dialogs[name][i].type === 'human') {
							lastMessagesArray[name] = dialogs[name][i]
							break;
						}
					}
				}
				return null
			})
			setLastMessage(lastMessagesArray);
		}
		return () => { flag = false };
	}, [dialogs])

	useEffect(() => {
		let flag = true;
		if(flag) {
			//фильтруем диалоги по дате
			if(Object.keys(lastMessage).length > 0) {
				let newDialogs = Object.keys(lastMessage).filter(f => !lastMessage[f].operator);
				let sortNewDialogs = newDialogs.sort((a, b) => {
					var new_a1 = new Date(lastMessage[a].time);
					var new_b1 = new Date(lastMessage[b].time);
					return Date.parse(new_b1) - Date.parse(new_a1);
				})
				let oldDialogs = Object.keys(lastMessage).filter(f => lastMessage[f].operator);
				let sortOldDialogs = oldDialogs.sort((a, b) => {
					var old_a1 = new Date(lastMessage[a].time);
					var old_b1 = new Date(lastMessage[b].time);
					return Date.parse(old_b1) - Date.parse(old_a1);
				})
				setFiltered([...sortNewDialogs, ...sortOldDialogs])
			}
		}
		return () => { flag = false };
	}, [lastMessage])


	return (
		<div className={show ? "block fade-top show" : 'block fade-top'}>
			<CountMessage name={messenger} save = { true } onSave={setCount}/>
			<div onClick={()=>setShow(prev => !prev)} className="header flex-row">
				<span className="title contrast-text">
					<Localized language={system.language} req={messenger}/>
				</span>
				{messenger === 'projectMessenger' ? (
					<div className="flex-row">
						<img src="/img/dialogs.svg" alt="Операторы"/>
						<span className="contrast-text">{operatorChat.count}</span>
						{/* <img src={count[messenger] > 0 ? "/img/newmessages.svg": "/img/messages.svg"
}
alt = "Сообщения" / >
	<span style={{color: count[messenger] > 0 ? '#FF8900': '#6F6EFF'}} className="contrast-text">
							{count[operatorChat.room] || 0}
						</span> * /}
						<img src="/img/messages.svg" alt="Сообщения"/>
						<span style={{color: '#6F6EFF'}} className="contrast-text">
							<CountMessage name={operatorChat.room} save={false}/>
						</span>
					</div>
				):(
					<div className="flex-row">
						<img src="/img/dialogs.svg" alt="Диалоги"/>
						<span className="contrast-text">{Object.keys(dialogs).length || 0}</span>
						<img src={count > 0 ? "/img/newmessages.svg": "/img/messages.svg"} alt="Сообщения"/>
						<span style={{color: count > 0 ? '#FF8900': '#6F6EFF'}} className="contrast-text">
							{count || 0}
						</span>
					</div>
				)}
			</div>

			{(filtered).map((name, i) => lastMessage[name] && (
				<Dialog
					key={name}
					name={name}
					messenger={messenger}
					user={user}
					project={project}
					system={system}
					messages={dialogs[name]}
					lastMessage={lastMessage[name]}
				/>
			))}

		</div>
	)
}

export default Messenger;
