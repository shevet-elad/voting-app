// הגדרת כתובת השרת ל-URL של Render
const serverUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : 'https://voting-sms-server.onrender.com';

async function loadResults() {
    try {
        const response = await fetch(`${serverUrl}/api/results`);
        const results = await response.json();
        console.log('Results received from server:', results);
        renderResults(results);
    } catch (error) {
        console.error('Error loading results:', error);
    }
}

function renderResults(results) {
    const container = document.getElementById('resultsContainer');
    container.innerHTML = '';

    results.forEach((result, index) => {
        // Fix the question text: move the question mark to the end if it exists at the start
        let questionText = result.question;
        if (questionText.startsWith('?')) {
            questionText = questionText.substring(1).trim() + '?';
        }

        // Calculate total votes and percentages
        const totalVotes = result.for + result.against;
        const forPercentage = totalVotes > 0 ? ((result.for / totalVotes) * 100).toFixed(1) : 0;
        const againstPercentage = totalVotes > 0 ? ((result.against / totalVotes) * 100).toFixed(1) : 0;

        const resultCard = document.createElement('div');
        resultCard.className = 'result-card';

        // Create a canvas element for the chart
        const canvas = document.createElement('canvas');
        canvas.id = `chart-${index}`;

        // Create a div for the vote details
        const voteDetails = document.createElement('div');
        voteDetails.className = 'vote-details';
        voteDetails.innerHTML = `
            <p class="total-votes">סך כל ההצבעות: ${totalVotes}</p>
            <div class="vote-breakdown-container">
                <div class="vote-breakdown for-votes">
                    <p class="vote-label">בעד</p>
                    <p class="vote-percentage">${forPercentage}%</p>
                    <p class="vote-count">(${result.for} מצביעים)</p>
                </div>
                <div class="vote-breakdown against-votes">
                    <p class="vote-label">נגד</p>
                    <p class="vote-percentage">${againstPercentage}%</p>
                    <p class="vote-count">(${result.against} מצביעים)</p>
                </div>
            </div>
        `;

        resultCard.innerHTML = `
            <h5>${questionText}</h5>
        `;
        resultCard.appendChild(canvas);
        resultCard.appendChild(voteDetails);
        container.appendChild(resultCard);

        // Create the bar chart
        new Chart(canvas, {
            type: 'bar',
            data: {
                labels: ['בעד', 'נגד'],
                datasets: [{
                    label: 'מספר קולות',
                    data: [result.for, result.against],
                    backgroundColor: [
                        '#4F46E5',
                        '#4F46E5'
                    ],
                    borderColor: [
                        '#4338CA',
                        '#4338CA'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'מספר קולות'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'תשובה'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false // Hide the legend since we only have one dataset
                    }
                },
                datasets: {
                    bar: {
                        barPercentage: 0.5,
                        categoryPercentage: 0.2
                    }
                }
            }
        });
    });
}

async function downloadResults() {
    try {
        window.location.href = `${serverUrl}/api/results/csv`;
    } catch (error) {
        console.error('Error downloading results:', error);
    }
}

document.addEventListener('DOMContentLoaded', loadResults);