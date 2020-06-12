const countReducer = (state = [], action) => {

	let messenger = '';
	let room = '';


	switch (action.type) {

		case 'CLEAN_COUNT':
			return [];

		case 'COUNT_MESSAGE':
			room = action.payload.room;
			return (
				action.payload.act === 'add' ? ({
					...state,
					[room]: (state[room] || 0) + action.payload.count
				}) : ({
					...state,
					[room]: (state[room]) - action.payload.count
				})
			);
		case 'CLEAR_COUNT':
			return ({
				...state,
				[action.payload]: 0
			});

		case 'ALL_MESSAGES':
			return ({
				...state,
				all: action.payload || 0,
			});

		case 'COUNT_DIALOGS':
			messenger = action.payload.messenger;
			room = action.payload.room;
			let count = 0;
			if(action.payload.act === 'add') {
				//если в чате еще нет новых сообщений - добавляем к счетчику мессенджера комнату
				(state[room] === 0 || !([room] in state)) ? (
					count = (state[messenger] || 0) + action.payload.count
				) : (
					count = state[messenger]
				)
			} else {
				(state[room] > 0 || !([room] in state)) ? (
					count = (state[messenger] === 0) ? 0 : (state[messenger] - action.payload.count)
				) : (
					count = state[messenger]
				)
			}
			return ({
				...state,
				[messenger]: count
			});

		default:
			return state
	}
}
export default countReducer;