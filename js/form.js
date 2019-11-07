'use strict';

(function () {
  var ERROR_MISMATCH = 'Несоответствие количества комнат и гостей';
  var PRICE_MAX_VALUE = 1000000;

  var CritValue = {
    ROOM: 100,
    CAPACITY: 0
  };

  var TitleLength = {
    MIN: 30,
    MAX: 100
  };

  var ApartmentTypeMinValue = {
    PALACE: 10000,
    FLAT: 1000,
    HOUSE: 5000,
    BUNGALO: 0
  };

  var pinInitialCoord = {
    TOP: '375px',
    LEFT: '570px'
  };

  var adFormElement = document.querySelector('.ad-form');
  var adFormHeaderElement = adFormElement.querySelector('.ad-form-header');
  var adFormElements = adFormElement.querySelectorAll('.ad-form__element');
  var resetElement = adFormElement.querySelector('.ad-form__reset');
  var mapFiltersElement = window.elements.mapElement.querySelector('.map__filters');
  var mapFeaturesElements = mapFiltersElement.querySelectorAll('.map__features');
  var mapFiltersElements = mapFiltersElement.querySelectorAll('.map__filter');
  var capacityElement = adFormElement.querySelector('#capacity');
  var roomElement = adFormElement.querySelector('#room_number');
  var titleElement = adFormElement.querySelector('#title');
  var priceElement = adFormElement.querySelector('#price');
  var typeElement = adFormElement.querySelector('#type');
  var timeinElement = adFormElement.querySelector('#timein');
  var timeoutElement = adFormElement.querySelector('#timeout');
  var formAddressElement = adFormElement.querySelector('#address');
  var successTemplate = document.querySelector('#success').content.querySelector('.success');

  var addMainPinLocation = function (isInactive) {
    var mainPin = {
      width: parseFloat(getComputedStyle(window.elements.mainPinElement).width, 10),
      height: parseFloat(getComputedStyle(window.elements.mainPinElement).height, 10),
      pointerHeight: parseFloat(getComputedStyle(window.elements.mainPinElement, ':after').height, 10),
      getLeft: function () {
        return parseFloat(window.elements.mainPinElement.style.left, 10);
      },
      getTop: function () {
        return parseFloat(window.elements.mainPinElement.style.top, 10);
      }
    };

    var getPinLocationX = function () {
      return parseInt(mainPin.getLeft() + mainPin.width / 2, 10);
    };

    var getPinLocationY = function () {
      return parseInt(mainPin.getTop() + mainPin.height, 10);
    };

    var getPinActivelocationY = function () {
      return mainPin.getTop() + mainPin.height + mainPin.pointerHeight;
    };

    // Флаг для задания координат в неактивном состоянии
    if (isInactive) {
      formAddressElement.value = getPinLocationX() + ', ' + getPinLocationY();
      return;
    }

    formAddressElement.value = getPinLocationX() + ', ' + getPinActivelocationY();
  };

  var setActiveStatus = function (elements, status) {
    Array.from(elements).forEach(function (item) {
      item.disabled = status;
    });
  };

  // Изначальное состояние — форма деактивирована
  var deactivateForm = function () {
    adFormElement.classList.add('ad-form--disabled');
    adFormHeaderElement.disabled = true;
    setActiveStatus(adFormElements, true);
    mapFeaturesElements.disabled = true;
    setActiveStatus(mapFiltersElements, true);
    addMainPinLocation(true);
  };

  deactivateForm();

  // Валидация
  var clearMap = function () {
    var pinElements = window.elements.mapElement.querySelectorAll('.map__pin:not(.map__pin--main)');
    var cardElement = window.elements.mapElement.querySelector('.map__card');

    Array.from(pinElements).forEach(function (item) {
      item.remove();
    });

    if (cardElement) {
      cardElement.remove();
    }
  };

  var returnToInactive = function () {
    clearMap();
    window.elements.mainPinElement.style.top = pinInitialCoord.TOP;
    window.elements.mainPinElement.style.left = pinInitialCoord.LEFT;

    window.elements.mapElement.classList.add('map--faded');
    adFormElement.reset();
    deactivateForm();
    window.elements.mapfiltersElement.reset();
    window.utils.isRender = false;
  };

  var successHandler = function () {
    returnToInactive();

    var getSuccessOverlay = function () {
      return window.elements.mainElement.querySelector('.success');
    };

    if (!getSuccessOverlay()) {
      var successElement = successTemplate.cloneNode(true);

      window.elements.mainElement.appendChild(successElement);

      var successOverlay = getSuccessOverlay();

      var removeOverlay = function () {
        successOverlay.remove();
      };

      var overlayClickHandler = function () {
        removeOverlay();
      };

      var overlayKeydownHandler = function (evt) {
        if (evt.key === window.utils.key.ESCAPE) {
          removeOverlay();
          document.removeEventListener('keydown', overlayKeydownHandler);
        }
      };

      successOverlay.addEventListener('click', overlayClickHandler);
      document.addEventListener('keydown', overlayKeydownHandler);
    }
  };

  adFormElement.addEventListener('submit', function (evt) {
    var roomNumber = parseInt(roomElement.value, 10);
    var capacityNumber = parseInt(capacityElement.value, 10);
    var roomCrit = (roomNumber === CritValue.ROOM);
    var capacityCrit = (capacityNumber === CritValue.CAPACITY);
    var roomsFewer = (roomNumber < capacityNumber);

    if (roomsFewer || roomCrit && !capacityCrit || !roomCrit && capacityCrit) {
      capacityElement.setCustomValidity(ERROR_MISMATCH);
    } else {
      capacityElement.setCustomValidity('');
    }

    window.backend.send(new FormData(adFormElement), successHandler, window.backend.errorHandler);
    evt.preventDefault();
  });

  var changeAttribute = function (element, attribute, value) {
    element.setAttribute(attribute, value);
  };

  // var changeAttribute = function (element, attribute, value) {
  //   element[attribute] = value;
  // };

  var setPriceMin = function () {
    var getTypeValue = function () {
      return ApartmentTypeMinValue[typeElement.value.toUpperCase()];
    };

    var changePriceMin = function () {
      changeAttribute(priceElement, 'min', getTypeValue());
    };

    var typeChangeHandler = function () {
      changePriceMin();
      changeAttribute(priceElement, 'placeholder', getTypeValue());
    };

    changePriceMin();
    typeElement.addEventListener('change', typeChangeHandler);
  };

  var syncTimeFields = function () {
    timeinElement.addEventListener('change', function () {
      timeoutElement.value = timeinElement.value;
    });

    timeoutElement.addEventListener('change', function () {
      timeinElement.value = timeoutElement.value;
    });
  };

  changeAttribute(titleElement, 'required', true);
  changeAttribute(titleElement, 'minlength', TitleLength.MIN);
  changeAttribute(titleElement, 'maxlength', TitleLength.MAX);
  changeAttribute(priceElement, 'required', true);
  changeAttribute(priceElement, 'max', PRICE_MAX_VALUE);
  changeAttribute(formAddressElement, 'readonly', true);
  setPriceMin();
  syncTimeFields();

  var resetClickHadler = function () {
    returnToInactive();
  };

  var resetKeydownHandler = function (evt) {
    if (evt.key === window.utils.key.ENTER) {
      returnToInactive();
    }
  };

  resetElement.addEventListener('click', resetClickHadler);
  resetElement.addEventListener('keydown', resetKeydownHandler);

  window.form = {
    activateForm: function () {
      adFormElement.classList.remove('ad-form--disabled');
      adFormHeaderElement.disabled = false;
      setActiveStatus(adFormElements, false);
      mapFeaturesElements.disabled = false;
      setActiveStatus(mapFiltersElements, false);
      addMainPinLocation();
    },
    addMainPinLocation: addMainPinLocation,
    clearMap: clearMap,
  };
})();
