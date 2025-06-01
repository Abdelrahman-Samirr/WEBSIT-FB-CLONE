const token = localStorage.getItem("token")
if(token){
    window.location.href = "/home-page/home.html"
}


const fName = document.querySelector('.fname')
const sName = document.querySelector('.sname')

// login & register page
const loginbtn = document.querySelector(".login__btn")
const passwordIcon = document.querySelector(".password__item i")
const loginForm = document.querySelector(".login__form")
const password = document.querySelector(".login__password")


password.addEventListener('input', function () {
    if (password.value.length > 0) {
        passwordIcon.style.display = "block"
    } else {
        passwordIcon.style.display = "none"
    }
})
passwordIcon.addEventListener('click', function () {
    if (password.type === 'password') {
        password.type = 'text'
        passwordIcon.classList.replace('fa-eye-slash', 'fa-eye')
    } else {
        password.type = 'password'
        passwordIcon.classList.replace('fa-eye', 'fa-eye-slash')
    }
})

// register part 
const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.com$/;

const createAccBtn = document.querySelector('.new-account__btn')
const registerPage = document.querySelector('.register-page')
const newEmail = document.querySelector('.new-email')
const newPassword = document.querySelector('.new-password')
const signUpBtn = document.querySelector('.sign-up__btn')
const registerForm = document.querySelector('.register__form')

createAccBtn.addEventListener('click', function (e) {
    e.preventDefault()
    loginPage.style.display = 'none'
    registerPage.style.display = 'block'
})

/////////////////

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    if (!regex.test(newEmail.value) || !fName.value) {
        alert("Invalid input. Please enter a valid email or First Name ")
        fName.value = '';
        sName.value = '';
        newEmail.value = '';
        newPassword.value = '';
        return
    }

    const registerData = {
        "name": fName.value + " " + sName.value,
        "email": newEmail.value,
        "password": newPassword.value
    }

    try {
        const response = await fetch("https://fb-clone-production.up.railway.app/auth/register", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(registerData)
        })

        if (!response.ok) throw new Error("Failed to create account");

        const data = await response.json();
        console.log("email created:", data);
        console.log(fName.value, sName.value)

    } catch (error) {
        console.error("Error to create account:", error);
    }
    fName.value = '';
    sName.value = '';
    newEmail.value = '';
    newPassword.value = '';

    loginPage.style.display = 'block'
    registerPage.style.display = 'none'
})
// login part ///
const loginInput = document.querySelector(".login__email")
const loginPage = document.querySelector('.login-page')


loginForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    if (!regex.test(loginInput.value)) {
        alert("Invalid input. Please enter a valid email or password")
        loginInput.value = ''
        password.value = ''
        return
    }

    // const fullName = fName.value + " " + sName.value;
    // localStorage.setItem("profileName", fullName);

    const loginData = {
        "email": loginInput.value,
        "password": password.value
    }
    try {
        const response = await fetch("https://fb-clone-production.up.railway.app/auth/login", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        })

        if (!response.ok) throw new Error("Failed to login account");

        const data = await response.json()
        console.log("email login:", data);

        localStorage.setItem("token", data.token)


        window.location.href = "/home-page/home.html"

        loginInput.value = ''
        password.value = ''


    } catch (error) {
        console.error("Error to login account:", error);
    }


})

// end login & register page//////

