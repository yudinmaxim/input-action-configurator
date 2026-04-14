/**
 * Device Rule Condition Types
 * 
 * Separate condition system for device_rules.
 * These use a different set of variables that describe the device.
 * 
 * @see https://github.com/InputActions/wiki/devices/rule.md
 */

import { ConditionOperator } from './index';

/**
 * Device rule condition variable
 * 
 * Device rules use a separate set of variables compared to global conditions.
 * Global variables are NOT accessible in device rules.
 */
export interface DeviceRuleCondition {
  /**
   * Device name to match against.
   * Can use operators for partial matching.
   */
  var: 'name' | 'types' | 'keyboard' | 'mouse' | 'touchpad' | 'touchscreen';
  
  /**
   * Comparison operator.
   * @see ConditionOperator
   */
  op?: ConditionOperator;
  
  /**
   * Value to compare against.
   * For boolean vars (keyboard, mouse, etc.), can be just the value.
   */
  value?: string | number | boolean | string[];
}

/**
 * Device type flags for device_rule conditions
 * 
 * Devices can have multiple types (e.g., some touchpads act as mice).
 */
export enum DeviceTypeFlag {
  KEYBOARD = 'keyboard',
  MOUSE = 'mouse',
  TOUCHPAD = 'touchpad',
  TOUCHSCREEN = 'touchscreen',
}

/**
 * Shortcut key representation
 * 
 * Keyboard keys that can be used in shortcut triggers.
 * This is a subset - actual keys depend on system keyboard.
 * 
 * For full list, use evtest or check:
 * @see https://github.com/InputActions/wiki/devices/keyboard/scancodes.md
 */
export enum KeyboardKey {
  // Modifiers
  LEFTCTRL = 'leftctrl',
  RIGHTCTRL = 'rightctrl',
  LEFTSHIFT = 'leftshift',
  RIGHTSHIFT = 'rightshift',
  LEFTALT = 'leftalt',
  RIGHTALT = 'rightalt',
  LEFTMETA = 'leftmeta',
  RIGHTMETA = 'rightmeta',
  
  // Letters
  A = 'a', B = 'b', C = 'c', D = 'd', E = 'e',
  F = 'f', G = 'g', H = 'h', I = 'i', J = 'j',
  K = 'k', L = 'l', M = 'm', N = 'n', O = 'o',
  P = 'p', Q = 'q', R = 'r', S = 's', T = 't',
  U = 'u', V = 'v', W = 'w', X = 'x', Y = 'y', Z = 'z',
  
  // Numbers
  NUM0 = '0', NUM1 = '1', NUM2 = '2', NUM3 = '3', NUM4 = '4',
  NUM5 = '5', NUM6 = '6', NUM7 = '7', NUM8 = '8', NUM9 = '9',
  
  // Function keys
  F1 = 'f1', F2 = 'f2', F3 = 'f3', F4 = 'f4',
  F5 = 'f5', F6 = 'f6', F7 = 'f7', F8 = 'f8',
  F9 = 'f9', F10 = 'f10', F11 = 'f11', F12 = 'f12',
  
  // Special
  SPACE = 'space',
  ENTER = 'enter',
  ESCAPE = 'escape',
  TAB = 'tab',
  BACKSPACE = 'backspace',
  DELETE = 'delete',
  INSERT = 'insert',
  HOME = 'home',
  END = 'end',
  PAGEUP = 'pageup',
  PAGEDOWN = 'pagedown',
  
  // Arrows
  UP = 'up',
  DOWN = 'down',
  LEFT = 'left',
  RIGHT = 'right',
  
  // Navigation
  PRINT = 'print',
  PAUSE = 'pause',
  SCROLLLOCK = 'scrolllock',
  
  // Media
  VOLUMEDOWN = 'volumedown',
  VOLUMEUP = 'volumeup',
  MUTE = 'mute',
  MEDIAPLAY = 'mediaplay',
  MEDIASTOP = 'mediastop',
  MEDIANEXT = 'medialnext',
  MEDIAPREV = 'mediaprev',
  
  // Numpad
  NP0 = 'kp0', NP1 = 'kp1', NP2 = 'kp2', NP3 = 'kp3', NP4 = 'kp4',
  NP5 = 'kp5', NP6 = 'kp6', NP7 = 'kp7', NP8 = 'kp8', NP9 = 'kp9',
  NPDIVIDE = 'kpdiv', NPMULT = 'kp mul', NPENTER = 'kpenter',
  NPPLUS = 'kpplus', NPMINUS = 'kpminus', NPDOT = 'kpdot',
}

/**
 * All keyboard modifiers (for use in shortcuts and conditions)
 */
export const KEYBOARD_MODIFIERS = [
  'leftctrl', 'rightctrl',
  'leftshift', 'rightshift',
  'leftalt', 'rightalt',
  'leftmeta', 'rightmeta',
  'ctrl', 'shift', 'alt', 'meta',
] as const;

/**
 * Common shortcut examples
 * 
 * These are typical shortcuts users configure.
 */
export const COMMON_SHORTCUTS = {
  copy: 'leftctrl+c',
  paste: 'leftctrl+v',
  cut: 'leftctrl+x',
  undo: 'leftctrl+z',
  redo: 'leftctrl+shift+z',
  selectAll: 'leftctrl+a',
  save: 'leftctrl+s',
  close: 'alt+f4',
  tab: 'alt+tab',
  switchApp: 'alt+tab',
  newTab: 'leftctrl+t',
  closeTab: 'leftctrl+w',
  reload: 'leftctrl+r',
  find: 'leftctrl+f',
} as const;