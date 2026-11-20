/**
 * BloodConnect - Storage Engine (storage.js)
 * Implements LocalStorage management as required by Section 11 of PRD
 */

const STORAGE_KEYS = {
  USERS: 'bloodconnect_users',
  CURRENT_USER: 'bloodconnect_current_user',
  DONORS: 'bloodconnect_donors',
  REQUESTS: 'bloodconnect_requests',
  ACCEPTANCES: 'bloodconnect_acceptances',
  NOTIFICATIONS: 'bloodconnect_notifications',
  MESSAGES: 'bloodconnect_messages',
  DONATION_HISTORY: 'bloodconnect_donation_history',
  INTERESTS: 'bloodconnect_interests'
};

const SEED_USERS = [
  {
    id: 'usr_1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+91 98765 43210',
    bloodGroup: 'O+',
    state: 'Maharashtra',
    district: 'Mumbai Suburban',
    city: 'Mumbai',
    address: '402 Sunrise Heights, Andheri West',
    role: 'user', // Requester & Donor
    gender: 'Male',
    dob: '1992-05-14',
    created_at: '2026-01-10T09:00:00Z'
  },
  {
    id: 'usr_2',
    name: 'Sarah Jenkins',
    email: 'sarah@example.com',
    phone: '+91 98220 12345',
    bloodGroup: 'A+',
    state: 'Maharashtra',
    district: 'Mumbai City',
    city: 'Mumbai',
    address: '15 Marine Drive, Colaba',
    role: 'donor',
    gender: 'Female',
    dob: '1995-08-22',
    created_at: '2026-01-15T11:20:00Z'
  },
  {
    id: 'usr_3',
    name: 'Dr. Rajesh Sharma',
    email: 'admin@bloodconnect.org',
    phone: '+91 99999 88888',
    bloodGroup: 'B+',
    state: 'Delhi',
    district: 'New Delhi',
    city: 'Delhi',
    address: 'AIIMS Campus, Ansari Nagar',
    role: 'admin',
    gender: 'Male',
    dob: '1980-03-12',
    created_at: '2025-11-01T08:00:00Z'
  },
  {
    id: 'usr_4',
    name: 'David Miller',
    email: 'david@example.com',
    phone: '+91 98450 67890',
    bloodGroup: 'B+',
    state: 'Karnataka',
    district: 'Bangalore Urban',
    city: 'Bangalore',
    address: '78 Koramangala 4th Block',
    role: 'donor',
    gender: 'Male',
    dob: '1991-11-30',
    created_at: '2026-02-01T14:45:00Z'
  },
  {
    id: 'usr_5',
    name: 'Priya Patel',
    email: 'priya@example.com',
    phone: '+91 98111 22334',
    bloodGroup: 'AB-',
    state: 'Maharashtra',
    district: 'Pune',
    city: 'Pune',
    address: '12 Shivaji Nagar, FC Road',
    role: 'user',
    gender: 'Female',
    dob: '1996-04-18',
    created_at: '2026-02-12T10:15:00Z'
  },
  {
    id: 'usr_6',
    name: 'Vikram Rao',
    email: 'vikram@example.com',
    phone: '+91 97333 44556',
    bloodGroup: 'O-',
    state: 'Maharashtra',
    district: 'Mumbai Suburban',
    city: 'Mumbai',
    address: '204 Powai Lake View',
    role: 'donor',
    gender: 'Male',
    dob: '1988-09-05',
    created_at: '2026-02-18T16:20:00Z'
  }
];

