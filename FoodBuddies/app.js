// Event Listeners for Login and Signup Buttons
document.getElementById('loginBtn').addEventListener('click', (event) => {
  event.preventDefault();
  showLoginForm();
});

document.getElementById('signupBtn').addEventListener('click', (event) => {
  event.preventDefault();
  showSignupForm();
});

// Display the Login Form
function showLoginForm() {
  document.getElementById('content').innerHTML = `
    <div class="form-container">
      <h2>Login</h2>
      <form id="loginForm">
        <div class="form-group">
          <label for="loginEmail">Email:</label>
          <input type="email" id="loginEmail" placeholder="Enter your email" required>
        </div>
        <div class="form-group">
          <label for="loginPassword">Password:</label>
          <input type="password" id="loginPassword" placeholder="Enter your password" required>
        </div>
        <button type="submit">Login</button>
        <p id="loginMessage"></p>
      </form>
    </div>
  `;

  // Add event listener for login form submission
  document.getElementById('loginForm').addEventListener('submit', handleLogin);
}

// Handle Login Form Submission
async function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      displayMessage('loginMessage', 'Login Successful!', 'green');
      localStorage.setItem('authToken', data.token);
      window.location.href = 'dashboard.html';
    } else {
      displayMessage('loginMessage', `Login Failed: ${data.message}`, 'red');
    }
  } catch (error) {
    displayMessage('loginMessage', 'Error: Unable to login', 'red');
  }
}

// Display the Signup Form
function showSignupForm() {
  const maxDate = new Date().toISOString().split('T')[0]; // Max date for birthdate input

  document.getElementById('content').innerHTML = `
    <div class="form-container">
      <h2>Sign Up</h2>
      <form id="signupForm">
        <div class="form-row">
          <div class="form-group">
            <label for="firstName">First Name:</label>
            <input type="text" id="firstName" placeholder="Enter your first name" required pattern="[A-Za-z]+" title="Only letters allowed">
          </div>
          <div class="form-group">
            <label for="lastName">Last Name:</label>
            <input type="text" id="lastName" placeholder="Enter your last name" required pattern="[A-Za-z]+" title="Only letters allowed">
          </div>
        </div>
        <div class="form-group">
          <label for="signupEmail">Email:</label>
          <input type="email" id="signupEmail" placeholder="Enter your email" required>
        </div>
        <div class="form-group">
          <label for="signupPassword">Password:</label>
          <input type="password" id="signupPassword" placeholder="Create a password" required minlength="6">
        </div>
        <div class="form-group">
          <label for="street">Street:</label>
          <input type="text" id="street" placeholder="Enter your street" required>
        </div>
        <div class="form-group">
          <label for="aptNumber">Apartment Number (optional):</label>
          <input type="text" id="aptNumber" placeholder="Enter your apartment number">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="city">City:</label>
            <input type="text" id="city" placeholder="Enter your city" required>
          </div>
          <div class="form-group">
            <label for="state">State:</label>
            <input type="text" id="state" placeholder="Enter your state" required>
          </div>
        </div>
        <div class="form-group">
          <label for="zipcode">Zipcode:</label>
          <input type="text" id="zipcode" placeholder="Enter your zipcode" required pattern="\\d{5}" title="Enter a valid 5-digit zipcode">
        </div>
        <div class="form-group">
          <label for="birthdate">Birthdate:</label>
          <input type="date" id="birthdate" required max="${maxDate}">
        </div>
        <div class="form-group">
          <label for="phone">Phone Number:</label>
          <input type="tel" id="phone" placeholder="Enter your phone number" required pattern="\\d{10}" title="Enter a valid 10-digit phone number">
        </div>
        <div class="form-check">
          <input type="checkbox" id="terms" required>
          <label for="terms">I agree to the <a href="#" id="termsLink">terms and conditions</a></label>
        </div>
        <button type="submit">Sign Up</button>
        <p id="signupMessage"></p>
      </form>
    </div>
  `;

  // Add event listener for signup form submission
  document.getElementById('signupForm').addEventListener('submit', handleSignup);

  // Add event listener for terms and conditions link
  document.getElementById('termsLink').addEventListener('click', showTermsModal);
}

// Handle Signup Form Submission
async function handleSignup(event) {
  event.preventDefault();

  const userDetails = {
    firstName: document.getElementById('firstName').value,
    lastName: document.getElementById('lastName').value,
    email: document.getElementById('signupEmail').value,
    password: document.getElementById('signupPassword').value,
    address: {
      street: document.getElementById('street').value,
      aptNumber: document.getElementById('aptNumber').value || null,
      city: document.getElementById('city').value,
      state: document.getElementById('state').value,
      zipcode: document.getElementById('zipcode').value,
    },
    birthdate: document.getElementById('birthdate').value,
    phone: document.getElementById('phone').value,
  };

  try {
    const response = await fetch('http://localhost:5000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userDetails),
    });

    const data = await response.json();

    if (response.ok) {
      displayMessage('signupMessage', 'Account Created!', 'green');
      localStorage.setItem('authToken', data.token);
      window.location.href = 'dashboard.html';
    } else {
      displayMessage('signupMessage', `Signup Failed: ${data.message}`, 'red');
    }
  } catch (error) {
    displayMessage('signupMessage', 'Error: Unable to sign up', 'red');
  }
}

// Show Terms and Conditions Modal
function showTermsModal(event) {
  event.preventDefault();
  const modal = document.getElementById('termsModal');
  modal.style.display = 'block';

  const closeModal = document.getElementById('closeModal');
  closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  window.onclick = (event) => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  };
}

// Helper Function to Display Messages
function displayMessage(elementId, message, color) {
  const element = document.getElementById(elementId);
  element.textContent = message;
  element.style.color = color;
}

// Logout Functionality
window.logout = function () {
  localStorage.removeItem('authToken');
  window.location.href = 'index.html';
};
