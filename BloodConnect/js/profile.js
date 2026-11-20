/**
 * BloodConnect - Profile Controller (profile.js)
 * Implements Module 16: User Profile (profile.html)
 */

document.addEventListener('DOMContentLoaded', () => {
  setupProfilePage();
});

function setupProfilePage() {
  const container = document.getElementById('profile-form');
  if (!container) return;

  const currentUser = storage.getCurrentUser();
  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }

  // Populate form fields
  document.getElementById('prof-name').value = currentUser.name || '';
  document.getElementById('prof-email').value = currentUser.email || '';
  document.getElementById('prof-phone').value = currentUser.phone || '';
  document.getElementById('prof-blood-group').value = currentUser.bloodGroup || 'O+';
  document.getElementById('prof-state').value = currentUser.state || '';
  document.getElementById('prof-district').value = currentUser.district || '';
  document.getElementById('prof-city').value = currentUser.city || '';
  document.getElementById('prof-address').value = currentUser.address || '';

  const donorProfile = storage.getDonorByUserId(currentUser.id);
  const donorToggle = document.getElementById('prof-donor-toggle');
  if (donorToggle) {
    donorToggle.checked = donorProfile ? donorProfile.availabilityStatus === 'Available' : currentUser.role === 'donor';
  }

  // Update header avatar & details
  const avatarEl = document.getElementById('prof-avatar-letter');
  if (avatarEl) avatarEl.textContent = currentUser.name.charAt(0);
  const titleName = document.getElementById('prof-header-name');
  if (titleName) titleName.textContent = currentUser.name;
  const titleRole = document.getElementById('prof-header-role');
  if (titleRole) titleRole.textContent = currentUser.role === 'admin' ? 'Administrator' : 'Registered Donor & Requester';

  // Handle Profile Update
  container.addEventListener('submit', (e) => {
    e.preventDefault();
    currentUser.name = document.getElementById('prof-name').value.trim();
    currentUser.phone = document.getElementById('prof-phone').value.trim();
    currentUser.bloodGroup = document.getElementById('prof-blood-group').value;
    currentUser.state = document.getElementById('prof-state').value.trim();
    currentUser.district = document.getElementById('prof-district').value.trim();
    currentUser.city = document.getElementById('prof-city').value.trim();
    currentUser.address = document.getElementById('prof-address').value.trim();

    storage.saveUser(currentUser);
    storage.setCurrentUser(currentUser);

    // Update donor record
    const isAvail = donorToggle ? donorToggle.checked : true;
    if (donorProfile) {
      donorProfile.availabilityStatus = isAvail ? 'Available' : 'Unavailable';
      donorProfile.bloodGroup = currentUser.bloodGroup;
      donorProfile.city = currentUser.city;
      storage.saveDonor(donorProfile);
    }

    showToast('Profile updated successfully!', 'success');
  });

  // Handle password change simulation
  const passForm = document.getElementById('change-password-form');
  if (passForm) {
    passForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const current = document.getElementById('pass-current').value;
      const next = document.getElementById('pass-new').value;
      const confirm = document.getElementById('pass-confirm').value;

      if (!current || !next || !confirm) {
        showToast('Please fill all password fields.', 'danger');
        return;
      }
      if (next !== confirm) {
        showToast('New passwords do not match.', 'danger');
        return;
      }

      showToast('Password changed successfully!', 'success');
      passForm.reset();
    });
  }

  // Render donation history table
  const histTable = document.getElementById('profile-donation-history');
  if (histTable) {
    const records = storage.getDonationHistory(currentUser.id);
    if (records.length === 0) {
      histTable.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:20px; color:var(--color-text-muted);">No recorded past donations for this account.</td></tr>`;
    } else {
      histTable.innerHTML = records.map(r => `
        <tr>
          <td><strong>${r.hospitalName}</strong></td>
          <td>${formatDate(r.date)}</td>
          <td>${r.units} Unit(s)</td>
          <td><span class="badge status-completed">${r.status}</span></td>
        </tr>
      `).join('');
    }
  }
}
