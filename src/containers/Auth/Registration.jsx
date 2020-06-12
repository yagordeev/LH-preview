import { CONFIG, MODE } from '../../config.js';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { system_status, notification } from '../../actions';
import axios from 'axios';
import InputMask from 'react-input-mask';

import Localized from '../../components/Localized.jsx';
// import { Translate } from '../../components/Translate.jsx';
import Notification from '../../components/Notification.jsx';
import WavesAnimation from './WavesAnimation.jsx';

function Registration(props) {

	let history = useHistory();

	const dispatch = useDispatch();
	const system = useSelector(state => state.system);

	const [user, setUser] = useState({
		surname: '',
		name: '',
		phone: '',
		email: '',
		password: null,
		confirm_password: null,
		validate: {
			password: true,
			confirm_password: true
		}
	});
	const [registered, setRegistered] = useState(false)

	function handleChange(e) {
		let { name, value } = e.target;
		if(name === 'email') { value = value.replace(/[^a-zA-Z0-9-@._-]/ig, ''); }
		setUser(prev => {
			return {
				...prev,
				[name]: value
			}
		})
	}

	//выводим уведомление об ошибках
	function validate(info, pass) {
		info === true ? dispatch(notification(null)) : dispatch(notification(info))

		setUser(prev => {
			return {
				...prev,
				validate: { ...prev.validate, [pass]: info }
			}
		})

	}

	function checkPassword(e) {
		let { name, value } = e.target;
		value = value.replace(/[^a-zA-Z0-9-!@#$%^&*()_-]/ig, '');
		//записываем вводимые данный в стейт
		setUser(prev => ({ ...prev, [name]: value }));

		const containsLetters = /^.*[a-zA-Z]+.*$/; //должен содержать буквы
		//длина основного пароля меньше 6 символов
		if(value.length < 6) {
			//проверяем на условие "содержит буквы"
			if(!containsLetters.test(value)) {
				validate(
					Localized(null, { language: system.language, req: 'notify_no_letters' }),
					'password'
				);
			} else {
				validate(
					Localized(null, { language: system.language, req: 'notify_more_symbols', length: 6 - value.length }),
					'password'
				);
			}
			//длина основного пароля больше 6 символов
		} else {
			//проверяем на условие "содержит буквы"
			if(!containsLetters.test(value)) {
				validate(
					Localized(null, { language: system.language, req: 'notify_no_letters' }),
					'password'
				);
			} else {
				validate(true, 'password');
			}
		}
		//при изменении основного пароля сбрасываем проверочный
		setUser(prev => ({ ...prev, confirm_password: null }));

	}

	function confirmPassword(e) {
		let { name, value } = e.target;

		if(user.validate.password === true) {
			//записываем вводимые данный в стейт
			setUser(prev => {
				return {
					...prev,
					[name]: user.validate.password && value,
				}
			});

			//пароли совпадают
			if(value === user.password) {
				validate(true, 'confirm_password') //нет ошибок
			} else {
				//длина проверочного пароля больше
				if(value.length >= user.password.length) {
					validate(Localized(null, { language: system.language, req: 'notify_missmatch_pass' }), 'confirm_password')
				} else {
					//если длин проверочного пароля меньше - сохраняем ошибку, но не показываем
					setUser(prev => {
						return {
							...prev,
							validate: {
								...prev.validate,
								confirm_password: Localized(null, { language: system.language, req: 'notify_missmatch_pass' })
							}
						}
					});
				}
			}
		}
	}

	function sendForm(e) {
		e.preventDefault();
		if(user.validate.password === true && user.validate.confirm_password === true) {
			// if(!system.notification) {
			axios.post(CONFIG[MODE].api + "/signUp", {
					name: user.name,
					surname: user.surname,
					email: user.email,
					phone: user.phone,
					password: user.password,
					confirm_password: user.confirm_password
				})
				.then(response => {
					console.log(response);
					const data = response.data;
					if(data.success === false) {
						//показываем сообщение сервера
						dispatch(notification(Localized(null, { language: system.language, req: 'notify_' + data.msg })))
					} else {
						// dispatch(system_status('registered'));
						setRegistered(true)
						validate(true)
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
			// }
		} else {
			validate(
				(user.validate.password !== true && user.validate.password) ||
				(user.validate.confirm_password !== true && user.validate.confirm_password)
			)
		}
	}

	return (
		<div className="auth">
			<Notification/>

			<div className="circle">

				{registered ? (
					<div className="case flex-column-100 fade">
						<div className="top">
							<img className="logo link" onClick={()=>history.push('/')} src={"/img/logo-"+system.language+".svg"} alt="WebirayLab"/>
						</div>
						<div className="middle">
							<div className="slogan" style={{marginTop: 0, 'marginBottom': '30px'}}>
								<Localized req='signup_complete' language={system.language} />
								<br></br>
								<Localized req='signup_send_activation' language={system.language}/>
							</div>
							<button onClick={()=>history.push('/')} type="button" className="button" style={{'width': '100%'}}>
								<Localized req='done_button' language={system.language}/>
							</button>
						</div>
						<div className="bottom info"></div>
					</div>
				):(
					<div className="case flex-column-100 fade">
						<div className="top">
							<img className="logo link" onClick={()=>history.push('/')} src={"/img/logo-"+system.language+".svg"} alt="WebirayLab"/>
							<span className="slogan">
								<Localized req='signup' language={system.language}/>
							</span>
						</div>
						<div className="middle">
							<form id="signIn" onSubmit={sendForm}>
								<input
									name="surname"
									placeholder={Localized(null, {language:system.language, req:'surname'})}
									onChange={handleChange}
									value={user.surname || ''}
									autoComplete="off"
									required="required"
								/>
								<div className="flex-row-50 mob-100">
									<input
										name="name"
										placeholder={Localized(null, {language:system.language, req:'firstname'})}
										onChange={handleChange}
										value={user.name || ''}
										autoComplete="off"
										required="required"
									/>
									<InputMask
										type="tel"
										id="phone"
										name="phone"
										mask="+7 (999) 999 99 99"
										maskChar=""
										placeholder="+7 (900) 900 90 90"
										onChange={handleChange}
										value={user.phone || ''}
										autoComplete="off"
										required="required"
									/>
								</div>
								<input
									type="email"
									id="email"
									name="email"
									placeholder={Localized(null, {language:system.language, req:'email'})}
									onChange={handleChange}
									value={user.email || ''}
									autoComplete="off"
									required="required"
								/>
								<input
									type="password"
									name="password"
									placeholder={Localized(null, {language:system.language, req:'password'})}
									onChange={checkPassword}
									value={user.password || ''}
									autoComplete="off"
									required="required"
								/>
								<input
									type="password"
									name="confirm_password"
									placeholder={Localized(null, {language:system.language, req:'confirm_password'})}
									onChange={confirmPassword}
									value={user.confirm_password || ''}
									style={user.validate.confirm_password !== true ? {borderColor: 'red'} : {}}
									autoComplete="off"
								/>
							</form>
							<button type="submit" form="signIn">
								<Localized req='continue' language={system.language}/>
							</button>

						</div>
						<div className="bottom info">
							<Localized req='privacy_policy' language={system.language}/>
							<div className="link" onClick={()=>history.push('/')} style={{paddingTop: '15px',
							borderTop: '1px solid #bbb'}}>
								<Localized language={system.language} req='old_one'/>
							</div>
						</div>
					</div>
					)}

			</div>
			<WavesAnimation/>
		</div>
	)
}

export default Registration;