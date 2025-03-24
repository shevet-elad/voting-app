async function loadResults() {
    try {
        const response = await fetch('/api/results');
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
        const resultCard = document.createElement('div');
        resultCard.className = 'result-card';

        // Create a canvas element for the chart
        const canvas = document.createElement('canvas');
        canvas.id = `chart-${index}`;
        resultCard.innerHTML = `
            <h5>${result.question}</h5>
        `;
        resultCard.appendChild(canvas);
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
                        '#28a745', // Green for "For"
                        '#dc3545'  // Red for "Against"
                    ],
                    borderColor: [
                        '#1e7e34',
                        '#b02a37'
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
                }
            }
        });
    });
}

async function downloadResults() {
    try {
        window.location.href = '/api/results/csv';
    } catch (error) {
        console.error('Error downloading results:', error);
    }
}

document.addEventListener('DOMContentLoaded', loadResults);