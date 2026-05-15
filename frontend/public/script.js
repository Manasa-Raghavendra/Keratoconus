// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
    initParticles();
    initDateFields();
    checkAuthentication();
    initEventListeners();
    initCharts();
    loadActivityFeed();
    loadChatHistory();
    animateCounters();
    loadProfile();
    loadProfile();
    loadNotificationSettings();
    loadDoctors();
    loadAuditLogs();
    loadAdminStats();
});

const BASE_URL = "http://127.0.0.1:8000";

// ==================== SETTINGS ====================

function showSettingsTab(tabId) {

    // Update sidebar
    document.querySelectorAll(

        '.settings-sidebar li'

    ).forEach(li => {

        li.classList.remove('active');

    });

    event.currentTarget.classList.add(
        'active'
    );

    // Show tab
    document.querySelectorAll(

        '.settings-tab'

    ).forEach(tab => {

        tab.classList.remove('active');

    });

    document.getElementById(

        tabId

    ).classList.add('active');
}



// ==================== PROFILE PHOTO PREVIEW ====================

function previewProfilePhoto(event) {

    const preview = document.getElementById(
        'photo-preview'
    );

    const file = event.target.files[0];

    if (file) {

        const reader = new FileReader();

        reader.onload = function(e) {

            preview.innerHTML = `

                <img
                    src="${e.target.result}"
                    alt="Profile Preview"
                >
            `;

            preview.classList.add('active');
        };

        reader.readAsDataURL(file);
    }
}



// ==================== SETTINGS PROFILE PHOTO CHANGE ====================

async function changeSettingsPhoto(event) {

    const file = event.target.files[0];

    if (!file) return;

    const currentUser = JSON.parse(

        localStorage.getItem("currentUser")
    );

    const formData = new FormData();

    formData.append("file", file);

    try {

        const response = await fetch(

            `${BASE_URL}/upload-profile-photo?email=${currentUser.email}`,

            {

                method: "POST",

                body: formData
            }
        );

        const data = await response.json();

        console.log(data);

        if (response.ok) {

            document.getElementById(
                "settings-photo-preview"
            ).innerHTML = `

                <img
                    src="${data.photo_url}"
                    style="
                        width:100%;
                        height:100%;
                        object-fit:cover;
                        border-radius:50%;
                    "
                >
            `;

            showModal(

                'success-modal',

                'Photo Updated',

                'Profile photo uploaded successfully'
            );

        } else {

            showModal(

                'error-modal',

                'Upload Failed',

                data.detail || 'Failed to upload photo'
            );
        }

    } catch (error) {

        console.error(error);

        showModal(

            'error-modal',

            'Server Error',

            'Backend connection failed'
        );
    }
}

async function loadProfileFromBackend() {

    try {

        const currentUser = JSON.parse(

            localStorage.getItem("currentUser")
        );

        const response = await fetch(

            `${BASE_URL}/profile/${currentUser.email}`
        );

        const data = await response.json();

        if (response.ok) {

            document.getElementById(
                "profile-fullname"
            ).value = data.full_name || "";

            document.getElementById(
                "profile-email"
            ).value = data.email || "";

            document.getElementById(
                "profile-hospital"
            ).value = data.hospital_name || "";

            document.getElementById(
                "profile-phone"
            ).value = data.phone || "";

            // ==========================
            // LOAD PHOTO
            // ==========================

            if (data.profile_photo) {

                document.getElementById(
                    "settings-photo-preview"
                ).innerHTML = `

                    <img
                        src="http://127.0.0.1:8000/${data.profile_photo}"
                        style="
                            width:100%;
                            height:100%;
                            border-radius:50%;
                            object-fit:cover;
                        "
                    >
                `;
            }
        }

    } catch (error) {

        console.error(error);
    }
}

