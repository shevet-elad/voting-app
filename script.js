// Base URL for the backend (to be updated after deploying to Render)
const BASE_URL = "https://your-render-app-name.onrender.com"; // Placeholder

// Array to store questions and answers
let questions = [];
let currentQuestionIndex = 0;
let answers = [];

// Function to fetch questions from server (placeholder for now)
async function fetchQuestions() {
  // In a real scenario, this would fetch from /manage-questions endpoint
  questions = ['האם אתה תומך במועמד A?', 'האם אתה תומך בתוכנית החדשה?', 'האם אתה תומך בשיפור האפליקציה?'];
  return questions;
}

// Function to send SMS verification code
async function sendVerificationCode() {
  let phoneNumber = document.getElementById('phoneNumber').value.trim();

  // Remove spaces and dashes from the phone number
  phoneNumber = phoneNumber.replace(/[\s-]/g, '');

  // Convert to international format if it starts with 0
  if (phoneNumber.startsWith('0')) {
    phoneNumber = '+972' + phoneNumber.substring(1);
  } else if (!phoneNumber.startsWith('+')) {
    phoneNumber = '+972' + phoneNumber;
  }

  // Validate the phone number format
  if (!phoneNumber.match(/^\+\d{11,12}$/)) {
    alert('אנא הזן מספר טלפון תקין (למשל: +972521234567 או 0521234567)');
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/send-sms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: phoneNumber }),
    });
    const data = await response.json();

    if (response.ok) {
      alert('קוד נשלח בהצלחה');
      document.getElementById('phoneNumber').value = phoneNumber;
      document.getElementById('phoneModal').style.display = 'none';
      document.getElementById('verifyCodeModal').style.display = 'block';
    } else {
      alert(data.error);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('שגיאה בשליחת הקוד');
  }
}

// Function to verify the SMS code
async function verifyCode() {
  const phoneNumber = document.getElementById('phoneNumber').value;
  const code = document.getElementById('verificationCode').value;

  try {
    const response = await fetch(`${BASE_URL}/verify-sms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: phoneNumber, code }),
    });
    const data = await response.json();

    if (data.status === 'approved') {
      alert('אימות הצליח');
      document.getElementById('verifyCodeModal').style.display = 'none';
      document.getElementById('votingContainer').style.display = 'block';
      await fetchQuestions();
      showNextQuestion();
    } else {
      alert('קוד שגוי או פג תוקף');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('שגיאה באימות הקוד');
  }
}

// Function to show the next question with radio buttons and animation
function showNextQuestion() {
  const container = document.getElementById('votingContainer');
  if (currentQuestionIndex < questions.length) {
    container.innerHTML = `
      <h2>${questions[currentQuestionIndex]}</h2>
      <div class="answer-options">
        <label><input type="radio" name="answer${currentQuestionIndex}" value="בעד" required> בעד</label>
        <label><input type="radio" name="answer${currentQuestionIndex}" value="נגד"> נגד</label>
      </div>
      <br><br>
      <button onclick="nextQuestion()">הבא</button>
    `;
    container.classList.add('fade-in');
    setTimeout(() => container.classList.remove('fade-in'), 500);
  } else {
    submitVote();
  }
}

// Function to move to the next question or submit
function nextQuestion() {
  const selectedAnswer = document.querySelector(`input[name="answer${currentQuestionIndex}"]:checked`);
  if (!selectedAnswer) {
    alert('אנא בחר תשובה');
    return;
  }
  answers[currentQuestionIndex] = selectedAnswer.value;
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    showNextQuestion();
  } else {
    submitVote();
  }
}

// Function to submit the vote
async function submitVote() {
  const phoneNumber = document.getElementById('phoneNumber').value;

  try {
    const response = await fetch(`${BASE_URL}/save-vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber, answers }),
    });
    const data = await response.json();

    if (response.ok) {
      alert(data.message);
      document.getElementById('votingContainer').style.display = 'none';
      currentQuestionIndex = 0;
      answers = [];
    } else {
      alert(data.error);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('שגיאה בשמירת ההצבעה');
  }
}

// Function to show admin login
function showAdminLogin() {
  window.location.href = 'admin.html';
}