const SEED_DONORS = [
  {
    id: 'dnr_1',
    userId: 'usr_2',
    name: 'Sarah Jenkins',
    email: 'sarah@example.com',
    phone: '+91 98220 12345',
    bloodGroup: 'A+',
    city: 'Mumbai',
    state: 'Maharashtra',
    district: 'Mumbai City',
    availabilityStatus: 'Available',
    lastDonationDate: '2026-08-10',
    totalDonations: 4,
    lat: 18.9388,
    lng: 72.8258
  },
  {
    id: 'dnr_2',
    userId: 'usr_4',
    name: 'David Miller',
    email: 'david@example.com',
    phone: '+91 98450 67890',
    bloodGroup: 'B+',
    city: 'Bangalore',
    state: 'Karnataka',
    district: 'Bangalore Urban',
    availabilityStatus: 'Available',
    lastDonationDate: '2026-09-14',
    totalDonations: 7,
    lat: 12.9352,
    lng: 77.6245
  },
  {
    id: 'dnr_3',
    userId: 'usr_6',
    name: 'Vikram Rao',
    email: 'vikram@example.com',
    phone: '+91 97333 44556',
    bloodGroup: 'O-',
    city: 'Mumbai',
    state: 'Maharashtra',
    district: 'Mumbai Suburban',
    availabilityStatus: 'Available',
    lastDonationDate: '2026-07-20',
    totalDonations: 9,
    lat: 19.1176,
    lng: 72.9060
  },
  {
    id: 'dnr_4',
    userId: 'usr_1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+91 98765 43210',
    bloodGroup: 'O+',
    city: 'Mumbai',
    state: 'Maharashtra',
    district: 'Mumbai Suburban',
    availabilityStatus: 'Available',
    lastDonationDate: '2026-06-01',
    totalDonations: 3,
    lat: 19.1197,
    lng: 72.8468
  }
];

const SEED_REQUESTS = [
  {
    id: 'REQ-101',
    requesterId: 'usr_1',
    patientName: 'Aarav Sharma',
    bloodGroup: 'O+',
    units: 2,
    hospitalName: 'City Care Hospital',
    hospitalAddress: 'SV Road, Andheri West',
    district: 'Mumbai Suburban',
    city: 'Mumbai',
    requiredDate: '2026-11-22',
    contactNumber: '+91 98765 43210',
    urgency: 'Critical',
    description: 'Patient undergoing emergency cardiac surgery tomorrow morning. Immediate O+ blood required.',
    status: 'Donor Interested', // Open, Donor Interested, Donor Selected, In Progress, Completed, Cancelled
    selectedDonorId: null,
    created_at: '2026-11-20T08:30:00Z'
  },
  {
    id: 'REQ-102',
    requesterId: 'usr_5',
    patientName: 'Meera Nair',
    bloodGroup: 'A+',
    units: 1,
    hospitalName: 'Apollo Hospital',
    hospitalAddress: 'Bannerghatta Road',
    district: 'Bangalore Urban',
    city: 'Bangalore',
    requiredDate: '2026-11-23',
    contactNumber: '+91 98111 22334',
    urgency: 'Urgent',
    description: 'Required for scheduled chemotherapy platelet support treatment.',
    status: 'Open',
    selectedDonorId: null,
    created_at: '2026-11-20T06:15:00Z'
  },
  {
    id: 'REQ-103',
    requesterId: 'usr_1',
    patientName: 'Rahul Verma',
    bloodGroup: 'B+',
    units: 3,
    hospitalName: 'Lilavati Hospital',
    hospitalAddress: 'Bandra Reclamation, Bandra West',
    district: 'Mumbai Suburban',
    city: 'Mumbai',
    requiredDate: '2026-11-20',
    contactNumber: '+91 98765 43210',
    urgency: 'Critical',
    description: 'Accident trauma patient in ICU. Urgent transfusion needed immediately.',
    status: 'Donor Selected',
    selectedDonorId: 'dnr_2',
    created_at: '2026-11-19T14:00:00Z'
  },
  {
    id: 'REQ-104',
    requesterId: 'usr_5',
    patientName: 'Ananya Sen',
    bloodGroup: 'AB-',
    units: 1,
    hospitalName: 'Fortis Hospital',
    hospitalAddress: 'Sector 10A, Vashi',
    district: 'Thane',
    city: 'Navi Mumbai',
    requiredDate: '2026-11-25',
    contactNumber: '+91 98111 22334',
    urgency: 'Normal',
    description: 'Planned orthopaedic hip replacement surgery next week.',
    status: 'Open',
    selectedDonorId: null,
    created_at: '2026-11-18T10:00:00Z'
  },
  {
    id: 'REQ-105',
    requesterId: 'usr_1',
    patientName: 'Kavita Reddy',
    bloodGroup: 'O-',
    units: 2,
    hospitalName: 'Manipal Hospital',
    hospitalAddress: '98 HAL Old Airport Road',
    district: 'Bangalore Urban',
    city: 'Bangalore',
    requiredDate: '2026-11-21',
    contactNumber: '+91 98765 43210',
    urgency: 'Urgent',
    description: 'Transfusion for Thalassemia major patient.',
    status: 'In Progress',
    selectedDonorId: 'dnr_3',
    created_at: '2026-11-17T11:20:00Z'
  },
  {
    id: 'REQ-106',
    requesterId: 'usr_5',
    patientName: 'Rohan Kulkarni',
    bloodGroup: 'B-',
    units: 2,
    hospitalName: 'Ruby Hall Clinic',
    hospitalAddress: 'Sassoon Road',
    district: 'Pune',
    city: 'Pune',
    requiredDate: '2026-11-10',
    contactNumber: '+91 98111 22334',
    urgency: 'Critical',
    description: 'Emergency trauma transfusion successfully completed.',
    status: 'Completed',
    selectedDonorId: 'dnr_2',
    created_at: '2026-11-10T09:00:00Z'
  }
];

