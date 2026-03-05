/*
  Файл index.js является точкой входа в наше приложение
  и только он должен содержать логику инициализации нашего приложения
  используя при этом импорты из других файлов

  Из index.js не допускается что то экспортировать
*/

import { createCardElement, deleteCard, likeCard } from './components/card.js';
import {
  openModalWindow,
  closeModalWindow,
  setCloseModalWindowEventListeners,
} from './components/modal.js';
import { enableValidation, clearValidation } from './components/validation.js';
import {
  changeLikeCardStatus,
  createCard,
  deleteCardRequest,
  getCardList,
  getUserInfo,
  setUserAvatar,
  setUserInfo,
} from "./components/api";

let currentUserId = '';

// DOM узлы
const placesWrap = document.querySelector('.places__list');
const profileFormModalWindow = document.querySelector('.popup_type_edit');
const profileForm = profileFormModalWindow.querySelector('.popup__form');
const profileTitleInput = profileForm.querySelector('.popup__input_type_name');
const profileDescriptionInput = profileForm.querySelector(
  '.popup__input_type_description'
);

const cardFormModalWindow = document.querySelector('.popup_type_new-card');
const cardForm = cardFormModalWindow.querySelector('.popup__form');
const cardNameInput = cardForm.querySelector('.popup__input_type_card-name');
const cardLinkInput = cardForm.querySelector('.popup__input_type_url');

const imageModalWindow = document.querySelector('.popup_type_image');
const imageElement = imageModalWindow.querySelector('.popup__image');
const imageCaption = imageModalWindow.querySelector('.popup__caption');

const openProfileFormButton = document.querySelector('.profile__edit-button');
const openCardFormButton = document.querySelector('.profile__add-button');

const profileTitle = document.querySelector('.profile__title');
const profileDescription = document.querySelector('.profile__description');
const profileAvatar = document.querySelector('.profile__image');

const avatarFormModalWindow = document.querySelector('.popup_type_edit-avatar');
const avatarForm = avatarFormModalWindow.querySelector('.popup__form');
const avatarInput = avatarForm.querySelector('.popup__input');

// Создание объекта с настройками валидации
const validationSettings = {
  formSelector: '.popup__form',
  inputSelector: '.popup__input',
  submitButtonSelector: '.popup__button',
  inactiveButtonClass: 'popup__button_disabled',
  inputErrorClass: 'popup__input_type_error',
  errorClass: 'popup__error_visible',
};

// включение валидации вызовом enableValidation
enableValidation(validationSettings);

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();

  const submitButton = profileForm.querySelector('.popup__button');
  const originalButtonText = submitButton.textContent;

  submitButton.textContent = 'Сохранение...';
  submitButton.disabled = true;

  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;

      closeModalWindow(profileFormModalWindow);
    }).catch((err) => {
      console.log(err);
    })
    .finally(() => {
      submitButton.textContent = originalButtonText;
      submitButton.disabled = false;
    });
};

const handleAvatarFromSubmit = (evt) => {
  evt.preventDefault();

  const submitButton = avatarForm.querySelector('.popup__button');
  const originalButtonText = submitButton.textContent;

  submitButton.textContent = 'Сохранение...';
  submitButton.disabled = true;

  setUserAvatar({
    avatar: avatarInput.value,
  })
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;

      closeModalWindow(avatarFormModalWindow);
    }).catch((err) => {
      console.log(err);
    })
    .finally(() => {
      submitButton.textContent = originalButtonText;
      submitButton.disabled = false;
    });
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();

  const submitButton = cardForm.querySelector('.popup__button');
  const originalButtonText = submitButton.textContent;

  submitButton.textContent = 'Создание...';
  submitButton.disabled = true;

  createCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  }).then((cardData) => {
    const newCard = createCardElement(
      cardData,
      {
        onPreviewPicture: handlePreviewPicture,
        onLikeIcon: handleLikeCard,
        onDeleteCard: handleDeleteCard,
      },
      currentUserId
    );

    if (cardData.owner._id !== currentUserId) {
      const deleteButton = newCard.querySelector('.card__control-button_type_delete');
      if (deleteButton) {
        deleteButton.remove();
      }
    }

    placesWrap.prepend(newCard);
    closeModalWindow(cardFormModalWindow);
    cardForm.reset();
  }).catch((err) => {
    console.log(err);
  })
    .finally(() => {
    submitButton.textContent = originalButtonText;
    submitButton.disabled = false;
  });
};

const handleDeleteCard = (cardId, cardElement) => {
  deleteCardRequest(cardId)
    .then(() => {
      deleteCard(cardElement);
    })
    .catch((err) => {
      console.log(err);
    });
};

const handleLikeCard = (cardId, likeButton, cardElemnt) => {
  const isLiked = likeButton.classList.contains('card__like-button_is-active');
  const likeCountElement = cardElemnt.querySelector('.card__like-count')

  changeLikeCardStatus(cardId, isLiked)
    .then((updateCard) => {
      likeButton.classList.toggle('card__like-button_is-active');

      if (likeCountElement) {
        likeCountElement.textContent = updateCard.likes.length;
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

// EventListeners
profileForm.addEventListener('submit', handleProfileFormSubmit);
cardForm.addEventListener('submit', handleCardFormSubmit);
avatarForm.addEventListener('submit', handleAvatarFromSubmit);

openProfileFormButton.addEventListener('click', () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;

  clearValidation(profileForm, validationSettings);
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener('click', () => {
  clearValidation(avatarForm, validationSettings);
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener('click', () => {
  clearValidation(cardForm, validationSettings);
  openModalWindow(cardFormModalWindow);
});

//настраиваем обработчики закрытия попапов
const allPopups = document.querySelectorAll('.popup');
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) => {
    currentUserId = userData._id;

    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;

    cards.forEach((card) => {
      const cardElement = createCardElement(card, {
        onPreviewPicture: handlePreviewPicture,
        onLikeIcon: handleLikeCard,
        onDeleteCard: handleDeleteCard
      }, currentUserId);

      if (card.owner._id !== currentUserId) {
        const deleteButton = cardElement.querySelector('.card__control-button_type_delete');
        if (deleteButton) {
          deleteButton.remove();
        }
      }

      placesWrap.append(cardElement);
    });
  }).catch((err) => {
    console.log(err);
  });