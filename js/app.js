'use strict';

import images from './gallery-items.js';

const jsGallery = document.querySelector('.js-gallery');
const jsLightbox = document.querySelector('.js-lightbox');
const lightboxImage = document.querySelector('.lightbox__image');

// Устанавливаем слушатель на блок галереи для определения картинки по которой кликнули
jsGallery.addEventListener('click', e => {
	e.preventDefault();

	// Проверка на клик по картинке. Если "промазал" дальнейшие действия не происходят
	if (e.target === e.currentTarget) {
		return;
	}
	// Собираем src и alt текущей картинки, вешаем класс модалки, подменяем базовые атрибуты на новые с текущей картинки
	const url = e.target.dataset.source;
	const alt = e.target.getAttribute('alt');
	jsLightbox.classList.add('is-open');
	lightboxImage.setAttribute('src', `${url}`);
	lightboxImage.setAttribute('alt', `${alt}`);

	// Устанавливаем слушатель на window для отслеживания нажатия клавиши. В callback лежит ссылка на функцию проверки нажатых клавиш
	window.addEventListener('keydown', handleKeyPress);

	// Устанавливаем слушатель на модалку для отлова клика по кнопке закрытия окна или на overlay
	jsLightbox.addEventListener('click', e => {
		// "Поймали" кнопку - закрыли модалку
		if (e.target.tagName === 'BUTTON') {
			closeModalWindow(jsLightbox, lightboxImage);
		}
		// "Поймали" overlay - закрыли модалку
		if (e.target.parentNode === e.currentTarget) {
			closeModalWindow(jsLightbox, lightboxImage);
		}
	});
});

// Функция для закрытия окна модалки. Получает в параметры обертку модалки, удаляет класс, очищает аттрибуты src и alt у картинки
function closeModalWindow(modalWrap, modalImg) {
	modalWrap.classList.remove('is-open');
	modalImg.removeAttribute('src');
	modalImg.removeAttribute('alt');

	// Если вызвали функцию закрытия модалки, то снимаем слушатель с нажатия клавиш
	window.removeEventListener('keydown', handleKeyPress);
}

// Функция проверки нажатия клавиш. Получает событие, проверяет свойство на нажатие нужных клавиш
function handleKeyPress(e) {
	// Если нажата клавиша Escape - вызываем функцию закрытия модалки
	if (e.code === 'Escape') {
		closeModalWindow(jsLightbox, lightboxImage);
	}
	// Если нажали клавиши вправо или влево, создает з объектов картинок массивы src и alt, получает код нажатой клавиши,
	// вызывает функцию перелистывания картинок с аргументами: массив src, массив alt, код клавиши, текущую картинку модалки
	if (e.code === 'ArrowRight' || e.code === 'ArrowLeft') {
		const imagesArray = images.map(image => image.original);
		const altsArray = images.map(image => image.description);
		const pressedKey = e.code;
		moveModalImage(imagesArray, altsArray, pressedKey, lightboxImage);
	}

	return;
}

// Магическая функция перелистывания картинок :)
function moveModalImage(imagesArray, altsArray, pressedKey, modalImg) {
	//Получаем индексы src и alt текущей картинки
	let currentImageIdx = imagesArray.indexOf(modalImg.getAttribute('src'));
	let currentAltIdx = altsArray.indexOf(modalImg.getAttribute('alt'));

	// Если была нажата клавиша вправо, то делаем проверку на текущую позицию активной картинки
	// Если текущая позиция картинки равна последнему элементу массива, то следующей позицией прокрутки будет первый элемент (бесконечная прокрутна)
	if (pressedKey === 'ArrowRight') {
		if (currentImageIdx < imagesArray.length - 1) {
			currentImageIdx += 1;
			currentAltIdx += 1;
		} else {
			currentImageIdx = 0;
			currentAltIdx = 0;
		}
	}

	// Аналогично прокрутке вправо, только тут влево.
	// Если текущая позиция картинки равна первому элементу массива, то следующей позицией прокрутки будет последний элемент
	if (pressedKey === 'ArrowLeft') {
		if (currentImageIdx > 0) {
			currentImageIdx -= 1;
			currentAltIdx -= 1;
		} else {
			currentImageIdx = imagesArray.length - 1;
			currentAltIdx = altsArray.length - 1;
		}
	}

	// Подмена текущих атрибутов на новые с учетом результата прокрутки
	modalImg.setAttribute('src', `${imagesArray[currentImageIdx]}`);
	modalImg.setAttribute('alt', `${altsArray[currentAltIdx]}`);
}

// Создаем разметку всех элементов галереи и рендерим их в блоке gallery
const markup = createGalleryList(images);
jsGallery.insertAdjacentHTML('afterbegin', markup);

// Функция для создания всей разметки галереи по шаблону одного элемента
function createGalleryList(listOfImages) {
	return listOfImages.map(item => createGalleryItemMarkup(item)).join('');
}

// Функция для создания одного элемента галереи
function createGalleryItemMarkup({ preview, original, description }) {
	const listItemMarkup = `
    <li class="gallery__item">
    <a
      class="gallery__link"
      href="${original}"
    >
      <img
        class="gallery__image"
        src="${preview}"
        data-source="${original}"
        alt="${description}"/>
    </a>
  </li>`;

	return listItemMarkup;
}
