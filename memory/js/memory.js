$(document).ready(function () {
  // modal functionality for readme.
  $(document).ready(function () {
    const modal = $("#readmeModal");
    const closeButton = $(".close");
    // parse text
    function loadReadme() {
      $.ajax({
        url: "./media/readme.txt",
        dataType: "text",
      }).done(function (data) {
        $("#readmeContent").text(data);
      });
    }

    function showModal() {
      modal.css("display", "block");
    }

    function closeModal() {
      modal.css("display", "none");
    }

    $("#readmeLink").on("click", function (event) {
      event.preventDefault();
      loadReadme();
      showModal();
    });

    closeButton.on("click", closeModal);

    // feature i like to close the modal when clicked anywhere outside of it.
    $(window).on("click", function (event) {
      if ($(event.target).is(modal)) {
        closeModal();
      }
    });
  });

  const grid = $(".grid");
  const livesDisplay = $(".lives");
  const roundDisplay = $(".round");
  const growl = new Audio("./media/growl.wav");
  const howl = new Audio("./media/howl.wav");
  const scream = new Audio("./media/scream.wav");
  const radio = new Audio("./media/scary.wav");
  radio.loop = true;
  radio.volume = 0.5;

  //   google is preventing auto play, so need element interaction to trigger loop.
  $("#startGameButton").on("click", function () {
    radio.play();
    $(this).hide();
    startRound();
  });

  let lives = 3;
  let round = 1;
  let correctOrder = [];
  let playerOrder = [];
  // maps the random order of the numbers within the current round.
  function generateRandomOrder(round) {
    const order = [];
    const maxNumber = 10;
    const numbers = Array.from({ length: round + 2 }, (_, i) => i + 1);

    while (order.length < round + 2) {
      const randomNumber = numbers[Math.floor(Math.random() * numbers.length)];

      if (!order.includes(randomNumber)) {
        order.push(randomNumber);
      }
    }
    return order;
  }

  //used to map the random order to the number of items in the grid.
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  /////////MAIN GAMEPLAY FUNCTIONALITY////////
  //creates the 5x5 grid, shuffles the items, maps the ordered numbers to the grid.
  function createGrid() {
    const usedNumbers = correctOrder.slice(0, round + 2);
    let gridItems = [];

    for (let i = 1; i <= 25; i++) {
      const gridItem = $("<div>").addClass("grid-item").attr("data-number", i);
      gridItems.push(gridItem);
    }

    // Shuffle the grid items
    gridItems = shuffleArray(gridItems);

    // Add the numbers to the shuffled grid items
    usedNumbers.forEach((number) => {
      const orderIndex = correctOrder.indexOf(number) + 1;
      const gridItem = gridItems.find(
        (item) => parseInt(item.attr("data-number"), 10) === number
      );
      if (gridItem) {
        gridItem.addClass("white").text(orderIndex);
      }
    });

    // Add the shuffled grid items to the grid
    gridItems.forEach((gridItem) => {
      grid.append(gridItem);
    });
  }

  function startRound() {
    grid.empty();
    livesDisplay.text(`Lives: ${lives}`);
    roundDisplay.text(`Round: ${round}`);

    correctOrder = generateRandomOrder(round);
    createGrid();

    setTimeout(() => {
      grid.find(".grid-item.white").each(function () {
        $(this).removeClass("white").addClass("red").text(""); //changing to red removes the numerical text.
      });

      playerOrder = [];
    }, 1000 + round * 500);
  }

  function handleGridItemClick() {
    const clickedNumber = parseInt($(this).attr("data-number"), 10);
    if (clickedNumber === correctOrder[playerOrder.length]) {
      $(this).removeClass("red").addClass("green");
      playerOrder.push(clickedNumber);

      if (playerOrder.length === correctOrder.length) {
        round++;
        if (round > 7) {
          alert("You won!");
          playAgain();
        } else {
          startRound();
        }
      }
    } else {
      lives--;
      if (lives <= 0) {
        jumpScare();
      } else {
        growl.volume = 0.25;
        growl.play();
        livesDisplay.text(`Lives: ${lives}`);
      }
    }
  }

  function resetGame() {
    lives = 3;
    round = 1;
    grid.empty();
    startRound();
  }

  function playAgain() {
    const shouldPlayAgain = confirm("Play again?");

    if (shouldPlayAgain) {
      resetGame();
    } else {
      window.location.href = "../interface.html";
    }
  }

  function jumpScare() {
    scream.play();
    const scaryFace = $(".scary-face");
    scaryFace.show();

    setTimeout(() => {
      scaryFace.hide();
      playAgain();
    }, 3000);
  }

  grid.on("click", ".grid-item.red", handleGridItemClick);
});
