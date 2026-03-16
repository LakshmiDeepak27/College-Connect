async function run() {
    try {
        const rand = Math.floor(Math.random() * 10000);
        const email = `testuser${rand}@example.com`;
        const regRes = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                username: `testuser${rand}`,
                email: email,
                password: 'password123',
                mobile: `910000${rand}`,
                agreeToTerms: true
            })
        });
        console.log("Registration:", await regRes.text());

        const loginRes = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                email: email,
                password: 'password123'
            })
        });
        const loginData = await loginRes.json();
        console.log("Login:", loginData);
        const token = loginData.token;

        if (!token) return;

        const profileRes = await fetch('http://localhost:5000/api/user/profile', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const profileData = await profileRes.json();
        console.log("PROFILE:", profileData);
    } catch(e) { console.error(e); }
}
run();
