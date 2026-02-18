
async function checkAuth() {
    try {
        const providersRes = await fetch("http://localhost:3000/api/auth/providers");
        console.log("Providers Status:", providersRes.status);
        if (providersRes.ok) {
            console.log("Providers:", await providersRes.json());
        }

        const csrfRes = await fetch("http://localhost:3000/api/auth/csrf");
        console.log("CSRF Status:", csrfRes.status);
        if (csrfRes.ok) {
            console.log("CSRF Token:", await csrfRes.json());
        }

    } catch (err) {
        console.error("Error checking auth:", err);
    }
}

checkAuth();
