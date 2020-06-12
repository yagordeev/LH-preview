import { CONFIG, MODE } from '../../../config.js';
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import produce from 'immer';
import { system_status, notification } from '../../../actions';
import axios from 'axios';
import io from 'socket.io-client';
import Skeleton from '@material-ui/lab/Skeleton';
import AddShoppingCartIcon from '@material-ui/icons/AddShoppingCart';

import Typed from 'typed.js';

import Localized from '../../../components/Localized.jsx';
import Cart from './containers/Cart.jsx';

const socket = io(CONFIG[MODE].server);

function Constructor(props) {

	const dispatch = useDispatch();

	const system = useSelector(state => state.system);
	const user = useSelector(state => state.user);
	const project = useSelector(state => state.project);

	const settings = project[user.project].settings;

	let currency = Localized(null, { language: system.language, req: 'currency' });
	let currency_price = 'price_' + currency;

	const [constructor, setConstructor] = useState({
		// operators: { quantity: 0, price_rub: 500, price_eur: 7, validity: 1, category: 'base', multi: true },
		// telegram: { quantity: 0, price_rub: 1000, price_eur: 14, validity: 1, category: 'base', multi: true },
		// viber: { quantity: 0, price_rub: 1000, price_eur: 14, validity: 1, category: 'messenger', multi: true },
		// vk: { quantity: 0, price_rub: 1000, price_eur: 14, validity: 1, category: 'messenger', multi: true },
		// redesign: { quantity: 0, price_rub: 3000, price_eur: 42, validity: 1, category: 'extra', multi: false },
	});

	const [cart, setCart] = useState({});


	useEffect(() => {
		//получаем инфу по всем функциям для конструктора
		axios.get(CONFIG[MODE].api + "/billing/get_contructor")
			.then(response => {
				if(response.status === 200) {
					const data = response.data;
					if(data.success === false) {
						//показываем сообщение сервера
						dispatch(notification(Localized(null, { language: system.language, req: data.msg })))
					} else {
						setConstructor(data.constructor)
						//восстанавливаем содержимое корзины, если есть
						if(Object.keys(settings.cart).length !== 0) {
							setCart(settings.cart);
							Object.keys(settings.cart).map(item => (
								setConstructor(prev => ({ ...prev, [item]: settings.cart[item] }))
							));
						}
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


	}, [])

	useEffect(() => {
		//считаем общую сумму корзины
		let price = 0;
		Object.keys(constructor).map(key => (
			price = price + (constructor[key][currency_price] * constructor[key].quantity)
		))
	}, [constructor])

	useEffect(() => {
		//сохраняем данные при каждом изменении корзины
		let order = {
			token: user.token,
			project: user.project,
			cart: cart
		}
		socket.emit("ADD_CART", order);
		//если корзина пустая - показываем тайпер
		if(Object.keys(constructor).length > 0 && Object.keys(cart).length === 0) {
			let advantages = new Typed('.typer', {
				strings: ['поднять продажи.', 'обойти конкурентов.', 'соответствовать репутации.', 'быть всегда на связи.'],
				typeSpeed: 70,
				backSpeed: 50,
				startDelay: 700,
				backDelay: 700,
				loop: true,
				loopCount: Infinity,
				smartBackspace: true,
			})
		}
	}, [cart])


	function quantity(action, item) {
		//считаем количество подключенных тех и или иных функций в конструкторе
		let newItem = {
			quantity: constructor[item].quantity + (
				action === 'increase' ? (+1) : (
					constructor[item].quantity > 0 ? (-1) : (0)
				)),
			price_rub: constructor[item]['price_rub'],
			price_eur: constructor[item]['price_eur'],
			validity: constructor[item].validity,
			multi: constructor[item].multi
		};
		//если количество больше 0 - сохраняем, иначе удаляем из корзины
		if(newItem.quantity > 0) {
			setConstructor(prev => ({ ...prev, [item]: newItem }));
			setCart(prev => ({ ...prev, [item]: newItem }));
		} else {
			cart[item] && deleteItem(item)
		}
	}

	function activate(item) {
		if(!settings[item]) {
			const activated = constructor[item].quantity === 0 ? 1 : 0;
			setConstructor(prev => ({ ...prev, [item]: { ...prev[item], quantity: activated } }));
			if(activated) {
				setCart(prev => ({ ...prev, [item]: { ...constructor[item], quantity: activated } }))
			} else {
				deleteItem(item)
			}
		}
	}

	function edit(item, quantity, validity) {
		setConstructor(
			produce(constructor, state => {
				state[item] = {
					...state[item],
					quantity: quantity || state[item].quantity,
					validity: validity || state[item].validity
				}
			})
		);
		setCart(
			produce(cart, state => {
				state[item] = {
					...state[item],
					quantity: quantity || state[item].quantity,
					validity: validity || state[item].validity
				}
			})
		)
	}

	function deleteItem(item) {
		setConstructor(prev => ({
			...prev,
			[item]: { ...prev[item], quantity: 0, validity: 1 }
		}));
		let newCart = {}
		Object.keys(cart).map(m => (m !== item && (newCart[m] = cart[m])));
		setCart(newCart)
	}

	function convert(p) {
		return p.toLocaleString('ru-Ru', { style: 'currency', currency: currency, minimumFractionDigits: 0 })
	}

	return (
		Object.keys(constructor).length > 0 ? (
			<div id="constructor" className={props.hidden ? 'hidden' : ''}>
				<div className="leftcolumn fade-top">

					<div className="block box fade-top">
						<span className="title contrast-text">
							<Localized language={system.language} req='constructor_base'/>
						</span>
						<div className="option">
							<div className="head flex-row">
								<img className="icon" src="/img/people.svg" alt="operators"></img>
								<span className="name">
									<Localized language={system.language} req='constructor_operators'/>
								</span>
								<div className="hide_block">
									<div className="quantity flex-row">
										<button className={constructor.operators.quantity !== 0 ? "change" : "change disabled" } onClick={()=>quantity('decrease', 'operators')}>
											<div>-</div>
										</button>
										<div className="number">
											{String(settings.operator + constructor.operators.quantity)}
										</div>
										<button className="change" onClick={()=>quantity('increase', 'operators')}>
											<div>+</div>
										</button>
									</div>
								</div>
							</div>
							<div className="description">
								<Localized language={system.language} req='constructor_operators_description' param={convert(constructor['operators'][currency_price])}/>
							</div>
						</div>
						<div className="option">
							<div className="head flex-row">
								<img className="icon" src="/img/wl.svg" alt="webchat"></img>
								<span className="name">
									<Localized language={system.language} req='constructor_baseMessenger'/>
								</span>
							</div>
							<div className="description">
								<Localized language={system.language} req='constructor_baseMessenger_description'/>
							</div>
						</div>
						<div className="option">
							<div className="head flex-row">
								<img className="icon" src="/img/telegram.svg" alt="telegram"></img>
								<span className="name">
									<Localized language={system.language} req='telegram'/>
								</span>
							</div>
							<div className="description">
								<Localized language={system.language} req='constructor_telegram_description'/>
							</div>
							<div className="hide_block flex-row">
								<div className="text">
									<Localized language={system.language} req='constructor_accoun_quantity'/>
								</div>
								<div className="quantity flex-row">
									<button className={constructor.telegram.quantity !== 0 ? "change" : "change disabled" } onClick={()=>quantity('decrease', 'telegram')}>
										<div>-</div>
									</button>
									<div className="number">
										{String(settings.messengers.limit.telegram.limit + constructor.telegram.quantity)}
									</div>
									<button className="change" onClick={()=>quantity('increase', 'telegram')}>
										<div>+</div>
									</button>
								</div>
							</div>
							<div className="description">
								<Localized language={system.language} req='constructor_account_price' param={convert(constructor['telegram'][currency_price])}/>
							</div>
						</div>
					</div>

					<div className="block box fade-top">
						<span className="title contrast-text">
							<Localized language={system.language} req='constructor_messengers'/>
						</span>
						<div className="option">
							<div className="head flex-row">
								<img className="icon" src="/img/viber.svg" alt="viber"></img>
								<span className="name">
									<Localized language={system.language} req='viber'/>
								</span>
							</div>
							<div>
								<div className="description">
									<Localized language={system.language} req='constructor_viber_description'/>
								</div>
								<div className="hide_block flex-row">
									<div className="text">
										<Localized language={system.language} req='constructor_accoun_quantity'/>
									</div>
									<div className="quantity flex-row">
										<button className={constructor.viber.quantity !== 0 ? "change" : "change disabled" } onClick={()=>quantity('decrease', 'viber')}>
											<div>-</div>
										</button>
										<div className="number">
											{String(settings.messengers.limit.viber.limit + constructor.viber.quantity)}
										</div>
										<button className="change" onClick={()=>quantity('increase', 'viber')}>
											<div>+</div>
										</button>
									</div>
								</div>
								<div className="description">
									<Localized language={system.language} req='constructor_account_price' param={convert(constructor['viber'][currency_price])}/>
								</div>
							</div>
						</div>
						<div className="option">
							<div className="head flex-row">
								<img className="icon" src="/img/vk.svg" alt="vk"></img>
								<span className="name">
									<Localized language={system.language} req='vk'/>
								</span>
							</div>
							<div>
								<div className="description">
									<Localized language={system.language} req='constructor_vk_description'/>
								</div>
								<div className="hide_block flex-row">
									<div className="text">
										<Localized language={system.language} req='constructor_accoun_quantity'/>
									</div>
									<div className="quantity flex-row">
										<button className={constructor.vk.quantity !== 0 ? "change" : "change disabled" } onClick={()=>quantity('decrease', 'vk')}>
											<div>-</div>
										</button>
										<div className="number">
											{String(settings.messengers.limit.vk.limit + constructor.vk.quantity)}
										</div>
										<button className="change" onClick={()=>quantity('increase', 'vk')}>
											<div>+</div>
										</button>
									</div>
								</div>
								<div className="description">
									<Localized language={system.language} req='constructor_account_price' param={convert(constructor['vk'][currency_price])}/>
								</div>
							</div>
						</div>
					</div>

					{/* <div className="block box fade-top">
						<span className="title contrast-text">
							<Localized language={system.language} req='constructor_extra'/>
						</span>
						<div className="option">
							<div className="head flex-row">
						<img className="icon" src="/img/redesign.svg" alt="redesign"></img>
						<span className="name">
						<Localized language={system.language} req='constructor_redesign'/>
						</span>
							</div>
							<div className="flex-row">
						<div className={constructor.redesign ? '' : 'hide'} style={{width: '100%'}}>
						<div className="hide_block">
						<div className="text">
						<Localized language={system.language} req='constructor_no_ad'/>
						</div>
						</div>
						</div>
						<div style={{'position': 'relative', 'width': '50px', 'margin': '0 7px'}}>
						<input
						type="checkbox"
						className="ios-checkbox-constructor"
						onChange={()=>activate('redesign')}
						checked={(constructor.redesign.quantity !== 0 || settings.redesign) ? 'checked' : ''}
						/>
						</div>
							</div>
							<div className="description">
						<Localized language={system.language} req='constructor_redesign_price' param={convert(constructor['redesign'][currency_price])}/>
							</div>
						</div>
					</div> */}
				</div>

				<div className="rightcolumn">
					{Object.keys(cart).length > 0 ? (
						<Cart cart={cart} currency={currency} currencyPrice={currency_price} onChange={edit} onDelete={deleteItem}/>
					):(
						<div id="cart" className="fade empty">
							<div className="flex-column-100">
								<AddShoppingCartIcon/>
								<div className="advantages">
									<span>Подключите нужные опции,</span>
									<br></br>
									<span>чтобы </span>
									<span className="typer"></span>
								</div>
							</div>
							<Skeleton animation="wave" className="skeleton"/>
						</div>
					)}
				</div>
			</div>
		) : null
	)
}

export default Constructor;