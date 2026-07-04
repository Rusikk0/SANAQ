const _services = {};
const _pending = {};

export function register(name, service) {
    _services[name] = service;
    if (_pending[name]) {
        _pending[name].forEach(function (resolve) {
            resolve(service);
        });
        delete _pending[name];
    }
}

export function get(name) {
    return _services[name] || null;
}

export function require(name) {
    return new Promise(function (resolve) {
        if (_services[name]) {
            resolve(_services[name]);
        } else {
            if (!_pending[name]) _pending[name] = [];
            _pending[name].push(resolve);
        }
    });
}

export function waitAll(names) {
    return Promise.all(names.map(require));
}
