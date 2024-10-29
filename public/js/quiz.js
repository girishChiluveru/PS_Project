let videoStream;
let captureInterval;
let currentQuestionIndex = 0;
let score = 0;
let timer;
let timeLeft = 15;
let gameStartTime;

document.addEventListener('DOMContentLoaded', () => {
    
const questions = [{
    id:1,
    question: "Which word rhymes with 'cat'?",
    answers: ["Hat", "Dog", "Mouse", "Fish"],
    correct: 0,
    quote: "Believe in yourself and all that you are.",
},
{
    id:2,
    question: "What is the opposite of 'hot'?",
    answers: ["Cold", "Warm", "Sunny", "Bright"],
    correct: 0,
    quote: "You are braver than you believe, stronger than you seem, and smarter than you think.",
},
{   
    id:3,
    question: "Which of these is a fruit?",
    answers: ["Carrot", "Apple", "Bread", "Chicken"],
    correct: 1,
    quote: "Every day may not be good, but there’s something good in every day.",
},
{
    id:4,
    question: "Which animal is this?",
    image: "quiz_images/lion.jpg",
    options: ["Lion", "Tiger", "Elephant", "Leopard"],
    correct: 0,
    quote: "Courage doesn't always roar. Sometimes it's the quiet voice that says 'I will try again tomorrow.'",
},
{
    id:5,
    question: "Identify this fruit:",
    image: "quiz_images/banana.jpg",
    options: ["Apple", "Banana", "Grapes", "Orange"],
    correct: 1,
    quote: "The only way to do great work is to love what you do.",
},
{
    id:6,
    question: "What vegetable is this?",
    image: "quiz_images/tomato.jpg",
    options: ["Brinjal", "Tomato", "Potato", "Bitter gourd"],
    correct: 1,
    quote: "Start where you are. Use what you have. Do what you can.",
},
{
    id:7,
    question: "Which vehicle is this?",
    image: "quiz_images/bus.jpg",
    options: ["Car", "Bike", "Cycle", "Bus"],
    correct: 3,
    quote: "It does not matter how slowly you go as long as you do not stop.",
},
{
    id:8,
    question: "Which bird is this?",
    image: "quiz_images/peacock.jpg",
    options: ["Eagle", "Parrot", "Sparrow", "Peacock"],
    correct: 3,
    quote: "Don't wait for the right opportunity. Create it.",
},
{
    id:9,
    question: "What is this?",
    image: "quiz_images/pen.jpg",
    options: ["Pen", "Eraser", "Scale", "Compass"],
    correct: 0,
    quote: "The expert in anything was once a beginner.",
},
{
    id:10,
    question: "What Shape is this?",
    image: "quiz_images/triangle.jpg",
    options: ["Circle", "Square", "Triangle", "Rectangle"],
    correct: 2,
    quote: "Success is the sum of small efforts repeated day in and day out.",
},
{
    id:11,
    question: "What color is this?",
    image: "quiz_images/orange.jpg",
    options: ["Blue", "Orange", "Brown", "Pink"],
    correct: 1,
    quote: "The future belongs to those who believe in the beauty of their dreams.",
},
{
    id:12,
    question: "What animal is this?",
    image: "quiz_images/dog.jpg",
    options: ["Dog", "Cat", "Cow", "Goat"],
    correct: 0,
    quote: "Happiness is a warm puppy.",
},
{
    id:13,
    question: "Which sea creature is this?",
    image: "quiz_images/fish.jpg",
    options: ["Fish", "Octopus", "Jellyfish", "Seahorse"],
    correct: 0,
    quote: "Just keep swimming.",
}]
let selectedQuestions = [];

function randomizeQuestions() {
    const shuffled = questions.sort(() => 0.5 - Math.random());
    selectedQuestions = shuffled.slice(0, 5);
}

function startTimer() {
    timeLeft = 15;
    document.getElementById('timer').innerText = `${timeLeft}`;
    gameStartTime = Date.now();

    timer = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').innerText = `${timeLeft}`;
        if (timeLeft <= 0) {
            clearInterval(timer);
            handleTimeout();
        }
    }, 1000);
}

function handleTimeout() {
    captureScreenshot(selectedQuestions[currentQuestionIndex].id); // Capture screenshot on timeout
    moveToNextQuestion();
}

