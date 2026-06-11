const form = document.getElementById("pilot-form");
const submit = document.getElementById("pilot-submit");
const success = document.getElementById("pilot-success");
const error = document.getElementById("pilot-error");
const customSelects = document.querySelectorAll("[data-required-select]");
const phoneInputField = document.getElementById("phone_number");

const API_URL = window.location.hostname === 'localhost'
              || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:8000'
    : 'https://api.counterlabs.ai';

customSelects.forEach((select) => {
  const input = select.querySelector("input");
  const trigger = select.querySelector(".select-trigger");
  const options = select.querySelectorAll(".select-option");
  const placeholder = trigger.textContent;

  trigger.dataset.placeholder = placeholder;

  trigger.addEventListener("click", () => {
    const isOpen = select.classList.contains("open");

    customSelects.forEach((item) => {
      item.classList.remove("open");
      item.querySelector(".select-trigger").setAttribute("aria-expanded", "false");
    });

    select.classList.toggle("open", !isOpen);
    trigger.setAttribute("aria-expanded", String(!isOpen));
  });

  options.forEach((option) => {
    option.addEventListener("click", () => {
      input.value = option.dataset.value;
      trigger.textContent = option.textContent;
      select.classList.remove("open", "invalid");
      trigger.setAttribute("aria-expanded", "false");

      options.forEach((item) => item.classList.remove("selected"));
      option.classList.add("selected");
    });
  });
});

document.addEventListener("click", (event) => {
  if (event.target.closest(".custom-select")) return;

  customSelects.forEach((select) => {
    select.classList.remove("open");
    select.querySelector(".select-trigger").setAttribute("aria-expanded", "false");
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;

  customSelects.forEach((select) => {
    select.classList.remove("open");
    select.querySelector(".select-trigger").setAttribute("aria-expanded", "false");
  });
});

function validateCustomSelects() {
  let isValid = true;

  customSelects.forEach((select) => {
    const input = select.querySelector("input");
    const missing = !input.value;

    select.classList.toggle("invalid", missing);
    if (missing) isValid = false;
  });

  return isValid;
}

function resetCustomSelects() {
  customSelects.forEach((select) => {
    const input = select.querySelector("input");
    const trigger = select.querySelector(".select-trigger");

    input.value = "";
    trigger.textContent = trigger.dataset.placeholder;
    trigger.setAttribute("aria-expanded", "false");
    select.classList.remove("open", "invalid");
    select.querySelectorAll(".select-option").forEach((option) => {
      option.classList.remove("selected");
    });
  });
}

if (phoneInputField && window.intlTelInput) {
  window.intlTelInput(phoneInputField, {
    utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
  });
}

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!validateCustomSelects()) return;

    success.style.display = "none";
    error.style.display = "none";
    submit.disabled = true;
    submit.textContent = "Sending...";

    const formData = new FormData(form);
    const payload = {
      full_name: formData.get("full_name"),
      email: formData.get("email"),
      phone_number: formData.get("phone_number") || null,
      shop_location: formData.get("shop_location"),
      shop_type: formData.get("shop_type"),
      camera_count: formData.get("camera_count"),
      challenges: formData.getAll("challenges"),
    };

    try {
      const response = await fetch(`${API_URL}/api/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      form.reset();
      resetCustomSelects();
      success.style.display = "block";
    } catch (err) {
      console.error("Submission error:", err);
      error.style.display = "block";
    } finally {
      submit.disabled = false;
      submit.textContent = "Request early access →";
    }
  });
}
