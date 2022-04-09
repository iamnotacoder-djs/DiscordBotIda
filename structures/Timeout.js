'use strict';

class Timeout {

    execs = new Map();

    constructor(timer = 1000 * 60 * 60) { 
        this.timer = timer;
        this.timeout = 0;
    }

    start() {
        if (this.timeout == 0) {
            this.timeout = 1;
            this.#execute();
        }
        return this.timeout == 0;
    }

    add(k = "", v = () => {}) {
        if ((typeof k === 'string' || k instanceof String) && k != "" && typeof v === 'function') {
            this.execs.set(k, v);
            return true;
        } else {
            return false;
        }
    }

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
			if (this.execs != undefined) this.execs.forEach((value, key) => { 
				try {
					Log.send(`[TIMEOUT] Выполняется ${key}`);
					value();
				} catch (err) {
					Log.send(`[TIMEOUT] Ошибка выполнения ${key}: ${err}`);
				}
			});
            this.#execute();
		}, this.timer);
    }

}

module.exports = Timeout;