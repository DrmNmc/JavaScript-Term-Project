/*
TODO: 
1) functionality for fetch with user api, so create "Get a free pixabay API button" since new users won't have one...link this to pixabay account creation...do this in modal.
2) test load/save functionality
3) create color pallet selection tool for user from a pallet wheel.
4) fill color functionality (drawing will not be enabled, only fill)
5) zoom in/ zoom out functionality
8) undo/redo func
9) save/load/download button functionality
10) change color theme functionality that will override css colors
*/ 


const loadImageButton = document.getElementById("loadImage");
loadImageButton.addEventListener("click", () => {
  const apiKey = document.getElementById("apiKey").value;
  fetchColoringPage(apiKey);
});

function fetchColoringPage(apiKey) {
  //fetch image via pixabay api
  fetch(
    `https://pixabay.com/api/?key=${apiKey}&q=pattern%3A+coloring+page&image_type=illustration&orientation=vertical&per_page=1`
  )
    .then((response) => response.json())
    .then((data) => {
      const imageUrl = data.hits[0].largeImageURL;
      displayImage(imageUrl);
    })
    .catch((error) => {
      console.error("Error fetching image:", error);
    });
}

function displayImage(imageUrl) {
  const imageContainer = document.getElementById("imageContainer");
  //clear previous image if any exists
  imageContainer.innerHTML = "";

  const image = document.createElement("img");
  image.src = imageUrl;
  imageContainer.appendChild(image);
}

function savePage() {
  const canvasData = canvas.toDataURL(); //base64 image data from the canvas
  localStorage.setItem("coloringGameProgress", canvasData); //save to localStorage
}

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