const SEED_ACCEPTANCES = [
  {
    id: 'acc_1',
    requestId: 'REQ-101',
    donorId: 'dnr_1',
    donorUserId: 'usr_2',
    donorName: 'Sarah Jenkins',
    donorBlood: 'A+',
    donorPhone: '+91 98220 12345',
    status: 'Interested', // Interested, Selected, Completed, Withdrawn
    note: 'I am available tomorrow morning at 8:30 AM at City Care Hospital.',
    acceptedAt: '2026-11-20T09:10:00Z'
  },
  {
    id: 'acc_2',
    requestId: 'REQ-103',
    donorId: 'dnr_2',
    donorUserId: 'usr_4',
    donorName: 'David Miller',
    donorBlood: 'B+',
    donorPhone: '+91 98450 67890',
    status: 'Selected',
    note: 'In Mumbai today, can donate immediately at Lilavati Hospital.',
    acceptedAt: '2026-11-19T14:45:00Z'
  },
  {
    id: 'acc_3',
    requestId: 'REQ-105',
    donorId: 'dnr_3',
    donorUserId: 'usr_6',
    donorName: 'Vikram Rao',
    donorBlood: 'O-',
    donorPhone: '+91 97333 44556',
    status: 'Selected',
    note: 'Universal donor O-, happy to assist Kavita.',
    acceptedAt: '2026-11-17T12:00:00Z'
  }
];

const SEED_NOTIFICATIONS = [
  {
    id: 'notif_1',
    userId: 'usr_1',
    title: 'Donor Accepted Your Request!',
    message: 'Sarah Jenkins has accepted your request REQ-101 for Aarav Sharma (O+).',
    link: 'request-details.html?id=REQ-101',
    isRead: false,
    type: 'donor_accepted',
    createdAt: '2026-11-20T09:10:00Z'
  },
  {
    id: 'notif_2',
    userId: 'usr_1',
    title: 'New Message from Sarah Jenkins',
    message: 'Sarah sent you a message regarding request REQ-101.',
    link: 'messages.html',
    isRead: false,
    type: 'new_message',
    createdAt: '2026-11-20T09:25:00Z'
  },
  {
    id: 'notif_3',
    userId: 'usr_2',
    title: 'New Matching Blood Request',
    message: 'A new Critical request for A+ blood was created at Apollo Hospital.',
    link: 'blood-requests.html',
    isRead: true,
    type: 'matching_request',
    createdAt: '2026-11-20T06:15:00Z'
  },
  {
    id: 'notif_4',
    userId: 'usr_1',
    title: 'Request Marked In Progress',
    message: 'Transfusion coordination ongoing for REQ-105 with Vikram Rao.',
    link: 'request-details.html?id=REQ-105',
    isRead: true,
    type: 'status_changed',
    createdAt: '2026-11-17T14:00:00Z'
  }
];

