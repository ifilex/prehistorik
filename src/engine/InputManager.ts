/**
 * Multiplatform Input Manager:
 * Handles Keyboard, Gamepad, Mouse, and Virtual Touch/Mobile Joystick with Auto-Detection.
 * Rock-solid key normalization for all layouts, locales, and iframe focus states.
 */

export class InputManager {
  // Normalized action states
  private actionsDown: {
    left: boolean;
    right: boolean;
    up: boolean;
    down: boolean;
    jump: boolean;
    attack: boolean;
    pause: boolean;
    start: boolean;
  } = {
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false,
    attack: false,
    pause: false,
    start: false
  };

  private actionsJustPressed: {
    left: boolean;
    right: boolean;
    up: boolean;
    down: boolean;
    jump: boolean;
    attack: boolean;
    pause: boolean;
    start: boolean;
  } = {
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false,
    attack: false,
    pause: false,
    start: false
  };

  // Touch / Virtual Joystick states
  public touchLeft: boolean = false;
  public touchRight: boolean = false;
  public touchDown: boolean = false;
  public touchUp: boolean = false;
  public touchAttack: boolean = false;
  public touchJump: boolean = false;
  private touchAttackJust: boolean = false;
  private touchJumpJust: boolean = false;

  // Touch device detection (includes Tablets and mobile widths)
  public isTouchDevice: boolean = false;
  public showTouchControls: boolean = false;

  // Joystick virtual stick coordinates (-1 to 1)
  public joystickX: number = 0;
  public joystickY: number = 0;

  constructor() {
    this.detectDeviceType();
    this.setupListeners();
  }

  public detectDeviceType() {
    // Check if user is on a touch device, tablet, or portable viewport
    const hasTouch = (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) ||
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Tablet/i.test(navigator.userAgent) ||
      window.innerWidth <= 1024
    );

