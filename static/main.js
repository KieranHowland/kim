window.onload = () => {
  var cont = document.getElementById("drag-cont");
  var imgSlct = document.getElementById("imageSelect");
  var imgSlctTxt = document.getElementById("imageSelectText");
  var form = document.getElementById("form");
  imgSlct.value = "";
  imgSlct.addEventListener("change", () => {
    if (0 < imageSelect.files.length) {
      imgSlctTxt.innerHTML = "Uploading Image...";
      form.submit();
    }
  });
  document.addEventListener("dragover", () => {
    event.preventDefault();
    event.stopPropagation();
    cont.classList.add("drag-cont-active");
    event.dataTransfer.dropEffect = "copy";
  });
  document.addEventListener("dragleave", () => {
    cont.classList.remove("drag-cont-active");
  });
  document.addEventListener("drop", (event) => {
    event.preventDefault();
    cont.classList.remove("drag-cont-active");
    if (event.dataTransfer.files[0] && 0 < event.dataTransfer.files[0].size) {
      imgSlct.files = event.dataTransfer.files;
      imgSlctTxt.innerHTML = "Uploading Image...";
      form.submit();
    }
  });
}