function _db() { return window.ApDb || null; }
function _ds() { return window.DataService || null; }

export function getCategories() { var d = _db(); return d ? d.getCategories() : []; }
export function getCustomers() { var d = _db(); return d ? d.getCustomers() : []; }
export function setCustomers(arr) { var d = _db(); if (d) d.setCustomers(arr); }
export function getDebtors() { var d = _db(); return d ? d.getDebtors() : []; }
export function getExpenses() { var d = _db(); return d ? d.getExpenses() : []; }
export function setExpenses(arr) { var d = _db(); if (d) d.setExpenses(arr); }
export function getProducts() { var d = _ds(); return d ? d.get('products') : []; }
export function setProducts(arr) { var d = _ds(); if (d) d.set('products', arr); }
export function getSales() { var d = _db(); return d ? d.getSales() : []; }
