let questions = [];
let answers = [];
let currentQuestionIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
    fetchQuestions();
});

function fetchQuestions() {
    fetch('/api/questions')
        .then(response => response.json())
        .then(data => {
            questions = data.filter(q => q.active).map(q => q.question);
            if (questions.length === 0) {
                showToast('אין שאלות זמינות כרגע');
                return;
            }
            answers = new Array(questions.length).fill(null);
            showNextQuestion();
        })
        .catch(error => {
            console.error('Error fetching questions:', error);
            showToast('שגיאה בטעינת השאלות');
        });
}

function showNextQuestion() {
    const container = document.getElementById('votingContainer');
    container.innerHTML = '';

    questions.forEach((question, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <h5>${question}</h5>
            <button class="btn btn-option" onclick="selectAnswer(${index}, 'בעד')">
                <i class="fas fa-check"></i> בעד
            </button>
            <button class="btn btn-option" onclick="selectAnswer(${index}, 'נגד')">
                <i class="fas fa-times"></i> נגד
            </button>
        `;
        container.appendChild(card);
    });

    const submitButton = document.createElement('button');
    submitButton.className = 'btn btn-primary';
    submitButton.textContent = 'שלח הצבעה';
    submitButton.onclick = submitVote;
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

function submitVote() {
    if (answers.includes(null)) {
        showToast('אנא ענה על כל השאלות');
        return;
    }

    const phoneNumber = '+972546646339'; // מספר דמה
    fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, answers })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showThankYou();
        } else {
            showToast('שגיאה בשליחת ההצבעה');
        }
    })
    .catch(error => {
        console.error('Error submitting vote:', error);
        showToast('שגיאה בשליחת ההצבעה');
    });
}

function showThankYou() {
    const container = document.getElementById('votingContainer');
    container.innerHTML = `
        <div class="card text-center">
            <i class="fas fa-check-circle" style="font-size: 3rem; color: #28a745;"></i>
            <h3>תודה על ההצבעה!</h3>
            <p>ההצבעה שלך נרשמה בהצלחה.</p>
        </div>
    `;
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.backgroundColor = '#dc3545';
    toast.style.color = 'white';
    toast.style.padding = '10px 20px';
    toast.style.borderRadius = '5px';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}