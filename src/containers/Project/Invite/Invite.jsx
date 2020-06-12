import { CONFIG, MODE } from '../../../config.js';
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { system_status, notification } from '../../../actions';
import io from 'socket.io-client';
import axios from 'axios';

import Users from './Users.jsx';
import Localized from '../../../components/Localized.jsx';

const socket = io(CONFIG[MODE].server);

function Invite() {

	const dispatch = useDispatch();

	const system = useSelector(state => state.system);
	const user = useSelector(state => state.user);
	const project = useSelector(state => state.project[user.project]);
	const [invite, setInvite] = useState(null);
	const [users, setUsers] = useState([]);
	const [status, setStatus] = useState({})

	useEffect(() => {
		let flag = true;

		if(flag) {
			axios.defaults.headers.common['Authorization'] = "Bearer " + user.token;
			axios.get(CONFIG[MODE].api + "/projects/get_project_users?project=" + user.project)
				.then(response => {
					if(response.status === 200) {
						let data = response.data;
						if(data.success === false) {
							//показываем сообщение сервера
							dispatch(notification(Localized(null, { language: system.language, req: data.msg })))
						} else {
							setUsers(data)
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
		socket.on('OPERATOR_STATUS' + user.project, function(i) {
			if(flag) {
				let operator = JSON.parse(i);
				if(operator.accepted === true) {
					//сохраняем оператора в стейт
					setUsers(prev => (
						prev.map((i, key) => i.email === operator.email ? ({ ...i, accepted: true }) : i)
					))
					//показываем уведомление
					dispatch(notification(
						Localized(null, {
							language: system.language,
							req: 'notify_invitation_accepted',
							name: operator.full_name
						})
					));
				} else if(operator.accepted === 'waiting') {
					console.log('operator', operator);
					operator = { ...operator, accepted: false }
					setUsers(prev => [...prev, operator])
					dispatch(notification(
						Localized(null, {
							language: system.language,
							req: 'notify_invitation_sent'
						})
					));
				} else {
					setUsers(prev => (
						prev.filter((i, index) => i.email !== operator.email)
					))
					dispatch(notification(
						Localized(null, {
							language: system.language,
							req: 'notify_invitation_declined',
							name: operator.full_name
						})
					));

				}
			}
		});
		return () => { flag = false };
	}, [])

	useEffect(() => {
		//находим, согласившхся на приглашение, операторов
		const accepted = users.filter((i, key) => i.accepted && i.email !== user.username);
		//находим операторов, которые не ответили на приглашение
		const awaiting = users.filter((i, key) => !i.accepted && i.email !== user.username);
		//сохраняем их количество
		setStatus(prev => ({ accepted: accepted.length, awaiting: awaiting.length }))
		// return array.length > 0 ? true : false
	}, [users])


	function handleChange(e) {
		const { value } = e.target;
		setInvite(value);
	}

	function send() {
		if(invite) {
			let invData = JSON.stringify({
				token: user.token,
				email: invite,
				project: user.project
			})
			socket.emit("SEND_INVITATION", invData);
			setInvite(null);
		}
	}

	function deleteOperator(operator) {
		let invData = JSON.stringify({
			token: user.token,
			project: user.project,
			email: operator
		})
		socket.emit("REMOVE_FROM_PROJECT", invData);
		dispatch(notification(
			Localized(null, {
				language: system.language,
				req: 'notify_operator_deleted',
			})
		));
		setUsers(users.filter((f, index) => f.email !== operator))
	}

	return (project ? (
		project.owner === user.username ? (
			<div id="invite" className="block">
				<div className="button contrast-text">
					<span className=''><Localized language={system.language} req='invite_button'/></span>
				</div>
				<div id="invite_block" className={document.body.clientWidth > 768 ? "popup_arrow" : "popup_arrow_bottom"}>

					<div className="block">
						<div className="scroll block">
							<div id="description" className="contrast-text">
								<Localized language={system.language} req='invite_description'/>

							</div>
							<input
								type="email"
								name="invite"
								className="area input contrast-text"
								onChange={handleChange}
								value={invite || ''}
								placeholder={Localized(null, {language: system.language, req: 'email'})}
								autoComplete="off"
							/>
							<button type="submit" onClick={send} style={{'marginBottom': '10px'}}>
								<Localized language={system.language} req='send_button'/>
							</button>
							<div id="invite_users" className="flex-column-100">
								<div className="invite_waiting" style={status.awaiting > 0 ? {}:{'maxHeight':'0', 'opacity': '0'}}>
									<div className="hr_title flex-row">
										<hr/>
										<div><Localized language={system.language} req='awaiting'/></div>
										<hr/>
									</div>
									<div className="list flex-column-100" style={{'opacity': '0.5'}}>
										{(users).map((i, key)=> !i.accepted && i.email !== user.username && (
											<Users
												key={i.email}
												ready={false}
												email={i.email}
												name={i.full_name}
												img={i.img}
												onDelete={deleteOperator}
											/>
										))}
									</div>
								</div>
								<div className="invite_ready" style={status.accepted > 0 ? {} : {'maxHeight':'0', 'opacity': '0'}}>
									<div className="hr_title flex-row">
										<hr/><div>
											<Localized language={system.language} req='inprogect'/>
										</div><hr/>
									</div>
									<div className="list flex-column-100">
										{(users).map((i, key)=> i.accepted && i.email !== user.username && (
											<Users
												key={i.email}
												ready={true}
												email={i.email}
												name={i.full_name}
												img={i.img}
												onDelete={deleteOperator}
											/>
										))}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		) : null
	) : null)
}

export default Invite;