const correctUsername = "admin";
const correctPassword = "password123";

const reports = [];

document.getElementById('childrenBtn').onclick = () => {
    window.location.href = "quiz.html";
};

// document.getElementById('adminBtn').onclick = () => {
//     document.getElementById('adminLogin').style.display = 'block';
// };
document.getElementById('adminBtn').onclick = () => {
    const adminLogin = document.getElementById('adminLogin');
    
    if (adminLogin.style.display === 'block') {
        adminLogin.style.display = 'none';
    } else {
        adminLogin.style.display = 'block';
    }
};

document.getElementById('loginBtn').onclick = () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === correctUsername && password === correctPassword) {
        document.getElementById('adminMessage').innerText = "Login successful!";
        document.getElementById('reports').style.display = 'block'; // Show reports section
    } else {
        document.getElementById('adminMessage').innerText = "Incorrect username or password.";
        document.getElementById('reports').style.display = 'none'; // Ensure reports are hidden
    }
};

document.getElementById('viewReportsBtn').onclick = () => {
    window.location.href = "report.html"; 
};

function saveReport(childId, name, score) {
    reports.push({ id: childId, name: name, score: score });
    localStorage.setItem('reports', JSON.stringify(reports)); 
}

window.saveReport = saveReport;