export const system_status = (status) => {
	return {
		type: 'STATUS',
		payload: status
	};
}

export const notification = (message) => {
	return {
		type: 'NOTIFICATION',
		payload: message
	};
}

export const set_language = (set) => {
	return {
		type: 'SET_LANGUAGE',
		payload: set
	};
}
export const set_title = (set) => {
	return {
		type: 'SET_TITLE',
		payload: set
	};
}
export const open_page = (menu, submenu) => {
	return {
		type: 'OPEN_PAGE',
		payload: { menu: menu, submenu: submenu || null }
	};
}


export const change_theme = () => {
	return {
		type: 'CHANGE_THEME'
	};
}

export const authorization = (data) => {
	return {
		type: 'SIGN_IN',
		payload: data
	};
}

export const set_image = (img) => {
	return {
		type: 'SET_IMAGE',
		payload: img
	};
}

export const add_projects = (data, all) => {
	return {
		type: 'ADD_PROJECTS',
		payload: { 'data': data, 'all': all }
	};
}
export const dublicate_project = (data) => {
	return {
		type: 'DUBLICATE_PROJECT',
		payload: data
	};
}
export const delete_project = (data) => {
	return {
		type: 'DELETE_PROJECT',
		payload: data
	};
}
export const active_project = (id) => {
	return {
		type: 'ACTIVE_PROJECT',
		payload: { id: id }
	};
}
export const rename_project = (name, project) => {
	return {
		type: 'RENAME_PROJECT',
		payload: { project: project, name: name }
	};
}

export const clean_chat = () => {
	return {
		type: 'CLEAN_CHAT',
	};
}
export const clean_count = () => {
	return {
		type: 'CLEAN_COUNT',
	};
}

export const arrange_messengers = (messengers) => {
	return {
		type: 'ARRANGE_MESSENGERS',
		payload: messengers
	};
}
export const room_messages = (data, notyfy, admin) => {
	return {
		type: 'ROOM_MESSAGES',
		payload: { data: data, notyfy: notyfy, admin: admin }
	};
}
export const room_message = (messenger, data, room, notyfy, admin) => {
	return {
		type: 'ROOM_MESSAGE',
		payload: { messenger: messenger, data: data, room: room, notyfy: notyfy, admin: admin }
	};
}
export const delete_room = (messenger, room) => {
	return {
		type: 'DELETE_ROOM',
		payload: { messenger: messenger, room: room }
	};
}
export const add_message = (room, message) => {
	return {
		type: 'ADD_MESSAGE',
		payload: { room: room, message: message }
	};
}
export const notify_message = (messenger, room, message, act) => {
	return {
		type: 'NOTIFY_MESSAGE',
		payload: { messenger: messenger, room: room, message: message, act: act }
	};
}
export const count_dialogs = (messenger, room, count, act) => {
	return {
		type: 'COUNT_DIALOGS',
		payload: { messenger: messenger, room: room, count: count, act: act }
	};
}
export const count_message = (room, count, act) => {
	return {
		type: 'COUNT_MESSAGE',
		payload: { room: room, count: count, act: act }
	};
}
export const clear_count = (place) => {
	return {
		type: 'CLEAR_COUNT',
		payload: place
	};
}
export const all_messages = (count) => {
	return {
		type: 'ALL_MESSAGES',
		payload: count
	};
}
export const project_settings = (project, settings) => {
	return {
		type: 'PROJECT_SETTINGS',
		payload: { project: project, settings: settings }
	};
}
export const update_bots = (project, bot) => {
	return {
		type: 'UPDATE_BOTS',
		payload: { project: project, bot: bot }
	};
}
export const current_room = (project, room, msgr) => {
	return {
		type: 'CURRENT_ROOM',
		payload: { project: project, room: room, msgr: msgr }
	};
}