const SEED_MESSAGES = [
  {
    id: 'msg_1',
    conversationId: 'conv_usr1_usr2',
    senderId: 'usr_2',
    senderName: 'Sarah Jenkins',
    receiverId: 'usr_1',
    requestId: 'REQ-101',
    content: 'Hello John! I saw your urgent request for O+ blood at City Care Hospital. I am ready to donate.',
    timestamp: '2026-11-20T09:15:00Z',
    isRead: true
  },
  {
    id: 'msg_2',
    conversationId: 'conv_usr1_usr2',
    senderId: 'usr_1',
    senderName: 'John Doe',
    receiverId: 'usr_2',
    requestId: 'REQ-101',
    content: 'Thank you so much Sarah! The surgery is scheduled tomorrow at 9:00 AM. Can you reach the hospital blood bank by 8:30 AM?',
    timestamp: '2026-11-20T09:20:00Z',
    isRead: true
  },
  {
    id: 'msg_3',
    conversationId: 'conv_usr1_usr2',
    senderId: 'usr_2',
    senderName: 'Sarah Jenkins',
    receiverId: 'usr_1',
    requestId: 'REQ-101',
    content: 'Yes absolutely, I will be there at 8:30 AM sharp. I will carry my Aadhaar card and donor card.',
    timestamp: '2026-11-20T09:25:00Z',
    isRead: false
  },
  {
    id: 'msg_4',
    conversationId: 'conv_usr1_usr4',
    senderId: 'usr_4',
    senderName: 'David Miller',
    receiverId: 'usr_1',
    requestId: 'REQ-103',
    content: 'Hi John, I am currently at Lilavati Hospital waiting near the 2nd-floor blood bank.',
    timestamp: '2026-11-19T15:30:00Z',
    isRead: true
  },
  {
    id: 'msg_5',
    conversationId: 'conv_usr1_usr4',
    senderId: 'usr_1',
    senderName: 'John Doe',
    receiverId: 'usr_4',
    requestId: 'REQ-103',
    content: 'Doctor Dr. Mehta is coordinating. Meeting you there now, thank you so much!',
    timestamp: '2026-11-19T15:32:00Z',
    isRead: true
  }
];

const SEED_DONATION_HISTORY = [
  {
    id: 'dh_1',
    donorId: 'dnr_1',
    donorUserId: 'usr_2',
    hospitalName: 'Lilavati Hospital',
    date: '2026-08-10',
    units: 1,
    bloodGroup: 'A+',
    status: 'Completed'
  },
  {
    id: 'dh_2',
    donorId: 'dnr_2',
    donorUserId: 'usr_4',
    hospitalName: 'Manipal Hospital',
    date: '2026-09-14',
    units: 1,
    bloodGroup: 'B+',
    status: 'Completed'
  },
  {
    id: 'dh_3',
    donorId: 'dnr_4',
    donorUserId: 'usr_1',
    hospitalName: 'KEM Hospital, Parel',
    date: '2026-06-01',
    units: 1,
    bloodGroup: 'O+',
    status: 'Completed'
  }
];

const SEED_INTERESTS = [
  {
    id: 'int_1',
    userId: 'usr_2',
    donorName: 'Sarah Jenkins',
    bloodGroup: 'A+',
    city: 'Mumbai',
    preferredLocation: 'Andheri / Bandra / South Mumbai',
    availabilityDate: '2026-11-25',
    contactPreference: 'In-app Chat & Phone',
    additionalInfo: 'Eligible regular donor, hemoglobin 13.5 g/dL.',
    createdAt: '2026-11-19T10:00:00Z'
  },
  {
    id: 'int_2',
    userId: 'usr_6',
    donorName: 'Vikram Rao',
    bloodGroup: 'O-',
    city: 'Mumbai',
    preferredLocation: 'Powai / Ghatkopar / Thane',
    availabilityDate: '2026-11-28',
    contactPreference: 'Phone Call',
    additionalInfo: 'Universal donor ready for weekend emergency donations.',
    createdAt: '2026-11-18T16:00:00Z'
  }
];

