const form = document.getElementById('form')
const fullname = document.getElementById('fullname')
const email = document.getElementById('email')
const phone = document.getElementById('phone')
const address = document.getElementById('address')
const card = document.getElementById('card')
const expiry = document.getElementById('expiry')
const cvv = document.getElementById('cvv')

form.addEventListener('submit', function(e) {
    e.preventDefault()
    let valid = true

    if (!/^[A-Za-z\s]+$/.test(fullname.value)) {
        setError(fullname, "Enter valid name")
        valid = false
    } else {
        setSuccess(fullname)
    }

    if (!/^\S+@\S+\.\S+$/.test(email.value)) {
        setError(email, "Enter valid email")
        valid = false
    } else {
        setSuccess(email)
    }

    if (!/^\d{10,15}$/.test(phone.value)) {
        setError(phone, "Phone must be 10-15 digits")
        valid = false
    } else {
        setSuccess(phone)
    }

    if (address.value.trim() === "") {
        setError(address, "Address required")
        valid = false
    } else {
        setSuccess(address)
    }

    if (!/^\d{16}$/.test(card.value)) {
        setError(card, "Card must be 16 digits")
        valid = false
    } else {
        setSuccess(card)
    }

    const current = new Date()
    const selected = new Date(expiry.value + "-01")
    if (expiry.value === "" || selected <= current) {
        setError(expiry, "Enter a future date")
        valid = false
    } else {
        setSuccess(expiry)
    }

    if (!/^\d{3}$/.test(cvv.value)) {
        setError(cvv, "CVV must be 3 digits")
        valid = false
    } else {
        setSuccess(cvv)
    }

    if (valid) {
        alert("Form submitted successfully!")
        form.reset()
        const controls = document.querySelectorAll('.form-control')
        controls.forEach(c => c.className = 'form-control')
    }
})

function setError(input, message) {
    const parent = input.parentElement
    parent.className = 'form-control error'
    parent.querySelector('small').textContent = message
}

function setSuccess(input) {
    const parent = input.parentElement
    parent.className = 'form-control success'
}
