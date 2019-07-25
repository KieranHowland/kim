window.onload = () => {
  /**
   * TODO: Improve drag and drop to work lagless and as easily as possible
   * TODO: Add more client side sanitization, validation
   */
  
  let drag = document.querySelector('div#drag');
  let form = document.querySelector('form#form');
  let button = document.querySelector('label#upload');
  let input = button.querySelector('input#image');
  let buttonText = button.querySelector('span#text');

  let dragging = 0;

  input.value = '';

  input.addEventListener('change', () => {
    if (input.files.length <= 0) return alert('Please select an image.');
    buttonText.innerHTML = 'Uploading...';
    button.classList.add('uploading');
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
}