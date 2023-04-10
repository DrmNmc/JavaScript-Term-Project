const gameButtons = document.querySelectorAll(".game-button");

gameButtons.forEach((button) => {
  const gameDescription = button.querySelector(".game-description");
  const gameTitle = button.querySelector(".game-title");
  const gameTitleText = gameTitle.textContent;
  const gameDescriptionText = gameDescription.textContent;

  button.addEventListener("mouseenter", () => {
    gameTitle.style.opacity = 0;
    gameDescription.style.opacity = 1;
  });

  button.addEventListener("mouseleave", () => {
    gameTitle.style.opacity = 1;
    gameDescription.style.opacity = 0;
  });

  button.addEventListener("click", () => {
    const gameName = button.dataset.game;
    window.location.href = `${gameName}/${gameName}.html`;
  });
});

const carouselItems = document.querySelectorAll(".carousel-item");
let currentCarouselItem = 0;

setInterval(() => {
  currentCarouselItem++;
  if (currentCarouselItem >= carouselItems.length) {
    currentCarouselItem = 0;
  }
  carouselItems.forEach((item) => {
    item.classList.remove("active");
  });
  carouselItems[currentCarouselItem].classList.add("active");
}, 3000);
