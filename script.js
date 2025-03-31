let questions = [];
let answers = [];

// קביעת כתובת השרת באופן דינמי לפי הסביבה
const serverUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : 'https://voting-sms-server.onrender.com';

async function loadQuestions() {
    try {
        const response = await fetch(`${serverUrl}/api/questions`);
        questions = await response.json();
        console.log('Questions received from server:', questions);
        renderQuestions();
    } catch (error) {
        console.error('Error loading questions:', error);
    }
}

function renderQuestions() {
    const container = document.getElementById('votingContainer');
    container.innerHTML = '';

    const activeQuestions = questions.filter(q => q.active);
    console.log('Filtered questions (active only):', activeQuestions.map(q => q.question));

    if (activeQuestions.length === 0) {
        container.innerHTML = '<p>אין שאלות זמינות להצבעה כרגע.</p>';
        return;
    }

    answers = new Array(activeQuestions.length).fill(null);

    activeQuestions.forEach((q, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <h5>${q.question}</h5>
            <button class="btn-option" onclick="selectAnswer(${index}, 'נגד')">✘ נגד</button>
            <button class="btn-option" onclick="selectAnswer(${index}, 'בעד')">✔ בעד</button>
        `;
        container.appendChild(card);
    });

    const submitButton = document.createElement('button');
    submitButton.className = 'btn-primary';
    submitButton.textContent = 'שלח הצבעה';
    submitButton.onclick = proceedToVerification;
    container.appendChild(submitButton);
}

function selectAnswer(index, answer) {
    answers[index] = answer;
    const card = document.getElementById('votingContainer').children[index];
    const buttons = card.querySelectorAll('.btn-option');
    buttons.forEach(btn => {
        btn.classList.remove('selected');
        if (btn.textContent.includes(answer)) {
            btn.classList.add('selected');
        }
    });
}

function proceedToVerification() {
    if (answers.some(answer => answer === null)) {
        alert('אנא ענה על כל השאלות לפני שליחת ההצבעה');
        return;
    }

    // שמירת ההצבעות ב-sessionStorage והפניה לאימות
    sessionStorage.setItem('pendingAnswers', JSON.stringify(answers));
    window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', loadQuestions);