const phoneSection = document.getElementById('phone-section');
const codeSection = document.getElementById('code-section');
const messageDiv = document.getElementById('message');
const sendCodeBtn = document.getElementById('send-code-btn');
const verifyCodeBtn = document.getElementById('verify-code-btn');
let phoneNumber = '';

async function sendCode() {
    phoneNumber = document.getElementById('phone-number').value.trim();

    // בדיקה אם הוזנה המחרוזת "test-number"
    if (phoneNumber.toLowerCase() === 'test-number') {
        // שמירת "test-number" ב-sessionStorage כדי שההצבעה תישמר
        sessionStorage.setItem('phoneNumber', 'test-number');
        messageDiv.textContent = 'מצב בדיקה: דילוג על אימות, מופנה לדף ההצבעה...';
        messageDiv.className = 'success';
        setTimeout(() => {
            window.location.href = 'index.html'; // הפניה ישירה ל-index.html
        }, 1000);
        return;
    }

    // תהליך אימות רגיל אם לא הוזן "test-number"
    if (!phoneNumber) {
        messageDiv.textContent = 'אנא הזן מספר טלפון';
        messageDiv.className = 'error';
        return;
    }

    sendCodeBtn.disabled = true;
    messageDiv.textContent = 'שולח קוד אימות...';
    messageDiv.className = '';

    try {
        const response = await fetch('/send-sms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to: phoneNumber })
        });
        const data = await response.json();

        if (data.status === 'pending') {
            messageDiv.textContent = 'קוד אימות נשלח בהצלחה!';
            messageDiv.className = 'success';
            phoneSection.style.display = 'none';
            codeSection.style.display = 'block';
        } else {
            messageDiv.textContent = 'שליחת הקוד נכשלה. נסה שוב.';
            messageDiv.className = 'error';
        }
    } catch (error) {
        messageDiv.textContent = 'שגיאה בשליחת הקוד: ' + error.message;
        messageDiv.className = 'error';
    } finally {
        sendCodeBtn.disabled = false;
    }
}

async function verifyCode() {
    const code = document.getElementById('verification-code').value.trim();
    if (!code) {
        messageDiv.textContent = 'אנא הזן את הקוד שקיבלת';
        messageDiv.className = 'error';
        return;
    }

    verifyCodeBtn.disabled = true;
    messageDiv.textContent = 'מאמת קוד...';
    messageDiv.className = '';

    try {
        const response = await fetch('/verify-sms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to: phoneNumber, code: code })
        });
        const data = await response.json();

        if (data.status === 'approved') {
            // שמירת מספר הטלפון ב-sessionStorage
            sessionStorage.setItem('phoneNumber', phoneNumber);
            messageDiv.textContent = 'אימות הצליח! מופנה לדף ההצבעה...';
            messageDiv.className = 'success';
            setTimeout(() => {
                window.location.href = 'index.html'; // הפניה ל-index.html
            }, 1000);
        } else {
            messageDiv.textContent = 'הקוד שגוי. נסה שוב.';
            messageDiv.className = 'error';
        }
    } catch (error) {
        messageDiv.textContent = 'שגיאה באימות הקוד: ' + error.message;
        messageDiv.className = 'error';
    } finally {
        verifyCodeBtn.disabled = false;
    }
}