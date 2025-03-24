function submitPhoneNumber() {
    const phoneNumber = document.getElementById('phoneNumber').value.trim();
    
    // Save the phone number in session storage (even if it's empty)
    sessionStorage.setItem('phoneNumber', phoneNumber);

    // Redirect to the voting page
    window.location.href = 'index.html';
}