const API = "http://localhost:3000";
const token = localStorage.getItem("token");

/* TOKEN KONTROL */
if (!token) {
  window.location.href = "/login.html";
}

/* ÇIKIŞ */
function logout() {
  localStorage.removeItem("token");
  window.location.href = "/login.html";
}

/* PROFİL BİLGİLERİNİ ÇEK */
fetch(API + "/api/user/me", {
  headers: {
    Authorization: "Bearer " + token
  }
})
.then(res => {
  if (!res.ok) throw new Error("Yetkisiz");
  return res.json();
})
.then(user => {
  if (document.getElementById("email")) {
    document.getElementById("email").value = user.email || "";
  }
  if (document.getElementById("name")) {
    document.getElementById("name").value = user.name || "";
  }
  if (document.getElementById("surname")) {
    document.getElementById("surname").value = user.surname || "";
  }
  if (document.getElementById("phone")) {
    document.getElementById("phone").value = user.phone || "";
  }

  if (document.getElementById("allowMarketing")) {
    document.getElementById("allowMarketing").checked = !!user.allowMarketing;
  }
  if (document.getElementById("allowKvkk")) {
    document.getElementById("allowKvkk").checked = !!user.allowKvkk;
  }
})
.catch(() => logout());

/* KAYDET */
function saveProfile() {
  const data = {
    name: document.getElementById("name")?.value,
    surname: document.getElementById("surname")?.value,
    phone: document.getElementById("phone")?.value,
    allowMarketing: document.getElementById("allowMarketing")?.checked,
    allowKvkk: document.getElementById("allowKvkk")?.checked
  };

  fetch(API + "/api/user/me", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify(data)
  })
  .then(res => {
    if (!res.ok) throw new Error();
    alert("Bilgiler kaydedildi");
  })
  .catch(() => alert("Kaydedilemedi"));
}
