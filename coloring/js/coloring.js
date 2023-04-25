/*
LAYOUT:
  Instructions Modal>
  Event Listeners>
  Functions:
    Fetch Pixabay Images>
    Display Random Selection>
    Display Selected Image>
    Color Oriented Functions:
      Get color>
      Set color>
      Compare color>
      Flood Fill
*/

///////////////////INSTRUCTIONS MODAL///////////////////////
// Show the instructions modal when the page loads
document.addEventListener("DOMContentLoaded", () => {
  const instructionsModal = document.getElementById("instructionsModal");
  instructionsModal.style.display = "block";
  function loadReadme() {
    fetch("readme.txt")
      .then((response) => response.text())
      .then((data) => {
        document.getElementById("readmeContent").textContent = data;
      });
  }
  loadReadme();
});

// Close the instructions modal when the close button is clicked
document.querySelector(".close").addEventListener("click", () => {
  const instructionsModal = document.getElementById("instructionsModal");
  instructionsModal.style.display = "none";
});

// Close the instructions modal when the load image button is clicked
document.getElementById("load").addEventListener("click", () => {
  const instructionsModal = document.getElementById("instructionsModal");
  // Add your logic to load the saved image here
  // instructionsModal.style.display = savedImage;
  instructionsModal.style.display = "none";
});

document.getElementById("getAPIButton").addEventListener("click", () => {
  window.open("https://pixabay.com/api/docs", "_blank");
});

document.getElementById("haveAPIButton").addEventListener("click", () => {
  const inputContainer = document.getElementById("inputContainer");
  inputContainer.style.display = "flex";
});
//store api to use in refresh...probably insecure.
let currentApiKey;

document.getElementById("fetchImage").addEventListener("submit", (e) => {
  e.preventDefault();
  const apiKey = document.getElementById("apiKey").value;
  fetchColoringPage(apiKey);
});

//refresh to refetch different images
document.getElementById("refreshButton").addEventListener("click", () => {
  fetchColoringPage(currentApiKey);
});

//save
document.getElementById("save").addEventListener("click", () => {
  localStorage.setItem("savedImage", image.src);
});

//load
document.getElementById("load").addEventListener("click", () => {
  const savedImage = localStorage.getItem("savedImage");
  if (savedImage) {
    image.src = savedImage;
  }
});

//download
document.getElementById("download").addEventListener("click", () => {
  const link = document.createElement("a");
  link.href = image.src;
  link.download = "image.png";
  link.click();
});
//used in undo/redo by setting image state to a list.
const history = [];
let historyPointer = -1;
let maxHistory = 20; // The maximum number of history states to store.

//undo
document.getElementById("undo").addEventListener("click", () => {
  if (historyPointer > 0) {
    historyPointer--;
    image.src = history[historyPointer];
  }
});

//redo
document.getElementById("redo").addEventListener("click", () => {
  if (historyPointer < history.length - 1) {
    historyPointer++;
    image.src = history[historyPointer];
  }
});

//zoom In
let zoomLevel = 1;
document.getElementById("zoomIn").addEventListener("click", () => {
  zoomLevel += 0.1;
  imageWrapper.style.transform = `scale(${zoomLevel})`;
});

//zoom Out
document.getElementById("zoomOut").addEventListener("click", () => {
  zoomLevel -= 0.1;
  if (zoomLevel < 0.1) {
    zoomLevel = 0.1;
  }
  imageWrapper.style.transform = `scale(${zoomLevel})`;
});

//event listener for fetch button
const fetchImageButton = document.getElementById("fetchImage");
fetchImageButton.addEventListener("click", () => {
  const apiKey = document.getElementById("apiKey").value;
  if (apiKey) {
    const instructionsModal = document.getElementById("instructionsModal");
    instructionsModal.style.display = "none";
    fetchColoringPage(apiKey);
  } else {
    alert("Please enter a valid Pixabay API key.");
  }
});

