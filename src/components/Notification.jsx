import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { notification } from '../actions';
import Localized from '../components/Localized.jsx';
import InfoIcon from '@material-ui/icons/Info';

function Notification() {
	const dispatch = useDispatch();
	const message = useSelector(state => state.system.notification);

	const [msg, setMsg] = useState(null)

	useEffect(() => {
		if(message) {
			setMsg(message);
			const timer = setInterval(() => {
				dispatch(notification(null));
			}, 3000);
			return () => clearInterval(timer);
		}
	}, [message])

	return (
		<div>
			<div className={message ? "system_message show": "system_message"}><InfoIcon/>{msg}</div>
		</div>
	)
}

export default Notification;