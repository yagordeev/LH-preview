const systemReducer = (state = { 'status': null, 'notification': null, 'language': null, page: { menu: null, submenu: null } }, action) => {
	switch (action.type) {

		case 'STATUS':
			return { ...state, status: action.payload };

		case 'NOTIFICATION':
			return { ...state, notification: action.payload };

		case 'SET_LANGUAGE':
			return { ...state, language: action.payload };

		case 'SET_TITLE':
			return { ...state, title: action.payload };

		case 'OPEN_PAGE':
			return { ...state, page: { menu: action.payload.menu, submenu: action.payload.submenu } };

		default:
			return state
	}
}
export default systemReducer;