//save to local
function savePage() {
  const canvasData = canvas.toDataURL();
  localStorage.setItem("coloringGameProgress", canvasData);
}
//load from local
function loadPage() {
  const savedData = localStorage.getItem("coloringGameProgress");
  if (savedData) {
    const savedImage = new Image();
    savedImage.src = savedData;
    savedImage.onload = () => {
      ctx.drawImage(savedImage, 0, 0, canvas.width, canvas.height);
    };
  }
}

function fetchColoringPage(apiKey) {
  currentApiKey = apiKey;
  //api query of "coloring page" with 200 results returned.
  fetch(`https://pixabay.com/api/?key=${apiKey}&q=coloring+page&per_page=200`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Invalid API key or API request error");
      }
      return response.json();
    })
    .then((data) => {
      // console.log(data);
      if (data.hits.length > 0) {
        //randomize the images to add to selection modal and display them
        const randomImages = getRandomImages(data.hits, 10);
        displayImageSelection(randomImages);
      } else {
        alert("No images found. Please try again.");
      }
    })
    .catch((error) => {
      console.error("Error fetching image:", error);
      alert("Error fetching image. Please check your API key and try again.");
    });
  return apiKey;
}
//returns an array of images
function getRandomImages(hits, numImages) {
  const randomIndices = new Set();
  const maxIndex = hits.length - 1;
  while (randomIndices.size < numImages) {
    const randomIndex = Math.floor(Math.random() * (maxIndex + 1));
    randomIndices.add(randomIndex);
  }
  return Array.from(randomIndices).map((index) => hits[index]);
}

function displayImageSelection(images) {
  const imageGrid = document.getElementById("imageGrid");
  const modal = document.getElementById("imageSelectionModal");
  const colorButton = document.getElementById("colorButton");
  const refreshButton = document.getElementById("refreshButton");

  //clear the current images in the grid, useful in refreshing
  imageGrid.innerHTML = "";

  images.forEach((image) => {
    const imageDiv = document.createElement("div");
    imageDiv.className = "imageOption";
    imageDiv.style.backgroundImage = `url(${image.largeImageURL})`;
    imageDiv.dataset.largeImageUrl = image.largeImageURL;

    imageDiv.addEventListener("click", () => {
      document
        .querySelectorAll(".imageOption.selected")
        .forEach((selectedImage) => {
          selectedImage.classList.remove("selected");
        });

      imageDiv.classList.add("selected");
      colorButton.disabled = false;
      refreshButton.disabled = false;
    });

    imageGrid.appendChild(imageDiv);
  });
  modal.style.display = "block";
}

//color (or start) button event listener
const colorButton = document.getElementById("colorButton");
colorButton.addEventListener("click", () => {
  const modal = document.getElementById("imageSelectionModal");
  const selectedImage = document.querySelector(".imageOption.selected");
  if (selectedImage) {
    const imageUrl = selectedImage.dataset.largeImageUrl;
    modal.style.display = "none";
    displayImage(imageUrl);
  }
});

function displayImage(imageUrl) {
  return new Promise((resolve, reject) => {
    const imageContainer = document.getElementById("imageContainer");
    const imageWrapper = document.getElementById("imageWrapper");
    const image = imageContainer.querySelector("img");

    //so cross-origin policys are for security. These three statements are so that we can modify a fetched piece of data, the image.
    const corsProxyUrl = "https://api.allorigins.win/raw?url=";
    image.src = corsProxyUrl + imageUrl;
    image.crossOrigin = "anonymous"; // Add this line to avoid cross-origin issues

    image.onload = () => {
      //maintain aspect ratio while fitting the image vertically
      const aspectRatio = image.naturalWidth / image.naturalHeight;
      const containerHeight = imageContainer.clientHeight;
      image.height = containerHeight;
      image.width = containerHeight * aspectRatio;
      imageWrapper.style.width = `${image.width}px`;
      imageWrapper.style.height = `${image.height}px`;

      resolve(); //resolve the promise when image loads
    };

    image.onerror = (error) => {
      reject(error); //reject the promise if errors
    };
  });
}