async function loadNotificationSettings() {

    try {

        const currentUser = JSON.parse(

            localStorage.getItem("currentUser")
        );

        const token = localStorage.getItem(
            "access_token"
        );

        const response = await fetch(

            `${BASE_URL}/settings/profile`,

            {

                headers: {

                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        console.log(data);

        if (response.ok) {

            document.getElementById(
                "email-notifications"
            ).checked = data.email_notifications;

            document.getElementById(
                "high-risk-alerts"
            ).checked = data.high_risk_alerts;

            document.getElementById(
                "weekly-reports"
            ).checked = data.weekly_reports;
        }

    } catch (error) {

        console.error(error);
    }
}

function markAllNotificationsRead() {

    // ==========================================
    // REMOVE UNREAD CLASS
    // ==========================================

    const notifications = document.querySelectorAll(

        '.notification-item'
    );

    notifications.forEach(item => {

        item.classList.remove('unread');
    });

    // ==========================================
    // REMOVE BADGE
    // ==========================================

    const badge = document.querySelector(

        '.notification-badge'
    );

    if (badge) {

        badge.style.display = 'none';
    }
}

async function saveNotificationSettings() {

    try {

        const currentUser = JSON.parse(

            localStorage.getItem("currentUser")
        );

        const payload = {

            email: currentUser.email,

            email_notifications:

                document.getElementById(
                    "email-notifications"
                ).checked,

            high_risk_alerts:

                document.getElementById(
                    "high-risk-alerts"
                ).checked,

            weekly_reports:

                document.getElementById(
                    "weekly-reports"
                ).checked
        };

        const response = await fetch(

            `${BASE_URL}/settings/notifications`,

            {

                method: "PUT",

                headers: {

                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify(payload)
            }
        );

        const data = await response.json();

        if (response.ok) {

            showModal(

                'success-modal',

                'Settings Saved',

                'Notification preferences updated'
            );

        } else {

            showModal(

                'error-modal',

                'Update Failed',

                data.detail || 'Failed'
            );
        }

    } catch (error) {

        console.error(error);
    }
}
// ==================== CHANGE PASSWORD ====================

document.getElementById(

    "password-form"

).addEventListener(

    "submit",

    async function(e) {

        e.preventDefault();

        try {

            const token = localStorage.getItem(
                "access_token"
            );

            const response = await fetch(

                `${BASE_URL}/settings/change-password`,

                {

                    method: "PUT",

                    headers: {

                        "Content-Type": "application/json",

                        Authorization: `Bearer ${token}`
                    },

                    body: JSON.stringify({

                        current_password:

                        document.getElementById(
                            "current-password"
                        ).value,

                        new_password:

                        document.getElementById(
                            "new-password"
                        ).value
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {

                showModal(

                    "success-modal",

                    "Password Updated",

                    data.message
                );

                document.getElementById(
                    "password-form"
                ).reset();
            }

            else {

                showModal(

                    "error-modal",

                    "Error",

                    data.detail
                );
            }

        }

        catch(error) {

            console.error(error);
        }
    }
);


// ==================== SAVE PROFILE ====================

document.getElementById(

    "profile-form"

).addEventListener(

    "submit",

    async function(e) {

        e.preventDefault();

        try {

            const token = localStorage.getItem(
                "access_token"
            );

            const response = await fetch(

                `${BASE_URL}/settings/profile/update`,

                {

                    method: "PUT",

                    headers: {

                        "Content-Type": "application/json",

                        Authorization: `Bearer ${token}`
                    },

                    body: JSON.stringify({

                        full_name: document.getElementById(
                            "profile-fullname"
                        ).value,

                        hospital_name: document.getElementById(
                            "profile-hospital"
                        ).value,

                        phone: document.getElementById(
                            "profile-phone"
                        ).value
                    })
                }
            );

            const data = await response.json();

            showModal(

                "success-modal",

                "Profile Updated",

                data.message
            );

        }

        catch(error) {

            console.error(error);
        }
    }
);


// ==================== LOAD PROFILE ====================

async function loadProfile() {

    try {

        // ==========================================
        // LOAD INSTANTLY FROM LOCAL STORAGE
        // ==========================================

        const currentUser = JSON.parse(

            localStorage.getItem("currentUser")
        );

        if (currentUser) {

            document.getElementById(
                "profile-fullname"
            ).value = currentUser.name || "";

            document.getElementById(
                "profile-email"
            ).value = currentUser.email || "";
        }

        // ==========================================
        // TOKEN CHECK
        // ==========================================

        const token = localStorage.getItem(
            "access_token"
        );

        if (!token) {

            return;
        }

        // ==========================================
        // FETCH FROM BACKEND
        // ==========================================

        const response = await fetch(

            `${BASE_URL}/settings/profile`,

            {

                headers: {

                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        console.log(data);

        // ==========================================
        // UPDATE FIELDS
        // ==========================================

        document.getElementById(
            "profile-fullname"
        ).value = data.full_name || "";

        document.getElementById(
            "profile-email"
        ).value = data.email || "";

        document.getElementById(
            "profile-hospital"
        ).value = data.hospital_name || "";

        document.getElementById(
            "profile-phone"
        ).value = data.phone || "";

        // ==========================================
        // PROFILE PHOTO
        // ==========================================

        if (data.profile_photo) {

            document.getElementById(
                "settings-photo-preview"
            ).innerHTML = `

                <img
                    src="http://127.0.0.1:8000/${data.profile_photo}"
                    style="
                        width:100%;
                        height:100%;
                        object-fit:cover;
                        border-radius:50%;
                    "
                >
            `;
        }

    }

    catch (error) {

        console.error(error);
    }
}

// ==================== PARTICLES BACKGROUND ====================
function initParticles() {
    const container = document.getElementById('particles');
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = (15 + Math.random() * 10) + 's';
        container.appendChild(particle);
    }
}

// ==================== DATE FIELDS ====================
function initDateFields() {
    const dateInputs = document.querySelectorAll('input[type="date"]');
    const today = new Date().toISOString().split('T')[0];
    dateInputs.forEach(input => {
        input.value = today;
    });
}

// ==================== AUTHENTICATION ====================
function checkAuthentication() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user && window.location.hash !== '#login') {
        showPage('dashboard');
        updateUserDisplay(user);
        if (user.role === 'admin') {
            document.body.classList.add('admin-mode');
        }
    }
}

function updateUserDisplay(user) {
    document.getElementById('user-display-name').textContent = user.name || 'Dr. User';
    document.getElementById('user-display-role').textContent = user.role === 'admin' ? 'Administrator' : 'Doctor';
}

// ==================== EVENT LISTENERS ====================
function initEventListeners() {

    // =====================================================
    // LOGIN FORM
    // =====================================================

    document
        .getElementById('login-form')
        .addEventListener(
            'submit',
            handleLogin
        );

    // =====================================================
    // REGISTRATION FORM
    // =====================================================

    document
        .getElementById('registration-form')
        .addEventListener(
            'submit',
            handleRegistration
        );

    // =====================================================
    // PASSWORD STRENGTH
    // =====================================================

    const regPassword =
        document.getElementById(
            'reg-password'
        );

    if (regPassword) {

        regPassword.addEventListener(
            'input',
            checkPasswordStrength
        );
    }

    // =====================================================
    // DROPZONE
    // =====================================================

    initDropzone();

    // =====================================================
    // CLOSE DROPDOWNS
    // =====================================================

    document.addEventListener(
        'click',
        function(e) {

            if (
                !e.target.closest(
                    '.notifications'
                )
            ) {

                document
                    .getElementById(
                        'notifications-dropdown'
                    )
                    .classList.remove(
                        'active'
                    );
            }

            if (
                !e.target.closest(
                    '.user-profile'
                )
            ) {

                document
                    .getElementById(
                        'profile-dropdown'
                    )
                    .classList.remove(
                        'active'
                    );
            }
        }
    );

    // =====================================================
    // PROFILE FORM
    // =====================================================

    document
        .getElementById('profile-form')
        .addEventListener(
            'submit',
            function(e) {

                e.preventDefault();

                showModal(

                    'success-modal',

                    'Profile Updated',

                    'Your profile has been updated successfully.'
                );
            }
        );

    // =====================================================
    // PASSWORD FORM
    // =====================================================

    document
        .getElementById('password-form')
        .addEventListener(
            'submit',
            function(e) {

                e.preventDefault();

                const currentPassword =
                    document
                        .getElementById(
                            'current-password'
                        )
                        .value
                        .trim();

                const newPassword =
                    document
                        .getElementById(
                            'new-password'
                        )
                        .value
                        .trim();

                const confirmPassword =
                    document
                        .getElementById(
                            'confirm-password'
                        )
                        .value
                        .trim();

                // Validate Empty
                if (

                    !currentPassword ||

                    !newPassword ||

                    !confirmPassword
                ) {

                    showModal(

                        'error-modal',

                        'Error',

                        'All password fields are required.'
                    );

                    return;
                }

                // Validate Length
                if (
                    newPassword.length < 8
                ) {

                    showModal(

                        'error-modal',

                        'Error',

                        'New password must be at least 8 characters long.'
                    );

                    return;
                }

                // Validate Match
                if (
                    newPassword !==
                    confirmPassword
                ) {

                    showModal(

                        'error-modal',

                        'Error',

                        'New password and confirm password do not match.'
                    );

                    return;
                }

                // Validate Different
                if (
                    currentPassword ===
                    newPassword
                ) {

                    showModal(

                        'error-modal',

                        'Error',

                        'New password must be different from current password.'
                    );

                    return;
                }

                // Success
                this.reset();

                showModal(

                    'success-modal',

                    'Password Changed',

                    'Your password has been changed successfully.'
                );
            }
        );

    

    // =====================================================
    // DARK MODE TOGGLE
    // =====================================================

    const darkModeToggle =
        document.getElementById(
            'dark-mode-toggle'
        );

    if (darkModeToggle) {

        const savedTheme =
            localStorage.getItem(
                'theme'
            );

        if (
            savedTheme === 'light'
        ) {

            document.body.classList.add(
                'light-mode'
            );

            darkModeToggle.checked = false;

        } else {

            document.body.classList.remove(
                'light-mode'
            );

            darkModeToggle.checked = true;
        }

        darkModeToggle.addEventListener(
            'change',
            function() {

                if (this.checked) {

                    document.body.classList.remove(
                        'light-mode'
                    );

                    localStorage.setItem(
                        'theme',
                        'dark'
                    );

                } else {

                    document.body.classList.add(
                        'light-mode'
                    );

                    localStorage.setItem(
                        'theme',
                        'light'
                    );
                }
            }
        );
    }
}

// =========================================================
// PAGE LOAD INITIALIZATION
// =========================================================

document.addEventListener(

    "DOMContentLoaded",

    () => {

        initEventListeners();

        loadReports();
    }
);


// ==================== LOAD ADMIN STATS ====================

async function loadAdminStats() {

    try {

        const response = await fetch(

            `${BASE_URL}/admin/stats`
        );

        const data = await response.json();

        console.log(data);

        document.getElementById(

            "total-doctors-count"

        ).textContent = data.total_doctors;

        document.getElementById(

            "pending-doctors-count"

        ).textContent = data.pending_doctors;

        document.getElementById(

            "dataset-size-count"

        ).textContent = data.dataset_size;

        document.getElementById(

            "total-predictions-count"

        ).textContent = data.total_predictions;

    }

    catch (error) {

        console.error(error);
    }
}


// =====================================================
// OTP VERIFICATION MODAL
// =====================================================

function showOTPVerificationModal(email) {

    document.getElementById(
        "otp-modal"
    ).classList.add("active");

    document.getElementById(
        "otp-email"
    ).value = email;
}


// =====================================================
// VERIFY OTP
// =====================================================

// =====================================================
// VERIFY OTP
// =====================================================

async function verifyOTP() {

    try {

        const email = document.getElementById(
            "otp-email"
        ).value;

        const otp = document.getElementById(
            "otp-code"
        ).value;

        if (!otp) {

            alert("Please enter OTP");

            return;
        }

        // =============================================
        // VERIFY OTP API
        // =============================================

        const verifyResponse = await fetch(

            `${BASE_URL}/verify-otp?email=${email}&otp=${otp}`,

            {
                method: "POST"
            }
        );

        const verifyData =
            await verifyResponse.json();

        console.log(verifyData);

        // =============================================
        // OTP FAILED
        // =============================================

        if (!verifyResponse.ok) {

            showModal(

                'error-modal',

                'Verification Failed',

                verifyData.detail || "Invalid OTP"
            );

            return;
        }

        // =============================================
        // GET REGISTRATION DATA
        // =============================================

        const payload = {

            full_name: document.getElementById(
                'reg-fullname'
            ).value,

            doctor_id: document.getElementById(
                'reg-doctorid'
            ).value,

            license_number: document.getElementById(
                'reg-license'
            ).value,

            specialization: document.getElementById(
                'reg-specialization'
            ).value,

            hospital_name: document.getElementById(
                'reg-hospital'
            ).value,

            email: document.getElementById(
                'reg-email'
            ).value,

            phone: document.getElementById(
                'reg-phone'
            ).value,

            password: document.getElementById(
                'reg-password'
            ).value,

            experience: document.getElementById(
                'reg-experience'
            ).value,

            city: document.getElementById(
                'reg-city'
            ).value
        };

        // =============================================
        // REGISTER API
        // =============================================

        const registerResponse = await fetch(

            `${BASE_URL}/register`,

            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify(payload)
            }
        );

        const registerData =
            await registerResponse.json();

        console.log(registerData);

        // =============================================
        // REGISTRATION SUCCESS
        // =============================================

        if (registerResponse.ok) {

            // CLOSE OTP MODAL
            document.getElementById(
                "otp-modal"
            ).classList.remove("active");

            // RESET FORM
            document.getElementById(
                'registration-form'
            ).reset();

            // SUCCESS MESSAGE
            showModal(

                'success-modal',

                'Registration Successful',

                'Doctor registration completed successfully. Awaiting admin approval.'
            );

            // REDIRECT TO LOGIN
            setTimeout(() => {

                showPage("login-page");

            }, 2000);
        }

        // =============================================
        // REGISTRATION FAILED
        // =============================================

        else {

            showModal(

                'error-modal',

                'Registration Failed',

                registerData.detail ||
                "Registration failed"
            );
        }

    }

    catch (error) {

        console.error(error);

        showModal(

            'error-modal',

            'Server Error',

            'OTP verification failed'
        );
    }
}

// =====================================================
// OPEN FORGOT PASSWORD MODAL
// =====================================================

function openForgotPassword() {

    document.getElementById(

        "forgot-password-modal"

    ).classList.add("active");
}


// =====================================================
// SEND RESET OTP
// =====================================================

async function sendForgotOTP() {

    const email = document.getElementById(

        "forgot-email"

    ).value;

    const response = await fetch(

        `${BASE_URL}/forgot-password?email=${email}`,

        {

            method: "POST"
        }
    );

    const data = await response.json();

    alert(data.message);
}


// =====================================================
// RESET PASSWORD
// =====================================================

async function resetPassword() {

    const email = document.getElementById(

        "forgot-email"

    ).value;

    const otp = document.getElementById(

        "forgot-otp"

    ).value;

    const newPassword = document.getElementById(

        "new-password"

    ).value;

    const response = await fetch(

        `${BASE_URL}/reset-password?email=${email}&otp=${otp}&new_password=${newPassword}`,

        {

            method: "POST"
        }
    );

    const data = await response.json();

    if (response.ok) {

        alert(

            "Password reset successful"
        );

        document.getElementById(

            "forgot-password-modal"

        ).classList.remove("active");

    }

    else {

        alert(

            data.detail
        );
    }
}


        

    // =====================================================
// LOGIN HANDLER
// =====================================================

async function handleLogin(e) {

    e.preventDefault();

    try {

        const email = document.getElementById(
            'login-email'
        ).value;

        const password = document.getElementById(
            'login-password'
        ).value;

        // =============================================
        // LOGIN API
        // =============================================

        const response = await fetch(

            `${BASE_URL}/login`,

            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    email,
                    password
                })
            }
        );

        // =============================================
        // PARSE RESPONSE
        // =============================================

        const data = await response.json();

        console.log("LOGIN RESPONSE:", data);

        // =============================================
        // LOGIN FAILED
        // =============================================

        if (!response.ok) {

            showModal(

                'error-modal',

                'Login Failed',

                data.detail || 'Invalid credentials'
            );

            return;
        }

        // =============================================
        // STORE TOKEN
        // =============================================

        localStorage.setItem(

            "access_token",

            data.access_token
        );

        // =============================================
        // STORE USER
        // =============================================

        const user = {

            email: email,

            name: data.full_name,

            role: data.role
        };

        localStorage.setItem(

            'currentUser',

            JSON.stringify(user)
        );

        // =============================================
        // ADMIN MODE
        // =============================================

        if (data.role === 'admin') {

            document.body.classList.add(
                'admin-mode'
            );

        } else {

            document.body.classList.remove(
                'admin-mode'
            );
        }

        // =============================================
        // UPDATE UI
        // =============================================

        updateUserDisplay(user);

        showPage('dashboard');

        showDashboardSection(
            'dashboard-home'
        );

        loadReports();

        animateCounters();

        // =============================================
        // SUCCESS
        // =============================================

        showModal(

            'success-modal',

            'Login Successful',

            `Welcome ${data.full_name}`
        );

    }

    catch (error) {

        console.error(error);

        showModal(

            'error-modal',

            'Server Error',

            'Backend connection failed'
        );
    }
}

async function handleRegistration(e) {

    e.preventDefault();

    // =========================================
    // PASSWORD VALIDATION
    // =========================================

    const password =
        document.getElementById(
            'reg-password'
        ).value;

    const confirmPassword =
        document.getElementById(
            'reg-confirm-password'
        ).value;

    if (password !== confirmPassword) {

        alert("Passwords do not match!");

        return;
    }

    // =========================================
    // TERMS CHECK
    // =========================================

    if (
        !document.getElementById(
            'reg-terms'
        ).checked
    ) {

        alert(
            "Please accept Terms & Conditions"
        );

        return;
    }

    // =========================================
    // PAYLOAD
    // =========================================

    const payload = {

        full_name:
            document.getElementById(
                'reg-fullname'
            ).value,

        doctor_id:
            document.getElementById(
                'reg-doctorid'
            ).value,

        license_number:
            document.getElementById(
                'reg-license'
            ).value,

        specialization:
            document.getElementById(
                'reg-specialization'
            ).value,

        hospital_name:
            document.getElementById(
                'reg-hospital'
            ).value,

        email:
            document.getElementById(
                'reg-email'
            ).value,

        phone:
            document.getElementById(
                'reg-phone'
            ).value,

        password: password,

        experience:
            document.getElementById(
                'reg-experience'
            ).value,

        city:
            document.getElementById(
                'reg-city'
            ).value
    };

    try {

        const response = await fetch(

            `${BASE_URL}/register`,

            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify(
                    payload
                )
            }
        );

        const data =
            await response.json();

        console.log(data);

        // =====================================
        // SUCCESS
        // =====================================

        if (response.ok) {

            document.getElementById(
                'registration-form'
            ).reset();

            // SHOW OTP MODAL
            showOTPVerificationModal(
                payload.email
            );

            alert(
                "OTP sent to your email"
            );
        }


        if (!emailVerified) {

            showModal(

                'error-modal',

                'Email Verification Required',

                'Please verify your email first'
            );

            return;
        }

        // =====================================
        // FAILED
        // =====================================

        else {

            alert(
                data.detail ||
                "Registration failed"
            );
        }

    }

    // =========================================
    // SERVER ERROR
    // =========================================

    catch (error) {

        console.error(error);

        alert(
            "Backend connection failed"
        );
    }
}


// ==================== PASSWORD UTILITIES ====================
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.parentElement.querySelector('.toggle-password i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

function checkPasswordStrength() {
    const password = document.getElementById('reg-password').value;
    const strengthDiv = document.getElementById('password-strength');
    const strengthText = strengthDiv.querySelector('.strength-text');
    
    strengthDiv.classList.remove('weak', 'medium', 'strong');
    
    if (password.length < 6) {
        strengthDiv.classList.add('weak');
        strengthText.textContent = 'Weak password';
    } else if (password.length < 10) {
        strengthDiv.classList.add('medium');
        strengthText.textContent = 'Medium strength';
    } else {
        strengthDiv.classList.add('strong');
        strengthText.textContent = 'Strong password';
    }
}

// ==================== PAGE NAVIGATION ====================
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
    
    // Reinitialize charts when showing dashboard
    if (pageId === 'dashboard') {
        setTimeout(() => {
            initCharts();
            animateCounters();
        }, 100);
    }
}


async function loadDashboardStats() {

    try {

        const token =
            localStorage.getItem(
                "access_token"
            );

        if (!token) {

            console.log(
                "No token found"
            );

            return;
        }

        const response = await fetch(

            `${BASE_URL}/admin/stats`,

            {

                headers: {

                    Authorization:
                        `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {

            throw new Error(
                "Failed to load dashboard stats"
            );
        }

        const data =
            await response.json();

        console.log(data);

        // =====================================
        // UPDATE DASHBOARD CARDS
        // =====================================

        document.getElementById(
            "total-predictions"
        ).textContent =
            data.total_predictions;

        document.getElementById(
            "normal-cases"
        ).textContent =
            data.normal_cases;

        document.getElementById(
            "suspect-cases"
        ).textContent =
            data.suspect_cases;

        document.getElementById(
            "kcn-cases"
        ).textContent =
            data.keratoconus_cases;

        document.getElementById(
            "accuracy-rate"
        ).textContent =
            data.accuracy + "%";

    }

    catch(error) {

        console.error(error);
    }
}


function showDashboardSection(sectionId) {

    // =========================================
    // UPDATE SIDEBAR ACTIVE STATE
    // =========================================

    document.querySelectorAll(
        '.nav-item'
    ).forEach(item => {

        item.classList.remove(
            'active'
        );
    });

    document.querySelector(

        `.nav-item[data-page="${sectionId}"]`

    )?.classList.add('active');

    // =========================================
    // SHOW SELECTED SECTION
    // =========================================

    document.querySelectorAll(
        '.dashboard-section'
    ).forEach(section => {

        section.classList.remove(
            'active'
        );
    });

    document.getElementById(
        sectionId
    ).classList.add('active');

    // =========================================
    // DASHBOARD HOME
    // =========================================

    if (
        sectionId ===
        'dashboard-home'
    ) {

        loadDashboardStats();

        initCharts();

        loadActivityFeed();

        setTimeout(
            animateCounters,
            200
        );
    }

    // =========================================
    // REPORTS PAGE
    // =========================================

    if (
        sectionId ===
        'reports-section'
    ) {

        loadReports();
    }

    // =========================================
    // ADMIN PAGE
    // =========================================

    if (
        sectionId ===
        'admin-section'
    ) {

        loadDashboardStats();

        setTimeout(
            animateCounters,
            200
        );
    }

    // =========================================
    // MOBILE SIDEBAR CLOSE
    // =========================================

    if (
        window.innerWidth < 992
    ) {

        document
            .getElementById(
                'sidebar'
            )
            .classList.remove(
                'active'
            );
    }
}


// ==================== SIDEBAR ====================
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    
    if (window.innerWidth < 992) {
        sidebar.classList.toggle('active');
    } else {
        sidebar.classList.toggle('collapsed');
    }
}

// ==================== DROPDOWNS ====================
function toggleNotifications() {
    document.getElementById('notifications-dropdown').classList.toggle('active');
    document.getElementById('profile-dropdown').classList.remove('active');
}

function toggleProfileMenu() {
    document.getElementById('profile-dropdown').classList.toggle('active');
    document.getElementById('notifications-dropdown').classList.remove('active');
}

// ==================== LOGOUT ====================
function logout() {
    localStorage.removeItem('currentUser');
    document.body.classList.remove('admin-mode');
    showPage('login-page');
    document.getElementById('login-form').reset();
}




// ==================== DROPZONE / FILE UPLOAD ====================
let uploadedFiles = [];

function initDropzone() {
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('file-input');
    
    if (!dropzone) return;
    
    dropzone.addEventListener('click', () => fileInput.click());
    
    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
    });
    
    dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('dragover');
    });
    
    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });
    
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });
}

function handleFiles(files) {
    const preview = document.getElementById('upload-preview');
    const maxFiles = 2;
    
    // Check if adding these files would exceed max
    const filesToAdd = Array.from(files).filter(f => f.type.startsWith('image/'));
    const remainingSlots = maxFiles - uploadedFiles.length;
    
    if (remainingSlots <= 0) {
        alert('Maximum 2 images allowed. Please remove an image first.');
        return;
    }
    
    if (filesToAdd.length > remainingSlots) {
        alert(`You can only add ${remainingSlots} more image(s). Maximum is 2.`);
    }
    
    // Only add files up to the limit
    filesToAdd.slice(0, remainingSlots).forEach(file => {
        uploadedFiles.push(file);
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const item = document.createElement('div');
            item.className = 'preview-item';
            const currentIndex = uploadedFiles.length - 1;
            item.innerHTML = `
                <img src="${e.target.result}" alt="${file.name}">
                <button class="remove-btn" onclick="removeUpload(this, ${currentIndex})">
                    <i class="fas fa-times"></i>
                </button>
            `;
            item.setAttribute('data-index', currentIndex);
            preview.appendChild(item);
        };
        reader.readAsDataURL(file);
    });
}

function removeUpload(btn, index) {
    uploadedFiles.splice(index, 1);
    btn.parentElement.remove();
    
    // Rebuild indices for remaining items
    const preview = document.getElementById('upload-preview');
    const items = preview.querySelectorAll('.preview-item');
    items.forEach((item, i) => {
        item.setAttribute('data-index', i);
        const removeBtn = item.querySelector('.remove-btn');
        removeBtn.setAttribute('onclick', `removeUpload(this, ${i})`);
    });
}

function clearUploads() {
    uploadedFiles = [];
    document.getElementById('upload-preview').innerHTML = '';
    document.getElementById('file-input').value = '';
}

// ==================== AI PREDICTION ====================


async function runPrediction() {

    try {

        // =========================
        // Validate Form
        // =========================

        const patientId =
            document.getElementById("patient-id").value;

        const patientName =
            document.getElementById("patient-name").value;

        const age =
            document.getElementById("patient-age").value;

        const gender =
            document.getElementById("patient-gender").value;

        const eye =
            document.getElementById("patient-eye").value;

        if (
            !patientId ||
            !patientName ||
            !age ||
            !gender ||
            !eye
        ) {

            alert("Please fill all patient details");

            return;
        }

        if (uploadedFiles.length === 0) {

            alert("Please upload Pentacam image");

            return;
        }

        // =========================
        // Loading UI
        // =========================

        const loadingOverlay =
            document.getElementById(
                "loading-overlay"
            );

        const progressFill =
            document.getElementById(
                "progress-fill"
            );

        const loadingStatus =
            document.getElementById(
                "loading-status"
            );

        loadingOverlay.classList.add("active");

        progressFill.style.width = "40%";

        loadingStatus.textContent =
            "Uploading Pentacam image...";

        // =========================
        // Create FormData
        // =========================

        const formData = new FormData();

        formData.append(
            "patient_id",
            patientId
        );

        formData.append(
            "patient_name",
            patientName
        );

        formData.append(
            "age",
            age
        );

        formData.append(
            "gender",
            gender
        );

        formData.append(
            "eye_type",
            eye
        );

        formData.append(
            "file",
            uploadedFiles[0]
        );

        // =========================
        // JWT Token
        // =========================

        const token =
            localStorage.getItem(
                "access_token"
            );

        progressFill.style.width = "70%";

        loadingStatus.textContent =
            "Running AI model inference...";

        // =========================
        // API CALL
        // =========================

        const response = await fetch(

            `${BASE_URL}/predict`,

            {

                method: "POST",

                headers: {

                    Authorization:
                        `Bearer ${token}`
                },

                body: formData
            }
        );

        const data = await response.json();

        console.log(data);

        // =========================
        // Error Handling
        // =========================

        if (!response.ok) {

            loadingOverlay.classList.remove(
                "active"
            );

            alert(data.detail || "Prediction failed");

            return;
        }

        progressFill.style.width = "100%";

        loadingStatus.textContent =
            "Prediction completed";

        // =========================
        // Convert Backend Response
        // =========================

        const prediction = {

            patientId: patientId,

            patientName: patientName,

            age: age,

            gender: gender,

            eye: eye,

            date: data.created_at,

            predictedClass:
                data.prediction.predicted_class,

            confidence:
                data.prediction.confidence,

            riskScore:
                Math.round(
                    data.prediction.confidence
                ),

            doctor:
                data.uploaded_by,

            gradcam:
                `${BASE_URL}/${data.gradcam_image}`,

            originalImage:
                `${BASE_URL}/${data.uploaded_image}`
        };

        

        // =========================
        // Show Prediction
        // =========================

        setTimeout(() => {

            loadingOverlay.classList.remove(
                "active"
            );

            displayPrediction(prediction);
            // Refresh reports table
               loadReports();

            showDashboardSection(
                "prediction-section"
            );

        }, 1000);

    }

    catch (error) {

        console.error(error);

        alert("Server error");

        document
            .getElementById(
                "loading-overlay"
            )
            .classList.remove("active");
    }
}

function displayPrediction(prediction) {
    const container = document.getElementById('prediction-container');
    
    const classMap = {
        'Normal': 'normal',
        'Suspect': 'suspect',
        'Keratoconus': 'kcn'
    };
    
    const recommendations = {
        'Normal': 'No signs of corneal ectasia detected. The corneal topography appears within normal limits. Regular annual eye examinations are recommended to monitor any changes.',
        'Suspect': 'Subclinical keratoconus indicators detected. While not definitive, there are early signs that warrant attention. Recommend follow-up examination in 3-6 months and consider corneal cross-linking consultation.',
        'Keratoconus': 'Significant keratoconus indicators detected with high confidence. Immediate referral to a corneal specialist is strongly recommended. Consider corneal cross-linking (CXL) treatment to halt progression.'
    };
    
    // Calculate needle rotation (0 = -90deg, 100 = 90deg)
    const needleRotation = (prediction.riskScore / 100) * 180 - 90;
    
    container.innerHTML = `
        <div class="prediction-results">
            <div class="prediction-main">
                <div class="prediction-card glass-card ${classMap[prediction.predictedClass]}">
                    <p class="prediction-label">AI Predicted Classification</p>
                    <h2 class="prediction-class">${prediction.predictedClass}</h2>
                    <span class="confidence-badge">${prediction.confidence}% Confidence</span>
                </div>
                
                <div class="risk-meter-card glass-card">
                    <h4>Risk Score Assessment</h4>
                    <div class="risk-meter">
                        <div class="meter-gauge">
                            <div class="meter-bg"></div>
                            <div class="meter-needle" style="transform: translateX(-50%) rotate(${needleRotation}deg);"></div>
                        </div>
                        <span class="risk-value">${prediction.riskScore}</span>
                    </div>
                    <div class="risk-labels">
                        <span>Low (0)</span>
                        <span>High (100)</span>
                    </div>
                </div>
                
            
            </div>
            
            <div class="prediction-details">
                <div class="recommendation-card glass-card">
                    <h4><i class="fas fa-clipboard-check"></i> Clinical Recommendation</h4>
                    <div class="recommendation-text">
                        <p>${recommendations[prediction.predictedClass]}</p>
                    </div>
                </div>
                
                <div class="patient-summary glass-card" style="padding: 25px; margin-top: 20px;">
                    <h4 style="margin-bottom: 20px;"><i class="fas fa-user" style="color: var(--accent-cyan); margin-right: 10px;"></i>Patient Summary</h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <p><strong>Patient ID:</strong> ${prediction.patientId}</p>
                        <p><strong>Name:</strong> ${prediction.patientName}</p>
                        <p><strong>Age:</strong> ${prediction.age} years</p>
                        <p><strong>Gender:</strong> ${prediction.gender}</p>
                        <p><strong>Eye:</strong> ${prediction.eye}</p>
                        <p><strong>Date:</strong> ${prediction.date}</p>
                        <p><strong>Doctor:</strong> ${prediction.doctor}</p>
                    </div>
                </div>
            </div>
        </div>
        
       <div class="xai-section">

    <h3>
        <i class="fas fa-search-plus"></i>
        Explainable AI Analysis
    </h3>

    <div class="xai-grid">

        <!-- Original Image -->
        <div class="xai-image glass-card">

            <img
                src="${prediction.originalImage}"
                style="
                    width:100%;
                    height:100%;
                    object-fit:cover;
                    border-radius:16px;
                "
            >

            <span class="xai-label">
                Original Pentacam Map
            </span>

        </div>

        <!-- GradCAM -->
        <div class="xai-image glass-card">

            <img
                src="${prediction.gradcam}"
                style="
                    width:100%;
                    height:100%;
                    object-fit:cover;
                    border-radius:16px;
                "
            >

            <span class="xai-label">
                GradCAM Heatmap
            </span>

        </div>

    </div>

    <div class="xai-explanation glass-card">

        <h4>
            <i class="fas fa-lightbulb"></i>
            Why AI Predicted This?
        </h4>

        <p>

            The AI model analyzed corneal topography patterns
            from the uploaded Pentacam map.

            The GradCAM heatmap highlights the regions
            that most influenced the AI prediction.

        </p>

        <p>

            Red/yellow regions indicate high attention areas
            used by the deep learning model for identifying
            Keratoconus patterns.

        </p>

        <div
            class="heatmap-legend"
            style="margin-top:25px;"
        >

            <span
                style="
                    font-size:0.9rem;
                    color:var(--text-secondary);
                "
            >
                Attention Level:
            </span>

            <div style="flex:1;">

                <div class="legend-bar"></div>

                <div
                    class="legend-labels"
                    style="
                        display:flex;
                        justify-content:space-between;
                        margin-top:5px;
                    "
                >

                    <span>Low</span>

                    <span>Medium</span>

                    <span>High</span>

                </div>

            </div>

        </div>

    </div>

</div>
    `;
    
    // Clear the form for next patient
    document.getElementById('patient-form').reset();
    initDateFields();
    clearUploads();
}

/// ==================== REPORTS MANAGEMENT ====================

// =========================================================
// LOAD REPORTS FROM BACKEND
// =========================================================

async function loadReports() {

    try {

        const token =
            localStorage.getItem(
                "access_token"
            );

        // No token
        if (!token) {

            console.log(
                "No token found"
            );

            return;
        }

        const response = await fetch(

            `${BASE_URL}/reports`,

            {

                headers: {

                    Authorization:
                        `Bearer ${token}`
                }
            }
        );

        // Unauthorized
        if (!response.ok) {

            throw new Error(
                "Failed to load reports"
            );
        }

        const reports =
            await response.json();

        console.log(reports);

        renderReports(reports);

    }

    catch(error) {

        console.error(error);
    }
}

// =========================================================
// RENDER REPORTS TABLE
// =========================================================

function renderReports(reports) {

    const tbody =
        document.getElementById(
            "reports-tbody"
        );

    tbody.innerHTML = "";

    const classMap = {

        'Normal': 'normal',

        'Suspect': 'suspect',

        'Keratoconus': 'kcn'
    };

    // =====================================================
    // EMPTY REPORTS
    // =====================================================

    if (reports.length === 0) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="8"

                    style="
                        text-align:center;
                        padding:40px;
                        color:var(--text-muted);
                    "
                >

                    No reports found.

                </td>

            </tr>
        `;

        return;
    }

    // =====================================================
    // RENDER ROWS
    // =====================================================

    reports.forEach(report => {

        tbody.innerHTML += `

            <tr>

                <td>${report.patient_id}</td>

                <td>${report.patient_name}</td>

                <td>

                    ${new Date(
                        report.created_at
                    ).toLocaleString()}

                </td>

                <td>${report.eye_type}</td>

                <td>

                    <span
                        class="
                            status-badge
                            ${classMap[report.prediction]}
                        "
                    >

                        ${report.prediction}

                    </span>

                </td>

                <td>

                    ${parseFloat(
                        report.confidence
                    ).toFixed(1)}%

                </td>

                <td>

                    ${report.doctor_name}

                </td>

                <td>

                    <div class="action-btns">

                        <!-- VIEW -->
                        <button
                            class="view-btn"

                            onclick='viewReport(${JSON.stringify(report)})'
                        >

                            <i class="fas fa-eye"></i>

                        </button>

                        <!-- PDF -->
                            <button
                                class="download-btn"

                                onclick="downloadReportPDF(${report.id})"
                            >

                                <i class="fas fa-download"></i>

                            </button>

                            <!-- DELETE -->
                            <button
                                class="delete-btn"

                                onclick="deleteReport(${report.id})"
                            >

                                <i class="fas fa-trash"></i>

                            </button>

                    </div>

                </td>

            </tr>
        `;
    });
}

async function deleteReport(id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this report?"
    );

    if (!confirmDelete) {

        return;
    }

    try {

        const token =
            localStorage.getItem(
                "access_token"
            );

        const response = await fetch(

            `${BASE_URL}/reports/${id}`,

            {

                method: "DELETE",

                headers: {

                    Authorization:
                        `Bearer ${token}`
                }
            }
        );

        const data =
            await response.json();

        if (!response.ok) {

            alert(
                data.detail ||
                "Delete failed"
            );

            return;
        }

        alert(
            "Report deleted successfully"
        );

        // Reload reports
        loadReports();

    }

    catch(error) {

        console.error(error);

        alert(
            "Delete failed"
        );
    }
}

// =========================================================
// FILTER REPORTS
// =========================================================

async function filterReports() {

    try {

        const token =
            localStorage.getItem(
                "access_token"
            );

        const response = await fetch(

            `${BASE_URL}/reports`,

            {

                headers: {

                    Authorization:
                        `Bearer ${token}`
                }
            }
        );

        let reports =
            await response.json();

        const searchTerm =
            document
                .getElementById(
                    'report-search'
                )
                .value
                .toLowerCase();

        const filterValue =
            document
                .getElementById(
                    'report-filter'
                )
                .value;

        reports = reports.filter(report => {

            const matchesSearch =

                report.patient_id
                    .toLowerCase()
                    .includes(searchTerm)

                ||

                report.patient_name
                    .toLowerCase()
                    .includes(searchTerm);

            const matchesFilter =

                filterValue === 'all'

                ||

                report.prediction === filterValue;

            return (
                matchesSearch &&
                matchesFilter
            );
        });

        renderReports(reports);

    }

    catch(error) {

        console.error(error);
    }
}


// =========================================================
// SORT REPORTS
// =========================================================

async function sortReports() {

    try {

        const token =
            localStorage.getItem(
                "access_token"
            );

        const response = await fetch(

            `${BASE_URL}/reports`,

            {

                headers: {

                    Authorization:
                        `Bearer ${token}`
                }
            }
        );

        let reports =
            await response.json();

        const sortValue =
            document.getElementById(
                'report-sort'
            ).value;

        reports.sort((a, b) => {

            switch (sortValue) {

                case 'date-desc':

                    return new Date(
                        b.created_at
                    ) - new Date(
                        a.created_at
                    );

                case 'date-asc':

                    return new Date(
                        a.created_at
                    ) - new Date(
                        b.created_at
                    );

                case 'confidence-desc':

                    return (
                        b.confidence -
                        a.confidence
                    );

                case 'confidence-asc':

                    return (
                        a.confidence -
                        b.confidence
                    );

                default:

                    return 0;
            }
        });

        renderReports(reports);

    }

    catch(error) {

        console.error(error);
    }
}


// =========================================================
// VIEW REPORT MODAL
// =========================================================

function viewReport(report) {

    const modalBody =
        document.getElementById(
            'report-modal-body'
        );

    const classColors = {

        'Normal': 'var(--success)',

        'Suspect': 'var(--warning)',

        'Keratoconus': 'var(--danger)'
    };

    modalBody.innerHTML = `

        <div style="display:grid; gap:20px;">

            <!-- Patient Information -->
            <div
                style="
                    background:var(--bg-secondary);
                    padding:20px;
                    border-radius:12px;
                "
            >

                <h4
                    style="
                        margin-bottom:15px;
                        color:var(--accent-cyan);
                    "
                >

                    <i class="fas fa-user"></i>

                    Patient Information

                </h4>

                <div
                    style="
                        display:grid;
                        grid-template-columns:1fr 1fr;
                        gap:10px;
                    "
                >

                    <p>
                        <strong>Patient ID:</strong>
                        ${report.patient_id}
                    </p>

                    <p>
                        <strong>Name:</strong>
                        ${report.patient_name}
                    </p>

                    <p>
                        <strong>Age:</strong>
                        ${report.age}
                    </p>

                    <p>
                        <strong>Gender:</strong>
                        ${report.gender}
                    </p>

                    <p>
                        <strong>Eye:</strong>
                        ${report.eye_type}
                    </p>

                    <p>
                        <strong>Date:</strong>

                        ${new Date(
                            report.created_at
                        ).toLocaleString()}
                    </p>

                </div>

            </div>

            <!-- AI Prediction -->
            <div
                style="
                    background:var(--bg-secondary);
                    padding:20px;
                    border-radius:12px;
                "
            >

                <h4
                    style="
                        margin-bottom:15px;
                        color:var(--accent-cyan);
                    "
                >

                    <i class="fas fa-brain"></i>

                    AI Prediction

                </h4>

                <div
                    style="
                        text-align:center;
                    "
                >

                    <span
                        style="
                            font-size:2rem;
                            font-weight:700;
                            color:${classColors[report.prediction]};
                        "
                    >

                        ${report.prediction}

                    </span>

                    <p
                        style="
                            color:var(--text-secondary);
                            margin-top:10px;
                        "
                    >

                        Confidence:
                        ${parseFloat(
                            report.confidence
                        ).toFixed(1)}%

                    </p>

                </div>

            </div>

            <!-- Original Image -->
            <div
                style="
                    background:var(--bg-secondary);
                    padding:20px;
                    border-radius:12px;
                "
            >

                <h4
                    style="
                        margin-bottom:15px;
                        color:var(--accent-cyan);
                    "
                >

                    <i class="fas fa-image"></i>

                    Original Pentacam Map

                </h4>

                <img
                    src="${BASE_URL}/${report.uploaded_image}"

                    style="
                        width:100%;
                        border-radius:12px;
                    "
                >

            </div>

            <!-- GradCAM -->
            <div
                style="
                    background:var(--bg-secondary);
                    padding:20px;
                    border-radius:12px;
                "
            >

                <h4
                    style="
                        margin-bottom:15px;
                        color:var(--accent-cyan);
                    "
                >

                    <i class="fas fa-fire"></i>

                    GradCAM Heatmap

                </h4>

                <img
                    src="${BASE_URL}/${report.gradcam_image}"

                    style="
                        width:100%;
                        border-radius:12px;
                    "
                >

            </div>

            <!-- Doctor -->
            <div
                style="
                    background:var(--bg-secondary);
                    padding:20px;
                    border-radius:12px;
                "
            >

                <h4
                    style="
                        margin-bottom:15px;
                        color:var(--accent-cyan);
                    "
                >

                    <i class="fas fa-user-md"></i>

                    Doctor

                </h4>

                <p>${report.doctor_name}</p>

            </div>

        </div>
    `;

    document
        .getElementById(
            'report-modal'
        )
        .classList.add('active');
}


// =========================================================
// DOWNLOAD PDF
// =========================================================

async function downloadReportPDF(id) {

    try {

        const token =
            localStorage.getItem(
                "access_token"
            );

        const response = await fetch(

            `${BASE_URL}/reports/${id}/pdf`,

            {

                headers: {

                    Authorization:
                        `Bearer ${token}`
                }
            }
        );

        const data =
            await response.json();

        if (!response.ok) {

            alert(
                data.detail ||
                "Failed to generate PDF"
            );

            return;
        }

        // Open PDF
        window.open(

            `${BASE_URL}/${data.pdf_path}`,

            "_blank"
        );

    }

    catch(error) {

        console.error(error);

        alert("PDF download failed");
    }
}

function updatePagination(totalItems) {
    const pagination = document.getElementById('pagination');
    const itemsPerPage = 10;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    pagination.innerHTML = `
        <button disabled><i class="fas fa-chevron-left"></i></button>
        ${Array.from({length: Math.min(5, totalPages)}, (_, i) => 
            `<button class="${i === 0 ? 'active' : ''}">${i + 1}</button>`
        ).join('')}
        <button><i class="fas fa-chevron-right"></i></button>
    `;
}
// ==================== CHARTS ====================

let pieChart;
let barChart;
let lineChart;

async function initCharts() {

    try {

        const token =
            localStorage.getItem(
                "access_token"
            );

        // =========================================
        // FETCH REPORTS
        // =========================================

        const response = await fetch(

            `${BASE_URL}/reports`,

            {

                headers: {

                    Authorization:
                        `Bearer ${token}`
                }
            }
        );

        const reports =
            await response.json();

        console.log(reports);

        // =========================================
        // CALCULATE DATA
        // =========================================

        let normalCount = 0;
        let suspectCount = 0;
        let kcnCount = 0;

        let riskScores = [];

        reports.forEach(report => {

            if (
                report.prediction === "Normal"
            ) {

                normalCount++;
            }

            else if (
                report.prediction === "Suspect"
            ) {

                suspectCount++;
            }

            else if (
                report.prediction === "Keratoconus"
            ) {

                kcnCount++;
            }

            riskScores.push(
                parseFloat(
                    report.confidence
                )
            );
        });

        // =========================================
        // DESTROY OLD CHARTS
        // =========================================

        if (pieChart)
            pieChart.destroy();

        if (barChart)
            barChart.destroy();

        if (lineChart)
            lineChart.destroy();

        // =========================================
        // CHART SETTINGS
        // =========================================

        Chart.defaults.color =
            '#9ca3af';

        Chart.defaults.borderColor =
            'rgba(255,255,255,0.1)';

        // =========================================
        // PIE CHART
        // =========================================

        const pieCtx =
            document.getElementById(
                'pieChart'
            );

        pieChart = new Chart(

            pieCtx,

            {

                type: 'doughnut',

                data: {

                    labels: [

                        'Normal',

                        'Suspect',

                        'Keratoconus'
                    ],

                    datasets: [

                        {

                            data: [

                                normalCount,

                                suspectCount,

                                kcnCount
                            ],

                            backgroundColor: [

                                '#10b981',

                                '#f59e0b',

                                '#ef4444'
                            ],

                            borderWidth: 0
                        }
                    ]
                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {

                            position: 'bottom'
                        }
                    },

                    cutout: '65%'
                }
            }
        );

        // =========================================
        // BAR CHART
        // =========================================

        const barCtx =
            document.getElementById(
                'barChart'
            );

        barChart = new Chart(

            barCtx,

            {

                type: 'bar',

                data: {

                    labels: [

                        'Normal',

                        'Suspect',

                        'KCN'
                    ],

                    datasets: [

                        {

                            label:
                                'Cases',

                            data: [

                                normalCount,

                                suspectCount,

                                kcnCount
                            ],

                            backgroundColor: [

                                '#10b981',

                                '#f59e0b',

                                '#ef4444'
                            ],

                            borderRadius: 8
                        }
                    ]
                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {

                            display: false
                        }
                    },

                    scales: {

                        y: {

                            beginAtZero: true
                        }
                    }
                }
            }
        );

        // =========================================
        // LINE CHART
        // =========================================

        const lineCtx =
            document.getElementById(
                'lineChart'
            );

        lineChart = new Chart(

            lineCtx,

            {

                type: 'line',

                data: {

                    labels: reports.map(

                        (_, index) =>

                        `Case ${index + 1}`
                    ),

                    datasets: [

                        {

                            label:
                                'Confidence Score',

                            data:
                                riskScores,

                            borderColor:
                                '#00d4ff',

                            backgroundColor:
                                'rgba(0,212,255,0.1)',

                            fill: true,

                            tension: 0.4,

                            pointRadius: 5
                        }
                    ]
                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    scales: {

                        y: {

                            beginAtZero: true,

                            max: 100
                        }
                    }
                }
            }
        );

    }

    catch(error) {

        console.error(error);
    }
}

// ==================== ACTIVITY FEED ====================

async function loadActivityFeed() {

    try {

        const token =
            localStorage.getItem(
                "access_token"
            );

        const response = await fetch(

            `${BASE_URL}/reports`,

            {

                headers: {

                    Authorization:
                        `Bearer ${token}`
                }
            }
        );

        const reports =
            await response.json();

        const activityList =
            document.getElementById(
                'activity-list'
            );

        if (!activityList)
            return;

        // Latest 5 reports
        const latestReports =
            reports.slice(0, 5);

        activityList.innerHTML =
            latestReports.map(report => {

                let type =
                    'success';

                let icon =
                    'fa-check-circle';

                let badge =
                    'normal';

                if (
                    report.prediction ===
                    'Suspect'
                ) {

                    type =
                        'warning';

                    icon =
                        'fa-exclamation-triangle';

                    badge =
                        'suspect';
                }

                if (
                    report.prediction ===
                    'Keratoconus'
                ) {

                    type =
                        'danger';

                    icon =
                        'fa-times-circle';

                    badge =
                        'kcn';
                }

                return `

                    <div class="activity-item">

                        <div class="activity-icon ${type}">

                            <i class="fas ${icon}"></i>

                        </div>

                        <div class="activity-content">

                            <p>

                                Patient
                                ${report.patient_id}

                                -

                                ${report.prediction}

                                detected

                            </p>

                            <span>

                                ${new Date(
                                    report.created_at
                                ).toLocaleString()}

                            </span>

                        </div>

                        <span class="activity-badge ${badge}">

                            ${report.prediction}

                        </span>

                    </div>
                `;
            }).join('');

    }

    catch(error) {

        console.error(error);
    }
}

// ==================== COUNTER ANIMATION ====================

function animateCounters() {

    const counters =
        document.querySelectorAll(
            '.counter'
        );

    counters.forEach(counter => {

        const target = parseInt(

            counter.getAttribute(
                'data-target'
            )
        );

        const duration = 2000;

        const step =
            target / (duration / 16);

        let current = 0;

        const updateCounter = () => {

            current += step;

            if (current < target) {

                counter.textContent =
                    Math.floor(current);

                requestAnimationFrame(
                    updateCounter
                );

            } else {

                counter.textContent =
                    target;
            }
        };

        updateCounter();
    });
}



// ==================== LOAD DOCTORS ====================

async function loadDoctors() {

    console.log("LOAD DOCTORS RUNNING");

    try {

        const response = await fetch(

            `${BASE_URL}/admin/doctors`
        );

        const doctors = await response.json();

        console.log(doctors);

        const tableBody = document.getElementById(
            "doctor-table-body"
        );

        tableBody.innerHTML = "";

        doctors.forEach((doctor) => {

            tableBody.innerHTML += `

                <tr>

                    <td>${doctor.full_name}</td>

                    <td>${doctor.license_number}</td>

                    <td>${doctor.hospital_name}</td>

                    <td>${doctor.specialization}</td>

                    <td>

                        <span class="status-badge ${doctor.approval_status}">

                            ${doctor.approval_status}

                        </span>

                    </td>

                    <td>

                        ${doctor.approval_status === "pending"

                            ?

                            `

                            <button

                                class="btn-sm approve"

                                onclick="approveDoctor(${doctor.id})">

                                <i class="fas fa-check"></i>

                            </button>

                            <button

                                class="btn-sm reject"

                                onclick="rejectDoctor(${doctor.id})">

                                <i class="fas fa-times"></i>

                            </button>

                            `

                            :

                            `

                            <button class="btn-sm view">

                                <i class="fas fa-eye"></i>

                            </button>

                            `
                        }

                    </td>

                </tr>
            `;
        });

    }

    catch (error) {

        console.error(error);
    }
}

// ==================== APPROVE DOCTOR ====================

async function approveDoctor(id) {

    try {

        const response = await fetch(

            `${BASE_URL}/admin/approve-doctor/${id}`,

            {
                method: "PUT"
            }
        );

        const data = await response.json();

        showModal(

            'success-modal',

            'Doctor Approved',

            data.message
        );

        loadDoctors();

    }

    catch (error) {

        console.error(error);
    }
}


// ==================== REJECT DOCTOR ====================

async function rejectDoctor(id) {

    const confirmReject = confirm(

        "Reject this doctor?"
    );

    if (!confirmReject) return;

    try {

        const response = await fetch(

            `${BASE_URL}/admin/reject-doctor/${id}`,

            {
                method: "PUT"
            }
        );

        const data = await response.json();

        showModal(

            'success-modal',

            'Doctor Rejected',

            data.message
        );

        loadDoctors();

    }

    catch (error) {

        console.error(error);
    }
}

// ==================== LOAD AUDIT LOGS ====================

async function loadAuditLogs() {

    try {

        const response = await fetch(

            `${BASE_URL}/admin/logs`
        );

        const logs = await response.json();

        console.log(logs);

        const logsContainer = document.getElementById(
            "logs-list"
        );

        logsContainer.innerHTML = "";

        logs.forEach((log) => {

            logsContainer.innerHTML += `

                <div class="log-item">

                    <span class="log-time">

                        ${new Date(log.created_at).toLocaleString()}
                    </span>

                    <span class="log-type ${log.log_type.toLowerCase()}">

                        ${log.log_type}
                    </span>

                    <span class="log-message">

                        ${log.message}
                    </span>

                </div>
            `;
        });

    }

    catch (error) {

        console.error(error);
    }
}

// ==================== ADMIN ====================
function showAdminTab(tabId) {
    // Update tabs
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
    
    // Show content
    document.querySelectorAll('.admin-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabId).classList.add('active');
}


// ==================== MODALS ====================
function showModal(modalId, title, message) {
    const modal = document.getElementById(modalId);
    if (title) document.getElementById('modal-title').textContent = title;
    if (message) document.getElementById('modal-message').textContent = message;
    modal.classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// ==================== CHATBOT ====================

let chatHistory = [];

// ========================================
// TOGGLE CHATBOT
// ========================================

function toggleChatbot() {

    const chatbotWindow =
        document.getElementById(
            'chatbot-window'
        );

    const badge =
        document.querySelector(
            '.chatbot-badge'
        );

    chatbotWindow.classList.toggle(
        'active'
    );

    if (
        chatbotWindow.classList.contains(
            'active'
        )
    ) {

        badge.style.display = 'none';
    }
}

// ========================================
// MINIMIZE CHATBOT
// ========================================

function minimizeChatbot() {

    document
        .getElementById(
            'chatbot-window'
        )
        .classList.remove(
            'active'
        );
}

// ========================================
// LOAD CHAT HISTORY
// ========================================

function loadChatHistory() {

    chatHistory = JSON.parse(

        localStorage.getItem(
            'chatHistory'
        ) || '[]'
    );

    if (chatHistory.length > 0) {

        const messagesContainer =
            document.getElementById(
                'chatbot-messages'
            );

        messagesContainer.innerHTML = "";

        chatHistory.forEach(msg => {

            addMessageToUI(

                msg.text,

                msg.isUser,

                false
            );
        });
    }
}

// ========================================
// SAVE CHAT HISTORY
// ========================================

function saveChatHistory() {

    localStorage.setItem(

        'chatHistory',

        JSON.stringify(chatHistory)
    );
}

// ========================================
// QUICK BUTTONS
// ========================================

function sendQuickMessage(text) {

    sendMessage(text);
}

// ========================================
// SEND CHAT MESSAGE
// ========================================

function sendChatMessage() {

    const input =
        document.getElementById(
            'chatbot-input'
        );

    const text =
        input.value.trim();

    if (text) {

        sendMessage(text);

        input.value = '';
    }
}

// ========================================
// ENTER KEY SUPPORT
// ========================================

function handleChatKeypress(event) {

    if (event.key === 'Enter') {

        sendChatMessage();
    }
}

// ========================================
// SEND MESSAGE TO GEMINI API
// ========================================

async function sendMessage(text) {

    // ====================================
    // ADD USER MESSAGE
    // ====================================

    addMessageToUI(

        text,

        true,

        true
    );

    chatHistory.push({

        text: text,

        isUser: true
    });

    saveChatHistory();

    // ====================================
    // HIDE SUGGESTIONS
    // ====================================

    const suggestions =
        document.getElementById(
            'chatbot-suggestions'
        );

    if (suggestions) {

        suggestions.style.display =
            'none';
    }

    // ====================================
    // SHOW TYPING
    // ====================================

    showTypingIndicator();

    try {

        // ====================================
        // API CALL
        // ====================================

        const response = await fetch(

            `${BASE_URL}/chat`,

            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    message: text
                })
            }
        );

        const data =
            await response.json();

        hideTypingIndicator();

        // ====================================
        // SHOW BOT RESPONSE
        // ====================================

        addMessageToUI(

            data.reply,

            false,

            true
        );

        chatHistory.push({

            text: data.reply,

            isUser: false
        });

        saveChatHistory();
    }

    catch(error) {

        console.error(error);

        hideTypingIndicator();

        addMessageToUI(

            "Server error. EyeBot AI is currently unavailable.",

            false,

            true
        );
    }
}

// ========================================
// ADD MESSAGE TO UI
// ========================================

function addMessageToUI(

    text,

    isUser,

    scroll = true

) {

    const messagesContainer =
        document.getElementById(
            'chatbot-messages'
        );

    const time =
        new Date().toLocaleTimeString(
            [],
            {
                hour: '2-digit',
                minute: '2-digit'
            }
        );

    const messageDiv =
        document.createElement('div');

    messageDiv.className =
        `message ${isUser ? 'user' : 'bot'}`;

    messageDiv.innerHTML = `

        <div class="message-avatar">

            <i class="fas ${

                isUser
                ? 'fa-user'
                : 'fa-robot'

            }"></i>

        </div>

        <div class="message-content">

            <p>${text}</p>

            <span class="message-time">

                ${time}

            </span>

        </div>
    `;

    messagesContainer.appendChild(
        messageDiv
    );

    if (scroll) {

        messagesContainer.scrollTop =

            messagesContainer.scrollHeight;
    }
}

// ========================================
// SHOW TYPING
// ========================================

function showTypingIndicator() {

    const messagesContainer =
        document.getElementById(
            'chatbot-messages'
        );

    const typingDiv =
        document.createElement('div');

    typingDiv.className =
        'message bot typing-message';

    typingDiv.innerHTML = `

        <div class="message-avatar">

            <i class="fas fa-robot"></i>

        </div>

        <div class="message-content">

            <div class="typing-indicator">

                <span></span>
                <span></span>
                <span></span>

            </div>

            <span class="message-time">

                EyeBot AI is typing...

            </span>

        </div>
    `;

    messagesContainer.appendChild(
        typingDiv
    );

    messagesContainer.scrollTop =

        messagesContainer.scrollHeight;
}

// ========================================
// HIDE TYPING
// ========================================

function hideTypingIndicator() {

    const typingMessage =
        document.querySelector(
            '.typing-message'
        );

    if (typingMessage) {

        typingMessage.remove();
    }
}


let emailVerified = false;

async function sendOTP() {

    const email = document.getElementById(
        "reg-email"
    ).value;

    if (!email) {

        alert("Enter email first");

        return;
    }

    const response = await fetch(

        `${BASE_URL}/send-otp?email=${email}`,

        {
            method: "POST"
        }
    );

    const data = await response.json();

    if (response.ok) {

        document.getElementById(
            "otp-modal"
        ).classList.add("active");

        document.getElementById(
            "otp-email"
        ).value = email;

        alert("OTP sent successfully");
    }

    else {

        alert(data.detail);
    }
}
// ========================================
// CLICK OUTSIDE
// ========================================

document.addEventListener(

    'click',

    function(e) {

        if (

            !e.target.closest(
                '.chatbot-container'
            )

        ) {

            // Keep chatbot open
        }
    }
);



function showModal(modalId, title, message) {

    const modal = document.getElementById(modalId);

    if (!modal) return;

    modal.classList.add('active');

    if (modalId === 'success-modal') {

        document.getElementById(
            'success-title'
        ).textContent = title;

        document.getElementById(
            'success-message'
        ).textContent = message;
    }

    if (modalId === 'error-modal') {

        document.getElementById(
            'error-title'
        ).textContent = title;

        document.getElementById(
            'error-message'
        ).textContent = message;
    }
}

function closeModal(modalId) {

    document.getElementById(
        modalId
    ).classList.remove('active');
}

// ========================================
// INIT
// ========================================

console.log(

    'EyeBot AI Initialized'
);


document.getElementById(
    "email-notifications"
).addEventListener(

    "change",

    saveNotificationSettings
);

document.getElementById(
    "high-risk-alerts"
).addEventListener(

    "change",

    saveNotificationSettings
);

document.getElementById(
    "weekly-reports"
).addEventListener(

    "change",

    saveNotificationSettings
);