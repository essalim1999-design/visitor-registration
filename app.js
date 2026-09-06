/* سجل الزائرات — الروضة الأولى بأحد المسارحة
   التحقق من صحة البيانات + الإرسال إلى Google Apps Script
   رسائل النجاح/الفشل عبر SweetAlert2 */

(function () {
  'use strict';

  var API_URL = 'https://script.google.com/macros/s/AKfycbz5W8Mw-SNHCr7C_dcICGKvjSIQb2GQm9dAQZFMtnPGvOKix_vo6_SYlgfRCrIllLfTbw/exec';

  var form       = document.getElementById('visitorForm');
  var submitBtn  = document.getElementById('submitBtn');
  var relation   = document.getElementById('relation');
  var otherField = document.getElementById('relationOtherField');
  var otherInput = document.getElementById('relationOther');
  var fullNameEl = document.getElementById('fullName');
  var dateEl     = document.getElementById('visitDate');

  /* ---------- تاريخ اليوم ---------- */
  var t = new Date();
  var todayISO = t.getFullYear() + '-' +
                 String(t.getMonth() + 1).padStart(2, '0') + '-' +
                 String(t.getDate()).padStart(2, '0');
  dateEl.value = todayISO;
  dateEl.max   = todayISO;

  /* ---------- حقل «حدد الصفة» ---------- */
  relation.addEventListener('change', function () {
    var isOther = relation.value === 'أخرى';
    otherField.hidden = !isOther;
    if (isOther) { otherInput.focus(); }
    else { otherInput.value = ''; clearError('relationOther'); }
    clearError('relation');
  });

  /* ---------- تحويل الأرقام العربية إلى إنجليزية ---------- */
  function toEnglishDigits(s) {
    return String(s)
      .replace(/[٠-٩]/g, function (d) { return d.charCodeAt(0) - 0x0660; })
      .replace(/[۰-۹]/g, function (d) { return d.charCodeAt(0) - 0x06F0; });
  }

  /* ---------- أرقام فقط في السجل والجوال ---------- */
  document.getElementById('nationalId').addEventListener('input', function () {
    this.value = toEnglishDigits(this.value).replace(/\D/g, '').slice(0, 10);
    clearError('nationalId');
  });

  document.getElementById('mobile').addEventListener('input', function () {
    var v = toEnglishDigits(this.value).replace(/\D/g, '');
    if (v.indexOf('966') === 0) { v = '0' + v.slice(3); }   // ‎+966 / 966 → 0
    this.value = v.slice(0, 10);
    clearError('mobile');
  });

  ['fullName', 'visitDate', 'reason', 'relationOther'].forEach(function (id) {
    document.getElementById(id).addEventListener('input', function () { clearError(id); });
  });

  /* ---------- قواعد التحقق ---------- */
  var rules = {
    fullName: function (v) {
      v = v.trim();
      if (!v) return 'الاسم الرباعي مطلوب';
      if (!/^[؀-ۿ\s]+$/.test(v)) return 'الاسم يجب أن يكون بأحرف عربية فقط';
      if (v.split(/\s+/).length < 4) return 'اكتب الاسم رباعيًا (٤ مقاطع)';
      return '';
    },
    nationalId: function (v) {
      if (!v) return 'رقم السجل المدني مطلوب';
      if (!/^[12]\d{9}$/.test(v)) return 'رقم غير صحيح: ١٠ أرقام تبدأ بـ ١ أو ٢';
      return '';
    },
    mobile: function (v) {
      if (!v) return 'رقم الجوال مطلوب';
      if (!/^05\d{8}$/.test(v)) return 'رقم غير صحيح: ١٠ أرقام تبدأ بـ 05';
      return '';
    },
    visitDate: function (v) {
      if (!v) return 'تاريخ الزيارة مطلوب';
      if (v > todayISO) return 'التاريخ لا يمكن أن يكون في المستقبل';
      return '';
    },
    relation: function (v) { return v ? '' : 'اختر صفة الزائر'; },
    relationOther: function (v) {
      if (relation.value === 'أخرى' && !v.trim()) return 'حدد صفة الزائر';
      return '';
    },
    reason: function (v) {
      v = v.trim();
      if (!v) return 'سبب الزيارة مطلوب';
      if (v.length < 3) return 'اكتب سببًا أوضح';
      return '';
    }
  };

  function setError(id, msg) {
    var field = document.getElementById(id).closest('.field');
    var box   = field.querySelector('.field__error');
    if (msg) { field.classList.add('invalid'); box.textContent = msg; }
    else     { field.classList.remove('invalid'); box.textContent = ''; }
  }
  function clearError(id) { setError(id, ''); }

  function validate() {
    var firstBad = null;
    Object.keys(rules).forEach(function (id) {
      if (id === 'relationOther' && relation.value !== 'أخرى') { clearError(id); return; }
      var el  = document.getElementById(id);
      var msg = rules[id](el.value);
      setError(id, msg);
      if (msg && !firstBad) firstBad = el;
    });
    if (firstBad) firstBad.focus();
    return !firstBad;
  }

  function setLoading(on) {
    submitBtn.disabled = on;
    submitBtn.textContent = on ? 'جارٍ الإرسال…' : 'إرسال';
  }

  function resetForm() {
    form.reset();
    otherField.hidden = true;
    document.querySelectorAll('.field.invalid').forEach(function (f) { f.classList.remove('invalid'); });
    document.querySelectorAll('.field__error').forEach(function (e) { e.textContent = ''; });
    dateEl.value = todayISO;
    setLoading(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fullNameEl.focus();
  }

  /* ---------- رسائل SweetAlert2 ---------- */
  function showSuccess() {
    Swal.fire({
      icon: 'success',
      title: 'تم التسجيل بنجاح',
      text: 'شكرًا لك، تم حفظ بيانات الزيارة',
      confirmButtonText: 'تسجيل زائر آخر',
      confirmButtonColor: '#35701F',
      showCloseButton: true,
      closeButtonHtml: '&times;',
      allowOutsideClick: false
    }).then(resetForm);
  }

  function showError(msg) {
    Swal.fire({
      icon: 'error',
      title: 'تعذّر الإرسال',
      text: msg || 'تحقق من الاتصال بالإنترنت وحاول مرة أخرى',
      confirmButtonText: 'إعادة المحاولة',
      confirmButtonColor: '#C0392B',
      showCloseButton: true,
      closeButtonHtml: '&times;'
    });
  }

  function showLoading() {
    Swal.fire({
      title: 'جارٍ حفظ البيانات…',
      text: 'يرجى الانتظار لحظة',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: function () { Swal.showLoading(); }
    });
  }

  /* ---------- الإرسال ---------- */
  var submitting = false;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (submitting) return;
    if (!validate()) return;
    submitting = true;

    var data = {
      fullName:   fullNameEl.value.trim(),
      nationalId: document.getElementById('nationalId').value,
      mobile:     document.getElementById('mobile').value,
      visitDate:  dateEl.value,
      relation:   relation.value === 'أخرى' ? otherInput.value.trim() : relation.value,
      reason:     document.getElementById('reason').value.trim()
    };

    setLoading(true);
    showLoading();

    var controller = new AbortController();
    var timeout = setTimeout(function () { controller.abort(); }, 20000);

    fetch(API_URL, { method: 'POST', body: JSON.stringify(data), signal: controller.signal })
      .then(function (res) { return res.json(); })
      .then(function (json) {
        if (json && json.status === 'success') { showSuccess(); }
        else { showError(json && json.message); }
      })
      .catch(function (err) {
        console.error('فشل الإرسال:', err);
        showError(err && err.name === 'AbortError'
          ? 'استغرق الإرسال وقتًا طويلاً، تحقق من الاتصال وحاول مجددًا'
          : null);
      })
      .finally(function () {
        clearTimeout(timeout);
        setLoading(false);
        submitting = false;
      });
  });
})();