//////////COLOR ORIENTED FUNCTIONS//////////
const colorSelection = document.getElementById("colorSelection");
const colorOption = document.querySelector(".colorOption");
const recentColors = document.getElementById("recentColors");
const recentColorsArray = [];

function getColorAtPoint(x, y) {
  //This creates an invisible canvas layover of the rightpanel color selection rectangle. The values of colors match the visible panel.

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = colorSelection.clientWidth;
  canvas.height = colorSelection.clientHeight;

  const gradientCSS = window.getComputedStyle(colorSelection).backgroundImage;
  const colorStops = gradientCSS.match(/rgb\([^)]+\)/g); //pulling color from .getComputedStyle (since colors in rect are a style element)
  const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);

  colorStops.forEach((color, index) => {
    gradient.addColorStop(index / (colorStops.length - 1), color);
  });

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const imageData = ctx.getImageData(x, y, 1, 1).data;
  const rgbaColor = `rgba(${imageData[0]}, ${imageData[1]}, ${imageData[2]}, ${
    imageData[3] / 255
  })`;

  return rgbaColor;
}

//preparing to add to recent and current colors
colorSelection.addEventListener("mousedown", (event) => {
  const x = event.clientX - colorSelection.getBoundingClientRect().left;
  const y = event.clientY - colorSelection.getBoundingClientRect().top;

  const pickedColorValue = getColorAtPoint(x, y);
  const pickedColor = document.createElement("div");

  pickedColor.style.width = "100px";
  pickedColor.style.height = "100px";
  pickedColor.style.borderRadius = "50%";
  pickedColor.style.position = "absolute";
  pickedColor.style.top = y - 50 + "px";
  pickedColor.style.left = x - 50 + "px";
  pickedColor.style.zIndex = "10";
  pickedColor.style.backgroundColor = pickedColorValue;

  colorSelection.appendChild(pickedColor);
});

colorSelection.addEventListener("mouseup", (event) => {
  const pickedColor = colorSelection.querySelector("div:nth-child(2)");
  if (pickedColor) {
    const pickedColorValue = pickedColor.style.backgroundColor;
    colorSelection.removeChild(pickedColor);

    addRecentColor(pickedColorValue);
  }
});

recentColors.addEventListener("click", selectRecentColor);

function selectRecentColor(event) {
  const clickedColor = event.target;

  if (clickedColor.classList.contains("recentColor")) {
    recentColorsArray.splice(recentColorsArray.indexOf(clickedColor), 1);
    addRecentColor(clickedColor.style.backgroundColor);
  }
}

const rootStyle = document.documentElement.style;
const colorPickerStyle = document.createElement("style");

document.head.appendChild(colorPickerStyle);

function addRecentColor(color) {
  const recentColor = document.createElement("div");
  recentColor.className = "recentColor";
  recentColor.style.backgroundColor = color;

  recentColorsArray.unshift(recentColor);

  if (recentColorsArray.length > 8) {
    recentColorsArray.pop();
  }
  recentColors.innerHTML = "";
  recentColorsArray.forEach((colorDiv) => {
    recentColors.appendChild(colorDiv);
  });

  updateCurrentColor();
}

function updateCurrentColor() {
  const currentColor = document.getElementById("currentColor");
  const lastColor = recentColorsArray[0];

  let rgbaValues;
  if (lastColor) {
    currentColor.style.backgroundColor = lastColor.style.backgroundColor;

    //RGB values of the selected color
    const rgbaString = lastColor.style.backgroundColor;
    // console.log(
    //   "rgbaString",
    //   rgbaString,
    //   "rgbaSubstring: ",
    //   rgbaString.substring(4, rgbaString.length - 1)
    // );
    rgbaValues = rgbaString
      .substring(4, rgbaString.length - 1)
      .split(", ")
      .map(Number);
  } else {
    currentColor.style.backgroundColor = "transparent";
    rgbaValues = [0, 0, 0, 0]; //it does return an alpha value here, but it is undefined when pulled from style elements.
  }
  return rgbaValues;
}

