(function(){
  const callingCodeMap = {
    '55': 'BR', '1': 'US', '44': 'GB', '34': 'ES', '33': 'FR',
    '49': 'DE', '39': 'IT', '52': 'MX', '91': 'IN', '7': 'RU'
  };

  function countryToFlagEmoji(cc) {
    if (!cc) return '🌐';
    const A = 0x1F1E6;
    return String.fromCodePoint(...cc.toUpperCase().split('').map(c => A + c.charCodeAt(0) - 65));
  }

  function detectCallingCode(digits) {
    const codes = Object.keys(callingCodeMap).sort((a,b) => b.length - a.length);
    for (const code of codes) if (digits.startsWith(code)) return code;
    return null;
  }

  function formatarNumero(input){
    if (!input) return;
    let v = input.value || '';
    const raw = v.replace(/\D/g, '');
    let digits = raw;

    if (digits.startsWith('00')) digits = digits.replace(/^00/, '');
    const code = detectCallingCode(digits);
    const flagEl = document.getElementById('flagTelefone') || document.getElementById('flagTelefoneModal') || null;
    if (code && callingCodeMap[code]) {
      if (flagEl) flagEl.textContent = countryToFlagEmoji(callingCodeMap[code]);
    } else if (flagEl) flagEl.textContent = '🌐';

    if (code === '55') {
      const nd = digits.slice(2);
      if (nd.length === 0) { input.value = '+55'; return; }
      if (nd.length <= 2) { input.value = `+55 ${nd}`; return; }
      if (nd.length <= 7) { input.value = `+55 (${nd.slice(0,2)}) ${nd.slice(2)}`; return; }
      input.value = `+55 (${nd.slice(0,2)}) ${nd.slice(2,7)}-${nd.slice(7)}`; return;
    }

    if (code === '1') {
      const nd = digits.slice(1);
      if (nd.length === 0) { input.value = '+1'; return; }
      if (nd.length <= 3) { input.value = `+1 ${nd}`; return; }
      if (nd.length <= 6) { input.value = `+1 (${nd.slice(0,3)}) ${nd.slice(3)}`; return; }
      input.value = `+1 (${nd.slice(0,3)}) ${nd.slice(3,6)}-${nd.slice(6,10)}`; return;
    }

    if (code) {
      const rest = digits.slice(code.length);
      if (rest.length === 0) { input.value = `+${code}`; return; }
      if (rest.length <= 3) { input.value = `+${code} ${rest}`; return; }
      if (rest.length <= 6) { input.value = `+${code} ${rest.slice(0,3)} ${rest.slice(3)}`; return; }
      input.value = `+${code} ${rest.slice(0,3)} ${rest.slice(3,6)} ${rest.slice(6,10)}`; return;
    }

    if (digits.length <= 3) { input.value = digits; return; }
    if (digits.length <= 6) { input.value = `${digits.slice(0,3)} ${digits.slice(3)}`; return; }
    input.value = `${digits.slice(0,3)} ${digits.slice(3,6)} ${digits.slice(6,10)}`;
  }

  function setPhoneFlag(number, flagElementId){
    if (!number) return;
    const digits = (number + '').replace(/\D/g, '').replace(/^00/, '');
    const code = detectCallingCode(digits);
    const flagEl = document.getElementById(flagElementId);
    if (!flagEl) return;
    if (code && callingCodeMap[code]) flagEl.textContent = countryToFlagEmoji(callingCodeMap[code]);
    else flagEl.textContent = '🌐';
  }

  window.formatarNumero = formatarNumero;
  window.setPhoneFlag = setPhoneFlag;
  window._phoneFormat = { detectCallingCode, callingCodeMap };
})();