const phoneSection = document.getElementById('phone-section');
const codeSection = document.getElementById('code-section');
const messageDiv = document.getElementById('message');
const sendCodeBtn = document.getElementById('send-code-btn');
const verifyCodeBtn = document.getElementById('verify-code-btn');
let phoneNumber = '';

// Dynamic server URL based on environment
const serverUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : 'https://voting-sms-server.onrender.com';

async function sendCode() {
    phoneNumber = document.getElementById('phone-number').value.trim();

    // Check if "test-number" was entered
    if (phoneNumber.toLowerCase() === 'test-number') {
        sessionStorage.setItem('phoneNumber', 'test-number');
        messageDiv.textContent = 'מצב בדיקה: דילוג על אימות, שולח הצבעה...';
        messageDiv.className = 'success';
        await submitVote('test-number');
        return;
    }

    if (!phoneNumber) {
        messageDiv.textContent = 'אנא הזן מספר טלפון';
        messageDiv.className = 'error';
        return;
    }

    sendCodeBtn.disabled = true;
    messageDiv.textContent = 'שולח קוד אימות...';
    messageDiv.className = '';

    try {
        const response = await fetch(`${serverUrl}/send-sms`, {
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
        const response = await fetch(`${serverUrl}/verify-sms`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to: phoneNumber, code: code })
        });
        const data = await response.json();

        if (data.status === 'approved') {
            sessionStorage.setItem('phoneNumber', phoneNumber);
            messageDiv.textContent = 'אימות הצליח! שולח הצבעה...';
            messageDiv.className = 'success';
            await submitVote(phoneNumber);
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

async function submitVote(phoneNumber) {
    const answers = JSON.parse(sessionStorage.getItem('pendingAnswers'));
    if (!answers) {
        messageDiv.textContent = 'שגיאה: אין הצבעות לשליחה';
        messageDiv.className = 'error';
        return;
    }

    try {
        const response = await fetch(`${serverUrl}/api/vote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber, answers })
        });

        const result = await response.json();
        if (result.success) {
            messageDiv.textContent = 'תודה על ההצבעה! ההצבעה שלך נשמרה בהצלחה.';
            sessionStorage.removeItem('pendingAnswers'); // Clear after submission
            setTimeout(() => {
                window.location.href = 'results.html';
            }, 3000);
        } else {
            messageDiv.textContent = 'שגיאה בשליחת ההצבעה. נסה שוב.';
            messageDiv.className = 'error';
        }
    } catch (error) {
        console.error('Error submitting vote:', error);
        messageDiv.textContent = 'שגיאה בשליחת ההצבעה: ' + error.message;
        messageDiv.className = 'error';
    }
}