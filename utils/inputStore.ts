// A lightweight global store for inputs to avoid React re-render overhead in the game loop
export const inputStore = {
  move: { x: 0, y: 0 }, // Normalized -1 to 1
  look: { x: 0, y: 0 }, // Mouse/Touch delta
  jump: false,
};

export const setupKeyboardListeners = () => {
  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.code) {
      case 'ArrowUp':
      case 'KeyW':
        inputStore.move.y = 1;
        break;
      case 'ArrowDown':
      case 'KeyS':
        inputStore.move.y = -1;
        break;
      case 'ArrowLeft':
      case 'KeyA':
        inputStore.move.x = -1;
        break;
      case 'ArrowRight':
      case 'KeyD':
        inputStore.move.x = 1;
        break;
      case 'Space':
        inputStore.jump = true;
        break;
    }
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    switch (e.code) {
      case 'ArrowUp':
      case 'KeyW':
      case 'ArrowDown':
      case 'KeyS':
        inputStore.move.y = 0;
        break;
      case 'ArrowLeft':
      case 'KeyA':
      case 'ArrowRight':
      case 'KeyD':
        inputStore.move.x = 0;
        break;
      case 'Space':
        inputStore.jump = false;
        break;
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);

  return () => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
  };
};