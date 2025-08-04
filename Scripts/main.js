document.addEventListener("DOMContentLoaded", function () {
  const questions = document.querySelectorAll(".faq-question");

  questions.forEach((btn) => {
    btn.addEventListener("click", () => {
      const answer = btn.nextElementSibling;
      const isOpen = answer.style.display === "block";

      // Close all answers
      document.querySelectorAll(".faq-answer").forEach((el) => {
        el.style.display = "none";
      });

      // Toggle the clicked one
      answer.style.display = isOpen ? "none" : "block";
    });
  });
});
