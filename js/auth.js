/**
 * BloodConnect - Auth Controller (auth.js)
 * Implements Module 2 (signup.html), Module 3 (login.html), Module 4 (forgot-password.html)
 */

document.addEventListener('DOMContentLoaded', () => {
  setupLoginForm();
  setupSignupForm();
  setupForgotPasswordForm();
  setupDemoButtons();
  setupPasswordToggles();
});

function setupDemoButtons() {
  // Demo Login as Requester (John Doe)
  const btnRequester = document.getElementById('demo-btn-requester');
  if (btnRequester) {
    btnRequester.addEventListener('click', () => {
      const user = storage.getUserByEmail('john@example.com');
      if (user) {
        storage.setCurrentUser(user);
        showToast('Logged in as Requester (John Doe)', 'success');
        setTimeout(() => window.location.href = 'dashboard.html', 500);
      }
    });
  }

  // Demo Login as Donor (Sarah Jenkins)
  const btnDonor = document.getElementById('demo-btn-donor');
  if (btnDonor) {
    btnDonor.addEventListener('click', () => {
      const user = storage.getUserByEmail('sarah@example.com');
      if (user) {
        storage.setCurrentUser(user);
        showToast('Logged in as Donor (Sarah Jenkins)', 'success');
        setTimeout(() => window.location.href = 'dashboard.html', 500);
      }
    });
  }

  // Demo Login as Admin (Dr. Rajesh Sharma)
  const btnAdmin = document.getElementById('demo-btn-admin');
  if (btnAdmin) {
    btnAdmin.addEventListener('click', () => {
      const user = storage.getUserByEmail('admin@bloodconnect.org');
      if (user) {
        storage.setCurrentUser(user);
        showToast('Logged in as Platform Admin', 'success');
        setTimeout(() => window.location.href = 'admin-dashboard.html', 500);
      }
    });
  }
}

function setupPasswordToggles() {
  document.querySelectorAll('.password-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (input) {
        if (input.type === 'password') {
          input.type = 'text';
          btn.textContent = '👁';
        } else {
          input.type = 'password';
          btn.textContent = '🔒';
        }
      }
    });
  });
}

function setupLoginForm() {
  const form = document.getElementById('login-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const identifier = document.getElementById('login-identifier').value.trim();
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');

    if (!identifier || !password) {
      if (errorEl) {
        errorEl.textContent = 'Please enter both email/phone and password.';
        errorEl.style.display = 'block';
      }
      return;
    }

    const users = storage.getUsers();
    const found = users.find(u => 
      (u.email.toLowerCase() === identifier.toLowerCase() || u.phone === identifier)
    );

    if (found) {
      // In demonstration, verify simulated login
      storage.setCurrentUser(found);
      showToast(`Welcome back, ${found.name}!`, 'success');
      setTimeout(() => {
        if (found.role === 'admin') {
          window.location.href = 'admin-dashboard.html';
        } else {
          window.location.href = 'dashboard.html';
        }
      }, 500);
    } else {
      if (errorEl) {
        errorEl.textContent = 'Invalid credentials. Or click one of the quick demo buttons above!';
        errorEl.style.display = 'block';
      }
    }
  });
}

function setupSignupForm() {
  const form = document.getElementById('signup-form');
  if (!form) return;

  const passwordInput = document.getElementById('signup-password');
  const strengthProgress = document.getElementById('strength-progress');
  const strengthText = document.getElementById('strength-text');

  if (passwordInput && strengthProgress) {
    passwordInput.addEventListener('input', () => {
      const val = passwordInput.value;
      let score = 0;
      if (val.length >= 6) score++;
      if (val.length >= 10) score++;
      if (/[A-Z]/.test(val)) score++;
      if (/[0-9]/.test(val)) score++;
      if (/[^A-Za-z0-9]/.test(val)) score++;

      if (score <= 1) {
        strengthProgress.style.width = '25%';
        strengthProgress.style.backgroundColor = '#E53935';
        strengthText.textContent = 'Weak password';
        strengthText.style.color = '#E53935';
      } else if (score <= 3) {
        strengthProgress.style.width = '60%';
        strengthProgress.style.backgroundColor = '#FFA000';
        strengthText.textContent = 'Medium strength';
        strengthText.style.color = '#FFA000';
      } else {
        strengthProgress.style.width = '100%';
        strengthProgress.style.backgroundColor = '#2E7D32';
        strengthText.textContent = 'Strong password';
        strengthText.style.color = '#2E7D32';
      }
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fullName = document.getElementById('signup-fullname').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const phone = document.getElementById('signup-phone').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm').value;
    const dob = document.getElementById('signup-dob').value;
    const gender = document.getElementById('signup-gender').value;
    const bloodGroup = document.getElementById('signup-bloodgroup').value;
    const state = document.getElementById('signup-state').value.trim();
    const district = document.getElementById('signup-district').value.trim();
    const city = document.getElementById('signup-city').value.trim();
    const address = document.getElementById('signup-address').value.trim();
    const isDonor = document.getElementById('signup-is-donor').checked;

    // Validation
    if (!fullName || !email || !phone || !password || !bloodGroup || !city) {
      showToast('Please fill in all required fields.', 'danger');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match.', 'danger');
      return;
    }

    if (storage.getUserByEmail(email)) {
      showToast('An account with this email already exists.', 'danger');
      return;
    }

    const newUser = {
      name: fullName,
      email,
      phone,
      bloodGroup,
      dob,
      gender,
      state,
      district,
      city,
      address,
      role: isDonor ? 'donor' : 'user'
    };

    const created = storage.saveUser(newUser);

    if (isDonor) {
      storage.saveDonor({
        userId: created.id,
        name: created.name,
        email: created.email,
        phone: created.phone,
        bloodGroup: created.bloodGroup,
        city: created.city,
        state: created.state,
        district: created.district,
        availabilityStatus: 'Available',
        lastDonationDate: '',
        totalDonations: 0,
        lat: 19.0760,
        lng: 72.8777
      });
    }

    // Auto log in
    storage.setCurrentUser(created);
    showToast('Registration successful! Welcome to BloodConnect.', 'success');
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 600);
  });
}

function setupForgotPasswordForm() {
  const form = document.getElementById('forgot-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('forgot-email').value.trim();
    const successBox = document.getElementById('forgot-success');
    const formBox = document.getElementById('forgot-form-box');

    if (!email) {
      showToast('Please enter your registered email address.', 'danger');
      return;
    }

    if (formBox && successBox) {
      formBox.style.display = 'none';
      successBox.style.display = 'block';
      document.getElementById('sent-email-target').textContent = email;
    }
  });
}
