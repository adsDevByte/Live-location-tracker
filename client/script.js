const form = document.getElementById("loginForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value;

  const res = await fetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ username })
  });

  const data = await res.json();

  console.log("Login response:", data); // DEBUG

  if (data.token) {
    localStorage.setItem("token", data.token);

    window.location.href = "/app.html"; // ✅ redirect
  } else {
    alert("Login failed");
  }
});