console.log("My profile page is working!");

const messageButton = document.querySelector("#message-button");
const message = document.querySelector("#message");

messageButton.addEventListener("click", function () {
  message.textContent = "Thanks for visiting my profile!";
});