function startCapturing() {
    const interval = 3000;
    captureInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - gameStartTime) / 1000);
        captureImage(`${selectedQuestions[currentQuestionIndex].id}-img-${elapsed}.png`, selectedQuestions[currentQuestionIndex].id);
    }, interval);
}

function stopCapturing() {
    clearInterval(captureInterval);
}

    const childName = localStorage.getItem('childName');
    const sessionId = localStorage.getItem('sessionId');

    if (!childName || !sessionId) {
        console.error("Missing childName or sessionId");
        alert("Error: Missing session information. Please log in again.");
        window.location.href = '/';
        return;
    }

    function uploadPhoto(imageData, filename) {
        fetch('/photos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                image: imageData,
                filename: filename,
                childName: childName,
                sessionId: sessionId
            })
        })
        .then(response => response.json())
        .then(data => console.log('Upload response:', data))
        .catch(error => console.error('Upload error:', error));
    }

    function captureImage(filename, questionId) {
        const canvas = document.getElementById('canvas');
        const context = canvas.getContext('2d');
        context.drawImage(document.getElementById('video'), 0, 0, 640, 480);

        const imageData = canvas.toDataURL('image/png');
        console.log(`Captured image: ${filename}`);
        uploadPhoto(imageData, filename);
    }

    function captureScreenshot(qid) {
        const elapsed = Math.floor((Date.now() - gameStartTime) / 1000);
        const filename = `${qid}-screenshot-${elapsed}.png`;
        console.log(filename);
        html2canvas(document.body).then(canvas => {
            const imageData = canvas.toDataURL('image/png');
            uploadPhoto(imageData, filename);
        });
    }
    function showQuestion() {
        clearInterval(timer);
        startTimer();
    
        const currentQuestion = selectedQuestions[currentQuestionIndex];
        document.getElementById('question').innerText = currentQuestion.question;
        document.getElementById('question').innerHTML = currentQuestion.question;
    
        const answersDiv = document.querySelector('.answer-buttons');
        answersDiv.innerHTML = '';
    
        if (currentQuestion.image) {
            const image = document.createElement('img');
            image.src = currentQuestion.image;
            image.alt = "quiz image";
            image.style.marginTop = '15px';
            document.getElementById('question').appendChild(image);
        }
    
        const choices = currentQuestion.answers || currentQuestion.options;
        choices.forEach((choice, index) => {
            const button = document.createElement('button');
            button.innerText = choice;
            button.onclick = () => {
                selectAnswer(index);
                captureScreenshot(currentQuestion.id);
            };
            answersDiv.appendChild(button);
        });
    
        document.getElementById('quote').style.display = 'none';
    }
    
    function selectAnswer(index) {
        clearInterval(timer);
        const currentQuestion = selectedQuestions[currentQuestionIndex];
        if (index === currentQuestion.correct) score++;
    
        const quoteDiv = document.getElementById('quote');
        quoteDiv.innerText = currentQuestion.quote || '';
        quoteDiv.style.display = currentQuestion.quote ? 'block' : 'none';
    
        setTimeout(() => {
            moveToNextQuestion();
        }, 1500);
    }
    
    function moveToNextQuestion() {
        currentQuestionIndex++;
        if (currentQuestionIndex < selectedQuestions.length) {
            showQuestion();
        } else {
            stopCapturing();
            showResults();
        }
    }
    
    function showResults() {
        document.getElementById('question').style.display = 'none';
        document.querySelector('.answer-buttons').style.display = 'none';
        document.getElementById('quote').style.display = 'none';
        document.getElementById('timer').style.display = 'none';
        document.getElementById('result').innerText = `Congratulations! Your score is ${score} out of ${selectedQuestions.length}.`;
        document.getElementById('result').style.display = 'block';
        createSparkles();
    }
    
    function createSparkles() {
        const colors = ['#FF5733', '#FFBD33', '#75FF33', '#33FF57', '#33FFBD', '#3375FF', '#5733FF'];
        for (let i = 0; i < 30; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            sparkle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            sparkle.style.left = Math.random() * 100 + 'vw';
            sparkle.style.bottom = Math.random() * 100 + 'vh';
            document.querySelector('.sparkle-container').appendChild(sparkle);
            setTimeout(() => sparkle.remove(), 500);
        }
    }
    
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            videoStream = stream;
            document.getElementById('video').srcObject = stream;
            startCapturing();
        });
    
    // Call `randomizeQuestions` and `showQuestion` to start the quiz
    randomizeQuestions();
    showQuestion();
});

