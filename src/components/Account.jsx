import { CONFIG, MODE } from '../config.js';
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import io from 'socket.io-client';

import { notification, system_status, delete_project, change_theme, active_project, current_room, clean_chat } from '../actions';
import Title from '../components/Title.jsx';
import Header from '../components/Header.jsx';
import AllProjects from '../components/AllProjects.jsx';
import Project from '../components/Project.jsx';
import Time from '../containers/Account/Time.jsx';
import Invite from '../containers/Project/Invite/Invite.jsx';
import Profile from '../containers/Account/Profile.jsx';
import ChangeLanguage from '../containers/Account/ChangeLanguage.jsx';
import Notification from '../components/Notification.jsx';
import Localized from '../components/Localized.jsx';

const socket = io(CONFIG[MODE].server);

function Account(props) {

	const dispatch = useDispatch();

	const user = useSelector(state => state.user);
	const language = useSelector(state => state.system.language);

	const [footer, setFooter] = useState(false)
	const [showFooter, setShowFooter] = useState(true)

	useEffect(() => {
		let flag = true;

		socket.on('WRONG_TOKEN' + user.token, function() {
			if(flag) {
				//устанавливаем статус - не авторизован
				dispatch(system_status('unauthorized'));
				//показываем сообщение, что токен устарел
				setTimeout(() => {
					dispatch(notification(Localized(null, { language: language, req: "notify_invalid_session" })))
				}, 500)

				console.log("WRONG_TOKEN");
			}
		})
		return () => { flag = false };
	}, [])

	useEffect(() => {
		let flag = true;
		if(flag) {

			socket.on('REMOVE_FROM_PROJECT' + user.username, function(data) {
				if(flag) {
					let info = JSON.parse(data);
					info.project === user.project && goHome();
					dispatch(delete_project(info.project));
					dispatch(notification(Localized(null, { language: language, req: "notify_remove_from_project", param: info.name })))
				}
			});
		}
		return () => { flag = false };
	}, [user])

	function changeTheme() {
		dispatch(change_theme())
	}

	function goHome() {
		if(user.project) {
			dispatch(active_project());
			dispatch(current_room(user.project, null));
		} else {
			window.location.reload(false)
		}
	}

	return (
		<div>
			<Notification/>
			<Title localized='main_title'/>
			<div id="account" className={user.darkTheme ? 'dark' : ''}>
				<div className=" fixed-top flex-row area">
					<div id="logo" >
						<img
							className="logo"
							style={MODE !== 'production' ? {'height': '80%', marginTop: '10%', 'filter': 'grayscale(1) brightness(0.5)'} : {'width': '55px'}}
							src="/img/logomini.svg"
							alt="WebirayLab"
							onClick={goHome}
						/>
						{MODE !== 'production' && (
							<div className="pc" style={{fontSize: 9, letterSpacing: '2px'}}>DEVELOPMENT</div>
						)}
					</div>
					<div className="block main flex-row">
						<div id="lk">
							<Header/>
						</div>
						<div id="menu">
							{((document.body.clientWidth > 600 && user.project) && (
								// (project[user.project] && project[user.project].owner === user.username ) && <Invite />
									<Invite />
							))}

							<Time />
							<Profile />
						</div>
					</div>
				</div>

				<div id="content" className="area">
					<button className={user.project ? "pc back block contrast-text show":"pc back block contrast-text"} onClick={goHome}>
						<img src="/img/p-open.svg" className="clickable" alt="Открыть проект"/>
					</button>
					{user.project ? (
						<Project cookie={props.cookie} />
					) : (
						<AllProjects/>
					)}
				</div>
				<div className={footer ? "fixed-bottom block" : "fixed-bottom block hide"}>
					<div className={showFooter ? "mob show_footer_button" : "mob show_footer_button hide"} onClick={()=>setFooter(p=>!p)}></div>
					<div className="block flex-row">
						<div id="logo">
							<img className="logo" style={{'width': '55px', 'background': 'transparent'}} src="/img/logomini2.svg" alt="WebirayLab"/>
						</div>
						<div id="description" >
							<Localized language={language} req='su' />
						</div>
						<div id="help">
							<Localized language={language} req='help'/>
						</div>
						<ChangeLanguage onHover={(e)=>setShowFooter(e)}/>
						<div id="darktheme" className="checkblock flex-row">
							<img className={!user.darkTheme ? 'active' : ''} src="/img/light.svg" alt="WebirayLab"/>
							<div style={{'position': 'relative', 'width': '50px', 'margin': '0 7px'}}>
								<input type="checkbox" onChange={changeTheme} defaultChecked={user.darkTheme && 'checked'} className="ios-checkbox" id="profession" />
							</div>
							<img className={user.darkTheme ? 'active' : ''} src="/img/dark.svg" alt="WebirayLab"/>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Account;