class StorageEngine {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      this.resetAllData();
    }
  }

  resetAllData() {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(SEED_USERS[0])); // Default John Doe
    localStorage.setItem(STORAGE_KEYS.DONORS, JSON.stringify(SEED_DONORS));
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(SEED_REQUESTS));
    localStorage.setItem(STORAGE_KEYS.ACCEPTANCES, JSON.stringify(SEED_ACCEPTANCES));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(SEED_NOTIFICATIONS));
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(SEED_MESSAGES));
    localStorage.setItem(STORAGE_KEYS.DONATION_HISTORY, JSON.stringify(SEED_DONATION_HISTORY));
    localStorage.setItem(STORAGE_KEYS.INTERESTS, JSON.stringify(SEED_INTERESTS));
  }

  // --- Users ---
  getUsers() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  }

  getUserById(id) {
    return this.getUsers().find(u => u.id === id);
  }

  getUserByEmail(email) {
    return this.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  saveUser(user) {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
    } else {
      user.id = 'usr_' + Date.now();
      user.created_at = new Date().toISOString();
      users.push(user);
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return user;
  }

  deleteUser(userId) {
    const users = this.getUsers().filter(u => u.id !== userId);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  getCurrentUser() {
    const userStr = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch (e) {
      return null;
    }
  }

  setCurrentUser(user) {
    if (!user) {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    } else {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    }
  }

  logout() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }

  // --- Donors ---
  getDonors() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.DONORS) || '[]');
  }

  getDonorById(id) {
    return this.getDonors().find(d => d.id === id);
  }

  getDonorByUserId(userId) {
    return this.getDonors().find(d => d.userId === userId);
  }

  saveDonor(donor) {
    const donors = this.getDonors();
    const index = donors.findIndex(d => d.id === donor.id);
    if (index >= 0) {
      donors[index] = donor;
    } else {
      donor.id = 'dnr_' + Date.now();
      donors.push(donor);
    }
    localStorage.setItem(STORAGE_KEYS.DONORS, JSON.stringify(donors));
    return donor;
  }

  updateDonorAvailability(userId, status) {
    const donors = this.getDonors();
    const donor = donors.find(d => d.userId === userId);
    if (donor) {
      donor.availabilityStatus = status;
      localStorage.setItem(STORAGE_KEYS.DONORS, JSON.stringify(donors));
    }
  }

  // --- Requests ---
  getRequests() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.REQUESTS) || '[]');
  }

  getRequestById(id) {
    return this.getRequests().find(r => r.id === id);
  }

  saveRequest(req) {
    const reqs = this.getRequests();
    const index = reqs.findIndex(r => r.id === req.id);
    if (index >= 0) {
      reqs[index] = req;
    } else {
      req.id = 'REQ-' + Math.floor(100 + Math.random() * 900);
      req.created_at = new Date().toISOString();
      if (!req.status) req.status = 'Open';
      reqs.unshift(req);
    }
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(reqs));
    return req;
  }

  updateRequestStatus(id, newStatus) {
    const reqs = this.getRequests();
    const req = reqs.find(r => r.id === id);
    if (req) {
      req.status = newStatus;
      localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(reqs));
    }
    return req;
  }

  // --- Acceptances ---
  getAcceptances() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ACCEPTANCES) || '[]');
  }

  getAcceptancesForRequest(requestId) {
    return this.getAcceptances().filter(a => a.requestId === requestId);
  }

  getAcceptancesForDonor(donorId) {
    return this.getAcceptances().filter(a => a.donorId === donorId);
  }

  addAcceptance(reqId, donor, note = '') {
    const acceptances = this.getAcceptances();
    // Check if duplicate
    const existing = acceptances.find(a => a.requestId === reqId && a.donorUserId === donor.userId);
    if (existing) {
      return { success: false, message: 'You have already accepted this request.' };
    }

    const newAcc = {
      id: 'acc_' + Date.now(),
      requestId: reqId,
      donorId: donor.id || ('dnr_' + donor.userId),
      donorUserId: donor.userId,
      donorName: donor.name,
      donorBlood: donor.bloodGroup,
      donorPhone: donor.phone,
      status: 'Interested',
      note: note,
      acceptedAt: new Date().toISOString()
    };
    acceptances.push(newAcc);
    localStorage.setItem(STORAGE_KEYS.ACCEPTANCES, JSON.stringify(acceptances));

    // Update request status if was 'Open'
    const req = this.getRequestById(reqId);
    if (req && req.status === 'Open') {
      this.updateRequestStatus(reqId, 'Donor Interested');
    }

    // Trigger notification to Requester
    if (req) {
      this.addNotification({
        userId: req.requesterId,
        title: 'New Donor Acceptance!',
        message: `${donor.name} (${donor.bloodGroup}) is willing to donate for ${req.patientName}.`,
        link: `request-details.html?id=${reqId}`,
        type: 'donor_accepted'
      });
    }

    return { success: true, acceptance: newAcc };
  }

  selectDonorForRequest(requestId, donorUserId) {
    const acceptances = this.getAcceptances();
    acceptances.forEach(a => {
      if (a.requestId === requestId) {
        if (a.donorUserId === donorUserId) {
          a.status = 'Selected';
        } else {
          a.status = 'Interested';
        }
      }
    });
    localStorage.setItem(STORAGE_KEYS.ACCEPTANCES, JSON.stringify(acceptances));

    const reqs = this.getRequests();
    const req = reqs.find(r => r.id === requestId);
    if (req) {
      req.status = 'Donor Selected';
      req.selectedDonorId = donorUserId;
      localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(reqs));

      // Notify selected donor
      this.addNotification({
        userId: donorUserId,
        title: 'You Have Been Selected!',
        message: `The requester for ${req.patientName} (${req.bloodGroup}) selected you as their donor!`,
        link: `request-details.html?id=${requestId}`,
        type: 'requester_selected'
      });
    }
  }

  // --- Notifications ---
  getNotifications(userId = null) {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
    if (userId) {
      return list.filter(n => n.userId === userId);
    }
    return list;
  }

  addNotification({ userId, title, message, link, type = 'general' }) {
    const list = this.getNotifications();
    const newNotif = {
      id: 'notif_' + Date.now() + Math.floor(Math.random()*100),
      userId,
      title,
      message,
      link: link || '#',
      isRead: false,
      type,
      createdAt: new Date().toISOString()
    };
    list.unshift(newNotif);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
    return newNotif;
  }

  markNotificationAsRead(id) {
    const list = this.getNotifications();
    const item = list.find(n => n.id === id);
    if (item) {
      item.isRead = true;
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
    }
  }

  markAllNotificationsRead(userId) {
    const list = this.getNotifications();
    list.forEach(n => {
      if (!userId || n.userId === userId) {
        n.isRead = true;
      }
    });
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
  }

  deleteNotification(id) {
    const list = this.getNotifications().filter(n => n.id !== id);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
  }

  // --- Messaging ---
  getMessages() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES) || '[]');
  }

  getConversationsForUser(userId) {
    const allMsgs = this.getMessages();
    const convMap = new Map();

    allMsgs.forEach(m => {
      if (m.senderId === userId || m.receiverId === userId) {
        const otherId = m.senderId === userId ? m.receiverId : m.senderId;
        const convId = [userId, otherId].sort().join('_');
        
        if (!convMap.has(convId) || new Date(m.timestamp) > new Date(convMap.get(convId).timestamp)) {
          convMap.set(convId, {
            convId,
            otherUserId: otherId,
            lastMessage: m.content,
            timestamp: m.timestamp,
            requestId: m.requestId,
            unread: (m.receiverId === userId && !m.isRead) ? 1 : 0
          });
        }
      }
    });

    return Array.from(convMap.values());
  }

  getMessagesByConversation(userId, otherUserId) {
    const allMsgs = this.getMessages();
    return allMsgs.filter(m => 
      (m.senderId === userId && m.receiverId === otherUserId) ||
      (m.senderId === otherUserId && m.receiverId === userId)
    ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }

  sendMessage(senderUser, receiverId, content, requestId = null) {
    const allMsgs = this.getMessages();
    const convId = [senderUser.id, receiverId].sort().join('_');
    const newMsg = {
      id: 'msg_' + Date.now(),
      conversationId: convId,
      senderId: senderUser.id,
      senderName: senderUser.name,
      receiverId: receiverId,
      requestId: requestId,
      content: content,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    allMsgs.push(newMsg);
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(allMsgs));
    return newMsg;
  }

  // --- Donation Interests ---
  getInterests() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.INTERESTS) || '[]');
  }

  saveInterest(interest) {
    const list = this.getInterests();
    interest.id = 'int_' + Date.now();
    interest.createdAt = new Date().toISOString();
    list.unshift(interest);
    localStorage.setItem(STORAGE_KEYS.INTERESTS, JSON.stringify(list));
    return interest;
  }

  deleteInterest(id) {
    const list = this.getInterests().filter(i => i.id !== id);
    localStorage.setItem(STORAGE_KEYS.INTERESTS, JSON.stringify(list));
  }

  // --- Donation History ---
  getDonationHistory(donorUserId) {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.DONATION_HISTORY) || '[]');
    if (donorUserId) {
      return list.filter(h => h.donorUserId === donorUserId);
    }
    return list;
  }

  addDonationRecord(record) {
    const list = this.getDonationHistory();
    record.id = 'dh_' + Date.now();
    list.unshift(record);
    localStorage.setItem(STORAGE_KEYS.DONATION_HISTORY, JSON.stringify(list));
    return record;
  }
}

// Global instance
const storage = new StorageEngine();
window.storage = storage;
