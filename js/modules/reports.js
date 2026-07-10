import { EXCEL_SECTIONS } from './constants.js';
import { toast } from './notifications.js';
import { formatExcelValue } from './helpers.js';
import { getFieldValue, createExcelWorkbook, saveExcelBuffer, todayStr } from './utils.js';

async function exportSectionToExcel(section, data, filename) {
    const cfg = EXCEL_SECTIONS[section];
    if (!cfg) {
        toast('Неизвестный раздел: ' + section, 'err');
        return;
    }
    if (!data || !data.length) {
        toast('Нет данных для экспорта', 'err');
        return;
    }
    const rows = data.map(item => cfg.fields.map(field, i => formatExcelValue(getFieldValue(item, field), cfg.numFmt[i]);
        });
    });
    try {
        const buffer = await createExcelWorkbook(cfg.headers, rows, cfg.widths, cfg.label, cfg.numFmt);
        saveExcelBuffer(buffer, filename || 'SANAQ_' + section + '_' + todayStr() + '.xlsx');
        toast('Excel файл скачан', 'ok');
    } catch (e) { toast('Ошибка экспорта: ' + e.message, 'err'); }
}

export { exportSectionToExcel };
