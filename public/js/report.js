const ctx = document.getElementById('expressionChart').getContext('2d');
let currentChart = null;
const averageEmojisForQuestions = []; // Store average emoji indices for each question
const averageEmojiWeights = []; // Store total counts for each emoji over all questions

const emojis = ['😊', '😢', '😠', '😮', '😐', '😱'];

// Data for the five questions (simplified)
const dataForQuestions = [
    [2, 2, 0, 0, 0, 0], // Question 1
    [5, 3, 2, 1, 0, 0], // Question 2
    [1, 0, 3, 4, 2, 0], // Question 3
    [4, 4, 0, 2, 0, 1], // Question 4
    [3, 1, 0, 5, 2, 1] // Question 5
];

// Create the pie chart
const createPieChart = (dataValues) => {
    if (currentChart) {
        currentChart.destroy(); // Destroy previous chart to avoid overlapping
    }

    const data = {
        labels: ['Happy 😊', 'Sad 😢', 'Angry 😠', 'Surprised 😮', 'Neutral 😐', 'Scared 😱'],
        datasets: [{
            label: 'Expressions Count',
            data: dataValues,
            backgroundColor: [
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
    };

    currentChart = new Chart(ctx, {
        type: 'pie',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: true, // Keep the chart aspect ratio consistent
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: `Expression Distribution`
                }
            }
        }
    });

    // Calculate and display average expression for selected question
    const averageEmoji = calculateAndDisplayAverage(dataValues);
    averageEmojisForQuestions.push(averageEmoji); // Store average emoji for this question
};

// Function to calculate and display the weighted average expression
const calculateAndDisplayAverage = (dataValues) => {
    const totalExpressions = dataValues.reduce((a, b) => a + b, 0); // Sum of all expression counts
    let weightedSum = 0;

    for (let i = 0; i < dataValues.length; i++) {
        weightedSum += i * dataValues[i]; // Multiply the expression index by the count
    }

    const averageIndex = Math.round(weightedSum / totalExpressions); // Calculate weighted average
    document.getElementById('averageEmoji').innerText = emojis[averageIndex]; // Set the average emoji
    return { averageIndex, totalExpressions }; // Return the average index and total count for storing
};

// Function to calculate overall average emoji
const calculateOverallAverage = () => {
    // Calculate weighted sum of all questions' average emoji
    const weightedSums = Array(6).fill(0); // Initialize counts for each emoji

    averageEmojiWeights.forEach(({ averageIndex, totalExpressions }) => {
        weightedSums[averageIndex] += totalExpressions; // Add total counts to the corresponding emoji
    });

    // Find the emoji with the highest weight
    const highestIndex = weightedSums.indexOf(Math.max(...weightedSums));
    document.getElementById('overallAverageEmoji').innerText = emojis[highestIndex]; // Set the overall average emoji
};

// Initial pie chart for Question 1
createPieChart(dataForQuestions[0]);

// Update chart when a question button is clicked
document.querySelectorAll('.question-button').forEach(button => {
    button.addEventListener('click', function() {
        const selectedQuestion = this.dataset.question;
        createPieChart(dataForQuestions[selectedQuestion]);
        document.getElementById('overallAverageEmojiWrapper').style.display = 'none'; // Hide overall average when selecting new question
    });
});

// Overall button functionality
document.getElementById('backButton').addEventListener('click', function() {
    calculateOverallAverage(); // Calculate and display the overall average emoji
    document.getElementById('overallAverageEmojiWrapper').style.display = 'block'; // Show overall average
});