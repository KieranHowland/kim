window.onload = () => {
  let drag = document.querySelector('div#drag');
  let form = document.querySelector('form#form');
  let button = document.querySelector('label#upload');
  let input = button.querySelector('input#image');
  let buttonText = button.querySelector('span#text');
  let buttonAccepted = button.querySelector('span#accepted');

  input.value = '';

  input.addEventListener('change', () => {
    if (input.files.length <= 0) return alert('Please select an image.');
    buttonText.innerHTML = 'Uploading...';
    button.classList.add('uploading');
    form.submit();
  });

  document.addEventListener('dragover', (event) => {
    event.preventDefault();
    event.stopPropagation();
    drag.classList.add('active');
    event.dataTransfer.dropEffect = 'copy';
  });

  document.addEventListener('dragexit', () => {
    console.log('Fired');
    drag.classList.remove('active');
  });

  document.addEventListener('drop', (event) => {
    event.preventDefault();
    drag.classList.remove('active');
    if (!event.dataTransfer.files[0]) return;
    if (!event.dataTransfer.files[0].size <= 0) return;
    if (!event.dataTransfer.files[0].type !== 'file') return;
    input.files = event.dataTransfer.files[0];
    buttonText.innerHTML = 'Uploading...';
    button.classList.add('uploading');
    form.submit();
  });
}