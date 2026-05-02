export const likeCard = (likeButton) => {
  likeButton.classList.toggle('card__like-button_is-active');
};

export const deleteCard = (cardElement) => {
  cardElement.remove();
};

const getTemplate = () => {
  return document
    .getElementById('card-template')
    .content.querySelector('.card')
    .cloneNode(true);
};

export const createCardElement = (
  data,
  { onPreviewPicture, onLikeIcon, onDeleteCard },
  currentUserId
) => {
  const cardElement = getTemplate();
  const likeButton = cardElement.querySelector('.card__like-button');
  const likeCountElement = cardElement.querySelector('.card__like-count');
  const deleteButton = cardElement.querySelector(
    '.card__control-button_type_delete'
  );
  const cardImage = cardElement.querySelector('.card__image');

  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardElement.querySelector('.card__title').textContent = data.name;

  if (likeCountElement) {
    likeCountElement.textContent = data.likes.length;
  }

  const isLiked = data.likes.some((like) => like._id === currentUserId);
  if (isLiked) {
    likeButton.classList.add('card__like-button_is-active');
  }

  likeButton.addEventListener('click', () => onLikeIcon(data._id, likeButton, cardElement));

  if (data.owner._id !== currentUserId) {
    deleteButton.remove();
  } else {
    deleteButton.addEventListener('click', () => onDeleteCard(data._id, cardElement));
  }

  cardImage.addEventListener('click', () => onPreviewPicture({ name: data.name, link: data.link }));

  return cardElement;
};

export const isCardLiked = (likeButton) => {
  return likeButton.classList.contains('card__like-button_is-active');
};

export const updateLikeStatus = (cardElement, updatedCardData, userId) => {
  const likeButton = cardElement.querySelector('.card__like-button');
  const likeCountElement = cardElement.querySelector('.card__like-count');
  
  const isLiked = updatedCardData.likes.some((user) => user._id === userId);
  
  if (isLiked) {
    likeButton.classList.add('card__like-button_is-active');
  } else {
    likeButton.classList.remove('card__like-button_is-active');
  }
  
  if (likeCountElement) {
    likeCountElement.textContent = updatedCardData.likes.length;
  }
}