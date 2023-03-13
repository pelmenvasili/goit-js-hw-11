import Notiflix from "notiflix";
import axios from "axios";
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

const formRef = document.querySelector('.search-form');
const inputRef = document.querySelector('[name="searchQuery"]');
const galleryRef = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

const API_KEY = '34204317-8ae92d59a6bb5fdb3cbc534ec';
const BASE_URL = 'https://pixabay.com/api/';
  
const perPage = 40; 
const lightbox = new SimpleLightbox('.gallery a', {
  captionDelay: 250,
 captionsData: 'alt',
});

let currentPage = 1;
let currentHits = null;
let searchQuery = '';

async function fetchImages() {
  searchQuery = inputRef.value.trim();
  if (searchQuery === '') { return };
   const API_URL = `${BASE_URL}?key=${API_KEY}&q=${searchQuery}&image_type=photo&orientation=horizontal&safesearch=true&page=${currentPage}&per_page=${perPage}`;
  return response = await axios.get(API_URL).then(response => response.data);
}

async function onFormSubmit(event) {
  event.preventDefault();
  currentPage = 1;
  clearGallery();
  try {
    const response = await fetchImages();
    galleryRef.style.padding = "20px";
    currentHits = response.hits.length;
    if (response.totalHits > 40) {
      showLoadMoreBtn()
    } else {
      hideLoadMoreBtn()
    }
    if (response.totalHits > 0) {
      showSuccessMessage();
      clearGallery()
      renderImagesMarkup(response.hits);
      lightbox.refresh();
      const { height: cardHeight } = document
        .querySelector(".gallery")
        .firstElementChild.getBoundingClientRect();

      window.scrollBy({
        top: cardHeight * 2,
        behavior: "smooth",
      });
    }

    else if (response.totalHits === 0) {
      clearGallery();
      showFailureMessage();
      hideLoadMoreBtn();
    }
  } catch (error) {
    console.log(error);
  }
}

async function onLoadMoreBtnClick() {
  currentPage += 1;
  const response = await fetchImages();
  renderImagesMarkup(response.hits);
  lightbox.refresh();
  currentHits += response.hits.length;

  if (currentHits === response.totalHits) {
    hideLoadMoreBtn();
    showWarningMessage();
  } 
}

function renderImagesMarkup(images) {
  const markup = images.map(({ webformatURL, tags, largeImageURL, likes, views, comments, downloads }) => {
    return `<div class="photo-card">
              <a href="${largeImageURL}"><img src="${webformatURL}" alt="${tags}" loading="lazy" data-source="${largeImageURL}"/></a>
              <div class="info">
                <p class="info-item">
                  <b>Likes:</b> ${likes}
                </p>
                <p class="info-item">
                  <b>Views:</b> ${views}
                </p>
                <p class="info-item">
                  <b>Comments:</b> ${comments}
                </p>
                <p class="info-item">
                  <b>Downloads:</b> ${downloads}
                </p>
              </div>
            </div>`;
  }).join('');
  galleryRef.insertAdjacentHTML('beforeend', markup);
}

function clearGallery() {
  galleryRef.innerHTML = '';
}

function hideLoadMoreBtn() {
  loadMoreBtn.style.visibility = "hidden";
}

function showLoadMoreBtn() {
  loadMoreBtn.style.visibility = "visible";
}

hideLoadMoreBtn();

function showSuccessMessage() {
Notiflix.Notify.success(`Hooray! We found ${response.totalHits} images.`);
}

function showWarningMessage() {
   Notiflix.Notify.warning("We're sorry, but you've reached the end of search results.");
}

function showFailureMessage() {
   Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
}

formRef.addEventListener('submit', onFormSubmit);
loadMoreBtn.addEventListener('click', onLoadMoreBtnClick);