let questions = [];
let answers = [];

async function loadQuestions() {
    try {
        const response = await fetch('/api/questions');
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
            <button class="btn-option" onclick="selectAnswer(${index}, 'בעד')">✔ בעד</button>
            <button class="btn-option" onclick="selectAnswer(${index}, 'נגד')">✘ נגד</button>
        `;
        container.appendChild(card);
    });

    const submitButton = document.createElement('button');
    submitButton.className = 'btn-primary';
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

async function submitVote() {
    const phoneNumber = sessionStorage.getItem('phoneNumber');
    if (phoneNumber === null) {
        alert('אנא הזדהה תחילה');
        window.location.href = 'login.html';
        return;
    }

    if (answers.some(answer => answer === null)) {
        alert('אנא ענה על כל השאלות לפני שליחת ההצבעה');
        return;
    }

    try {
        const response = await fetch('/api/vote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber, answers })
        });

        const result = await response.json();
        if (result.success) {
            const container = document.getElementById('votingContainer');
            container.innerHTML = `
                <div class="card text-center">
                    <i class="fas fa-check-circle"></i>
                    <h3>תודה על ההצבעה!</h3>
                    <p>ההצבעה שלך נשמרה בהצלחה.</p>
                </div>
            `;
        } else {
            alert('שגיאה בשליחת ההצבעה. אנא נסה שוב.');
        }
    } catch (error) {
        console.error('Error submitting vote:', error);
        alert('שגיאה בשליחת ההצבעה. אנא נסה שוב.');
    }
}

document.addEventListener('DOMContentLoaded', loadQuestions);