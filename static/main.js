window.onload = async () => {
  /**
   * TODO: Improve drag and drop to work lagless and as easily as possible
   * TODO: Add more client side sanitization/validation
   */

  let app = document.querySelector('div#app');
  let drag = document.querySelector('div#drag');
  let form = document.querySelector('form#form');
  let button = document.querySelector('label#upload');
  let input = button.querySelector('input#image');
  let buttonText = button.querySelector('span#text');
  let deleteButton = document.querySelector('a#delete');

  let dragging = 0;

  input.value = '';

  input.addEventListener('change', () => {
    if (input.files.length <= 0) return alert('Please select an image.');
    buttonText.innerHTML = 'Uploading...';
    app.classList.add('uploading');
    form.submit();
  });

  window.addEventListener('dragover', (event) => {
    drag.classList.add('active');
    event.dataTransfer.dropEffect = 'copy';
    event.preventDefault();
    event.stopPropagation();
    return false;
  });

  window.addEventListener('dragenter', (event) => {
    dragging++;
    event.preventDefault();
    event.stopPropagation();
    drag.classList.add('active');
    event.dataTransfer.dropEffect = 'copy';
    return false;
  });

  window.addEventListener('dragleave', (event) => {
    dragging--;
    if (dragging === 0) drag.classList.remove('active');
    event.stopPropagation();
    event.preventDefault();
    return false;
  });

  window.addEventListener('drop', (event) => {
    event.preventDefault();
    drag.classList.remove('active');
    if (!event.dataTransfer.files[0]) return;
    if (event.dataTransfer.files[0].size <= 0) return;
    input.files = event.dataTransfer.files;
    buttonText.innerHTML = 'Uploading...';
    button.classList.add('uploading');
    form.submit();
  });

  deleteButton.addEventListener('click', () => {
    let image = prompt('Input the ID of the image you wish to delete.');

    if (!image) return alert('Please input an ID.');

    return window.location.replace('https://kim.kieranhowland.cc/delete/' + image);
  });

  buttonText.innerHTML = 'Upload Image';
  app.classList.remove('uploading');
};