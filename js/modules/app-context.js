var _services = {};
var _state = {};
var _stateGetters = {};

export function set(name, service) {
    _services[name] = service;
}

export function get(name) {
    return _services[name] || null;
}

export function setState(name, value) {
    _state[name] = value;
}

export function getState(name) {
    return _state[name];
}

export function syncState(targetName, sourceModule, sourceName) {
    _stateGetters[targetName] = function () { return sourceModule[sourceName || targetName]; };
}

export function pullState(name) {
    if (_stateGetters[name]) {
        _state[name] = _stateGetters[name]();
    }
    return _state[name];
}

export function refreshAllState() {
    Object.keys(_stateGetters).forEach(function (k) {
        _state[k] = _stateGetters[k]();
    });
}

export function requireNow(name) {
    var s = _services[name];
    if (!s) throw new Error('Service not registered: ' + name);
    return s;
}
