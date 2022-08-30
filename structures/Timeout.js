'use strict';

class Timeout {

	execs = new Map();
	started = false;

	/**
	 * Создает экземпляр Timeout
	 * @param  {number} timer=1000*60*60 Кол-во миллисекунд
	 * @param  {boolean} start=false Стартовать с инициализацией
	 */
	constructor(timer = 1000 * 60 * 60, start = false) {
		this.timer = timer;
		this.timeout = 0;
		Log.send(`[STRUCTURES/TIMEOUT] Модуль Timeout инициализирован. Таймаут: ${this.timer}ms`);
		if (start) this.start();
	}

	/**
	 * Запускает таймер
	 */
	start() {
		if (this.timeout == 0) {
			this.timeout = 1;
			this.#execute();
		}
		return this.timeout == 0;
	}

	/**
	 * Добавить в расписание выполняемую функцию
	 * @param  {string} k="" Уникальный ключ
	 * @param  {function} v=()=>{} Исполняемый код
	 */
	add(k = "", v = ()=>{}) {
		if ((typeof k === 'string' || k instanceof String) && k != "" && typeof v === 'function') {
			this.execs.set(k, v);
			return true;
		} else {
			return false;
		}
	}

	/**
	 * Удалить из расписание выполняемую функцию
	 * @param  {string} k="" Уникальный ключ
	 */
	delete(k = "") {
		if ((typeof k === 'string' || k instanceof String) && k != "" && this.execs.get(k) != undefined) {
			this.execs.delete(k);
			return true;
		} else {
			return false;
		}
	}

	#execute() {
		setTimeout(() => {
			this.started = true;
			if (this.execs != undefined) this.execs.forEach((value, key) => {
				try {
					Log.send(`[STRUCTURES/TIMEOUT] Выполняется ${key}`);
					value();
				} catch (e) {
					Log.error(`[STRUCTURES/TIMEOUT] Ошибка выполнения ${key}: ${e}`);
				}
			});
			this.#execute();
		}, !this.started ? 1000 : this.timer);
	}

}

module.exports = Timeout;