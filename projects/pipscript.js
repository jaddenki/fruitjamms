
document.addEventListener("DOMContentLoaded", function() {
  const textElement = document.getElementById("typing-text");
  const textToType = `page in progress :)`;

  let index = 0;
  let isTag = false;
  let text = '';

  function type() {
      if (index < textToType.length) {
          if (textToType.charAt(index) === '<') {
              isTag = true;
          }
          if (textToType.charAt(index) === '>') {
              isTag = false;
          }
          text += textToType.charAt(index);
          if (!isTag) {
              textElement.innerHTML = text;
          }
          index++;
          setTimeout(type, 100); 
      }
  }

  type();

  const oscillatingImage = document.getElementById('oscillating-image');
  const images = ['../img/mb_00000.png', '../img/mb_00001.png']; 
  let currentImageIndex = 0;

  function oscillateImages() {
      currentImageIndex = (currentImageIndex + 1) % images.length;
      oscillatingImage.src = images[currentImageIndex];
  }

  setInterval(oscillateImages, 800); 

});
