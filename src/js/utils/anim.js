// Функции сглаживания
const easings = {
  linear: t => t,
  easeInQuad: t => t * t,
  easeOutQuad: t => t * (2 - t),
  easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  // Добавь другие easing-функции по необходимости
};

/**
 * Анимирует значение от 0 до 1 в течение заданного времени.
 * @param {Function} callback - Функция обратного вызова, которая вызывается при каждом тике анимации.
 * @param {Function} finish - Вызовется после окончания анимации.
 * @param {number} duration - Продолжительность анимации в миллисекундах.
 * @param {string} easingName - Название функции сглаживания.
 * @return {Function} Функция, которая прерывает выполнение анимации.
 */
export function anim (callback, finish, duration, easingName = 'linear') {
  const easingFunction = easings[easingName];

  if (!easingFunction) {
    throw new Error(`Easing function "${ easingName }" is not defined.`);
  }

  let startTime;
  let requestId;

  const loop = (currentTime) => {
    if (!startTime) startTime = currentTime;
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    callback(easingFunction(progress));

    if (progress < 1) {
      requestId = requestAnimationFrame(loop);
    }

    if(progress >= 1) {
      finish();
    }
  };

  requestId = requestAnimationFrame(loop);

  // Функция для остановки анимации
  return () => cancelAnimationFrame(requestId);
}

// Пример использования:
// const cancel = animate(progress => {
//   console.log(progress); // progress будет меняться от 0 до 1 в течение 2000 мс с easeInOutQuad
// }, 2000, 'easeInOutQuad');