/**
 * سجل الزائرات — الروضة الأولى بأحد المسارحة
 * Web App backend (Google Apps Script) — يُلصق داخل محرر «برمجة التطبيقات» المرتبط بالشيت
 *
 * الأعمدة بالترتيب:
 * 1) الطابع الزمني  2) الاسم الرباعي  3) السجل المدني
 * 4) الجوال        5) التاريخ        6) الصفة        7) السبب
 */

var SHEET_NAME = 'سجل الزائرات';
var HEADERS = [
  'الطابع الزمني',
  'الاسم الرباعي',
  'السجل المدني',
  'الجوال',
  'التاريخ',
  'الصفة',
  'السبب'
];

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function doGet(e) {
  return json_({ status: 'ready', message: 'سجل الزائرات يعمل' });
}

function doPost(e) {
  try {
    var data = {};
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = (e && e.parameter) ? e.parameter : {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    var fullName   = String(data.fullName   || '').trim();
    var nationalId = String(data.nationalId || '').trim();
    var mobile     = String(data.mobile     || '').trim();
    var visitDate  = String(data.visitDate  || '').trim();
    var relation   = String(data.relation   || '').trim();
    var reason     = String(data.reason     || '').trim();

    if (!fullName || !nationalId || !mobile || !visitDate || !relation || !reason) {
      return json_({ status: 'error', message: 'حقول ناقصة' });
    }

    var sheet = getSheet_();
    sheet.appendRow([
      new Date(),
      fullName,
      "'" + nationalId,
      "'" + mobile,
      visitDate,
      relation,
      reason
    ]);

    return json_({ status: 'success', message: 'تم التسجيل بنجاح' });
  } catch (err) {
    return json_({ status: 'error', message: String(err) });
  }
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