//////////////FLOOD FILL, QUEUE BASED///////////////////
//The basis of a queue based flood fill is take one pixel at x,y, check it, color it if necessary, and go to its neighbors.
//Add the checked pixels to a list of visited places, so we don't hit that same pixel.
//If we hit black, or something relative to black, aka 'blackISH', don't fill that, and don't check its neighbors.
//Once the queued elements are searched, pop them out and repeat with the fresh queue.
//This method prevents a stack overflow from happening if a recursive (fill within a fill) method is used.
const image = document.querySelector("#imageContainer img");

function floodFill(x, y) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = image.width;
  canvas.height = image.height;

  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  function isBlackish(color) {
    if (
      (parseInt(color[0]) < 170 &&
        parseInt(color[1]) < 170 &&
        parseInt(color[2]) < 170 &&
        parseInt(color[3]) > 170) ||
      (parseInt(color[0]) < 1 &&
        parseInt(color[1]) < 1 &&
        parseInt(color[2]) < 1 &&
        parseInt(color[3]) < 1) ||
      (parseInt(color[0]) === 0 &&
        parseInt(color[1]) === 0 &&
        parseInt(color[2]) === 0 &&
        parseInt(color[3]) > 40)
    ) {
      return true;
    } else {
      return false;
    }
  }

  function getColorAt(x, y) {
    const index = (y * canvas.width + x) * 4;
    return [
      imageData.data[index],
      imageData.data[index + 1],
      imageData.data[index + 2],
      imageData.data[index + 3],
    ];
  }

  function setColorAt(x, y, color) {
    const index = (y * canvas.width + x) * 4;
    imageData.data[index] = color[0];
    imageData.data[index + 1] = color[1];
    imageData.data[index + 2] = color[2];
    imageData.data[index + 3] = 255;
  }
  //for undo/redo, we have to save the image state
  if (historyPointer < history.length - 1) {
    history.splice(historyPointer + 1);
  }
  history.push(image.src);
  if (history.length > maxHistory) {
    history.shift();
  }
  historyPointer++;

  function performFloodFill(x, y, targetColor, replacementColor, visited) {
    const stack = [[x, y]];

    while (stack.length > 0) {
      const [currentX, currentY] = stack.pop();
      if (
        currentX < 0 ||
        currentY < 0 ||
        currentX >= canvas.width ||
        currentY >= canvas.height ||
        visited.has(`${currentX},${currentY}`)
      ) {
        continue;
      }

      const currentColor = getColorAt(currentX, currentY);

      if (isBlackish(currentColor)) {
        continue;
      }

      setColorAt(currentX, currentY, replacementColor);
      visited.add(`${currentX},${currentY}`);

      stack.push([currentX - 1, currentY]);
      stack.push([currentX + 1, currentY]);
      stack.push([currentX, currentY - 1]);
      stack.push([currentX, currentY + 1]);
    }
  }

  x = Math.round(x);
  y = Math.round(y);
  const targetColor = getColorAt(x, y);
  const replacementColor = updateCurrentColor();
  const visited = new Set();
  // console.log("target color: ", targetColor);

  if (!isBlackish(targetColor)) {
    performFloodFill(x, y, targetColor, replacementColor, visited);
  }

  ctx.putImageData(imageData, 0, 0);
  image.src = canvas.toDataURL();
}

const imageWrapper = document.getElementById("imageWrapper");

imageWrapper.addEventListener("click", (event) => {
  const rect = imageWrapper.getBoundingClientRect();
  const scaleX = image.width / rect.width;
  const scaleY = image.height / rect.height;

  const x = (event.clientX - rect.left) * scaleX;
  const y = (event.clientY - rect.top) * scaleY;
  floodFill(x, y);
});
