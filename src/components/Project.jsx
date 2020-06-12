import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';

import { notification, current_room, open_page, project_settings } from '../actions';

import Localized from '../components/Localized.jsx';
import Invite from '../containers/Project/Invite/Invite.jsx';

import Chat from '../containers/Project/Chat/Chat.jsx';
import ChatSettings from '../containers/Project/Chat/ChatSettings/ChatSettings.jsx';
import CountMessage from '../containers/Project/Chat/CountMessage.jsx';

import Statistics from '../containers/Project/Statistics/Statistics.jsx';

import Owner from '../containers/Project/Owner/Owner.jsx';
import Constructor from '../containers/Project/Owner/Constructor.jsx';

let queryString = window.location.search;
let query = new URLSearchParams(queryString);
let menu = query.get('menu');
let submenu = query.get('submenu');
let pay = query.get('pay');

function Project() {

	const dispatch = useDispatch();

	let history = useHistory();

	// console.log('RENDER');

	const system = useSelector(state => state.system);
	const page = useSelector(state => state.system.page);
	const user = useSelector(state => state.user);
	const project = useSelector(state => state.project[user.project]);

	useEffect(() => {
		let flag = true;
		if(flag && (project && ['settings'] in project && project.settings.messengers)) {
			if(project.settings.messengers && queryString) {
				if(menu) {
					dispatch(open_page(menu, submenu || null));
				}
				if(pay === 'success') {
					dispatch(open_page('Owner', 'Owner'));
					dispatch(notification(Localized(null, { language: system.language, req: 'notify_pay_success' })));
				}
				history.push('/');
				queryString = null
			}
		}
		return () => { flag = false };
	}, [project])

	function back() {
		if(!project.current_room) {
			openPage(system.page.menu, null)
		} else {
			dispatch(current_room(user.project, null));
			openPage(system.page.menu, null)
		}
	}

	function openPage(menu, submenu) {
		dispatch(open_page(menu, submenu));
	}

	return (
		(project && ['settings'] in project && project.settings.messengers ? (
			<div id="project" className="fade area">

				<div className={!page.submenu ? "block left-block" : "block left-block hide"}>
					<div className={page.menu === 'Chat' ? 'menu block active' : 'menu block'}>
						<div onClick={()=>openPage('Chat', 'Chat')} className={page.submenu === 'Chat' ? 'active flex-row-start' : 'flex-row-start'}>
							<div className="text"><Localized language={system.language} req='chat'/></div>
							{/* {count > 0 && (
								<div className="counter area scale">{count}</div>
							)} */}
							<CountMessage name="all" save={false} orange={true}/>

						</div>
						<div className="submenu">
							{project.owner === user.username && (
								<div onClick={()=>openPage('Chat','ChatSettings')} className={page.submenu === 'ChatSettings' ? 'active' : ''}>
									<div className="text"><Localized language={system.language} req='сhats'/></div>
								</div>
							)}
							<div className="disabled">
								<div className="text"><Localized language={system.language} req='chat_bot'/></div>
							</div>
							<div className="disabled">
								<div className="text"><Localized language={system.language} req='chat_selfmenu'/></div>
							</div>
						</div>
					</div>
					<div className="menu block disabled">
						<Localized language={system.language} req='statistics'/>
					</div>

					{project.owner === user.username && (
						<div className={page.menu === 'Owner' ? 'menu block active' : 'menu block'}>
							<div onClick={()=>openPage('Owner','Owner')} className={page.submenu === 'Owner' ? 'active' : ''}>
								<div className="text"><Localized language={system.language} req='owner'/></div>
							</div>
							<div className="submenu">
								<div onClick={()=>openPage('Owner', 'Constructor')} className={page.submenu === 'Constructor' ? 'active' : ''}>
									<div className="text"><Localized language={system.language} req='owner_constructor'/></div>
								</div>
								<div className="disabled">
									<div className="text"><Localized language={system.language} req='owner_chat_archive'/></div>
								</div>
							</div>
						</div>
					)}

					{(document.body.clientWidth < 768) && <Invite />}
				</div>

				<div className={page.submenu ? "right-block" : "right-block hide"} style={project.current_room ? {'overflow': 'hidden'}:{}}>
					<button className="mob back contrast-text" onClick={back}>
						<ArrowBackIosIcon style={{fontSize: 11}}/>
						{!project.current_room ?(
							<span>
								<Localized language={system.language} req='project'/>
								{' "'+project.project_name+'"'}
							</span>
						):(
							<span>
								<Localized language={system.language} req='to_dialogs'/>
								{' "'+project.project_name+'"'}
							</span>
						)}
					</button>
					<Chat hidden={page.submenu === 'Chat' ? false : true}/>
					{page.submenu === 'Statistics' && <Statistics/>}
					{(page.submenu === 'ChatSettings' && project.owner === user.username) && (
						<ChatSettings/>
					)}
					{(page.submenu === 'Owner' && project.owner === user.username) && (
						<Owner/>
					)}
					{(project.owner === user.username) && (
						<Constructor hidden={(page.submenu === 'Constructor') ? false : true}/>
					)}

				</div>
			</div>
		) : null)
	)
}

export default Project;