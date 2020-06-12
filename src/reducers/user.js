import produce from 'immer';

const userReducer = (state = [], action) => {
	switch (action.type) {
		case 'SIGN_IN':
			return action.payload;
		case 'SET_IMAGE':
			return ({ ...state, img: action.payload });
		case 'ACTIVE_PROJECT':
			// return ({ ...userReducer, project: userReducer.project ? null : action.payload.id });
			return produce(state, userReducer => {
				userReducer.project = userReducer.project ? null : action.payload.id
			})
		case 'CHANGE_THEME':
			return ({ ...state, darkTheme: !state.darkTheme });
		default:
			return state
	}
}
export default userReducer;