    this.isTouchDevice = hasTouch;
    this.showTouchControls = hasTouch;
  }

  public setTouchControlsOverride(enabled: boolean) {
    this.showTouchControls = enabled;
  }

  private setupListeners() {
    const handleKeyDown = (e: KeyboardEvent) => {
      const code = e.code;
      const key = e.key ? e.key.toLowerCase() : '';

      // Prevent scrolling on arrow keys and space
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(code) ||
          ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) {
        e.preventDefault();
      }

      // Map to canonical actions
      let action: keyof typeof this.actionsDown | null = null;

      if (code === 'ArrowLeft' || key === 'arrowleft' || key === 'left' || code === 'KeyA' || key === 'a') {
        action = 'left';
      } else if (code === 'ArrowRight' || key === 'arrowright' || key === 'right' || code === 'KeyD' || key === 'd') {
        action = 'right';
      } else if (code === 'ArrowUp' || key === 'arrowup' || key === 'up' || code === 'KeyW' || key === 'w') {
        action = 'up';
      } else if (code === 'ArrowDown' || key === 'arrowdown' || key === 'down' || code === 'KeyS' || key === 's') {
        action = 'down';
      } else if (code === 'Space' || key === ' ' || code === 'KeyX' || key === 'x' || code === 'KeyC' || key === 'c') {
        action = 'attack';
      } else if (code === 'KeyZ' || key === 'z' || code === 'AltLeft' || code === 'AltRight' || code === 'Alt' || code === 'ArrowUp' || key === 'arrowup' || code === 'KeyW' || key === 'w') {
        action = 'jump';
      } else if (code === 'KeyP' || key === 'p' || code === 'Escape' || key === 'escape') {
        action = 'pause';
      } else if (code === 'Enter' || key === 'enter') {
        action = 'start';
      }

      if (action) {
        if (!this.actionsDown[action]) {
          this.actionsJustPressed[action] = true;
        }
        this.actionsDown[action] = true;
      }

      // Any movement or action key can also trigger start if on title
      if (['left', 'right', 'jump', 'attack', 'start'].includes(action || '')) {
        this.actionsJustPressed.start = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const code = e.code;
      const key = e.key ? e.key.toLowerCase() : '';

      if (code === 'ArrowLeft' || key === 'arrowleft' || key === 'left' || code === 'KeyA' || key === 'a') {
        this.actionsDown.left = false;
      }
      if (code === 'ArrowRight' || key === 'arrowright' || key === 'right' || code === 'KeyD' || key === 'd') {
        this.actionsDown.right = false;
      }
      if (code === 'ArrowUp' || key === 'arrowup' || key === 'up' || code === 'KeyW' || key === 'w') {
        this.actionsDown.up = false;
      }
      if (code === 'ArrowDown' || key === 'arrowdown' || key === 'down' || code === 'KeyS' || key === 's') {
        this.actionsDown.down = false;
      }
      if (code === 'Space' || key === ' ' || code === 'KeyX' || key === 'x' || code === 'KeyC' || key === 'c') {
        this.actionsDown.attack = false;
      }
      if (code === 'KeyZ' || key === 'z' || code === 'AltLeft' || code === 'AltRight' || code === 'Alt') {
        this.actionsDown.jump = false;
      }
      if (code === 'KeyP' || key === 'p' || code === 'Escape' || key === 'escape') {
        this.actionsDown.pause = false;
      }
      if (code === 'Enter' || key === 'enter') {
        this.actionsDown.start = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp, { passive: true });
    window.addEventListener('resize', () => this.detectDeviceType());

    // When clicking canvas or document, ensure window has focus
    window.addEventListener('click', () => {
      window.focus();
    });
  }

  public pollGamepad() {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    if (!gamepads || !gamepads[0]) return;
    const gp = gamepads[0];
    if (!gp) return;

    const axisX = gp.axes[0] || 0;
    const axisY = gp.axes[1] || 0;

    const gpLeft = axisX < -0.3 || (gp.buttons[14] && gp.buttons[14].pressed);
    const gpRight = axisX > 0.3 || (gp.buttons[15] && gp.buttons[15].pressed);
    const gpDown = axisY > 0.3 || (gp.buttons[13] && gp.buttons[13].pressed);
    const gpUp = axisY < -0.3 || (gp.buttons[12] && gp.buttons[12].pressed);

    const gpJump = gp.buttons[0] && gp.buttons[0].pressed;
    const gpAttack = (gp.buttons[2] && gp.buttons[2].pressed) || (gp.buttons[1] && gp.buttons[1].pressed);
    const gpStart = gp.buttons[9] && gp.buttons[9].pressed;

    if (gpLeft) this.actionsDown.left = true;
    if (gpRight) this.actionsDown.right = true;
    if (gpDown) this.actionsDown.down = true;
    if (gpUp) this.actionsDown.up = true;
    if (gpJump) {
      if (!this.actionsDown.jump) this.actionsJustPressed.jump = true;
      this.actionsDown.jump = true;
    }
    if (gpAttack) {
      if (!this.actionsDown.attack) this.actionsJustPressed.attack = true;
      this.actionsDown.attack = true;
    }
    if (gpStart) {
      if (!this.actionsDown.start) this.actionsJustPressed.start = true;
      this.actionsDown.start = true;
    }
  }

  // --- External Touch Trigger Methods ---
  public setTouchStick(x: number, y: number) {
    this.joystickX = x;
    this.joystickY = y;
    this.touchLeft = x < -0.25;
    this.touchRight = x > 0.25;
    this.touchDown = y > 0.35;
    this.touchUp = y < -0.35;
  }

  public setTouchJump(pressed: boolean) {
    if (pressed && !this.touchJump) {
      this.touchJumpJust = true;
      this.actionsJustPressed.start = true;
    }
    this.touchJump = pressed;
  }

  public setTouchAttack(pressed: boolean) {
    if (pressed && !this.touchAttack) {
      this.touchAttackJust = true;
      this.actionsJustPressed.start = true;
    }
    this.touchAttack = pressed;
  }

  // --- Input State Getters ---
  public isLeft(): boolean {
    return this.actionsDown.left || this.touchLeft || this.joystickX < -0.25;
  }

  public isRight(): boolean {
    return this.actionsDown.right || this.touchRight || this.joystickX > 0.25;
  }

  public isDown(): boolean {
    return this.actionsDown.down || this.touchDown || this.joystickY > 0.35;
  }

  public isUp(): boolean {
    return this.actionsDown.up || this.touchUp || this.joystickY < -0.35;
  }

  public isJump(): boolean {
    return this.actionsDown.jump || this.touchJump;
  }

  public wasJumpJustPressed(): boolean {
    return this.actionsJustPressed.jump || this.touchJumpJust;
  }

  public isAttack(): boolean {
    return this.actionsDown.attack || this.touchAttack;
  }

  public wasAttackJustPressed(): boolean {
    return this.actionsJustPressed.attack || this.touchAttackJust;
  }

  public wasPauseJustPressed(): boolean {
    return this.actionsJustPressed.pause;
  }

  public wasStartJustPressed(): boolean {
    return this.actionsJustPressed.start;
  }

  // Called at the end of each frame to reset just-pressed flags
  public update() {
    this.actionsJustPressed = {
      left: false,
      right: false,
      up: false,
      down: false,
      jump: false,
      attack: false,
      pause: false,
      start: false
    };
    this.touchAttackJust = false;
    this.touchJumpJust = false;
    this.pollGamepad();
  }
}

export const inputManager = new InputManager();
