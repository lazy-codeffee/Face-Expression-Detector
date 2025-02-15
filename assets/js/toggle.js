const toggleButton = document.getElementById("toggleMode");
const body = document.body;

if (localStorage.getItem("dark-mode") === "enabled") {
    body.classList.add("dark-mode");
    toggleButton.innerText = "Light Mode";
}

toggleButton.addEventListener("click", () => {
    body.classList.toggle("dark-mode");

    if (body.classList.contains("dark-mode")) {
        toggleButton.innerText = "Light mode";
        localStorage.setItem("dark-mode", "enabled");
    } else {
        toggleButton.innerText = "Dark mode";
        localStorage.setItem("dark-mode", "disabled");
    }
});
