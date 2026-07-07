function formatExcelValue(val, fmtCode) {
    if (val === null || val === undefined)
        return '';
    if (fmtCode && fmtCode.indexOf('dd.') === 0 && val && typeof val === 'string') {
        var d = new Date(val);
        if (!isNaN(d.getTime()))
            return d;
    }
    if (fmtCode === '#,##0' || fmtCode === '#,##0.00') {
        var n = Number(val);
        if (!isNaN(n))
            return n;
    }
    return val;
}




export { formatExcelValue };
