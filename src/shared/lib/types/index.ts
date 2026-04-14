/**
 * Input Action Configurator - Type Definitions
 * 
 * Complete type system for InputActions configuration based on:
 * - https://github.com/InputActions/kwin
 * - https://github.com/InputActions/wiki
 * 
 * This file contains all types, interfaces, and enums needed to represent
 * InputActions configuration files (YAML format).
 * 
 * Usage:
 * - Use these types to parse/serialize YAML configuration
 * - Build UI forms for editing gestures
 * - Validate trigger/action configurations
 */

// ============================================================================
// SECTION 1: CORE ENUMS
// ============================================================================

/**
 * Supported input devices in InputActions
 * 
 * Each device has its own set of triggers and properties.
 * Devices can be configured via device_rules in the config file.
 */
export enum DeviceType {
  KEYBOARD = 'keyboard',
  MOUSE = 'mouse',
  TOUCHPAD = 'touchpad',
  TOUCHSCREEN = 'touchscreen',
}

/**
 * Trigger types - actions/gestures that can be performed on each device
 * 
 * Each trigger type has specific requirements and properties.
 * Not all triggers are available on all devices.
 */
export enum TriggerType {
  // Keyboard triggers
  SHORTCUT = 'shortcut',
  
  // Mouse triggers
  CIRCLE = 'circle',
  PRESS = 'press',
  STROKE = 'stroke',
  SWIPE = 'swipe',
  WHEEL = 'wheel',
  
  // Touchpad/Touchscreen triggers
  CLICK = 'click',
  HOLD = 'hold',
  PINCH = 'pinch',
  ROTATE = 'rotate',
  TAP = 'tap',
}

/**
 * Direction for motion triggers (swipe, circle, etc.)
 * 
 * These define the direction of finger/mouse movement.
 * Some directions support bidirectional motion.
 */
export enum SwipeDirection {
  LEFT = 'left',
  RIGHT = 'right',
  UP = 'up',
  DOWN = 'down',
  
  // Bidirectional (allows both directions)
  LEFT_RIGHT = 'left_right',
  UP_DOWN = 'up_down',
  
  // Diagonal
  LEFT_UP = 'left_up',
  LEFT_DOWN = 'left_down',
  RIGHT_UP = 'right_up',
  RIGHT_DOWN = 'right_down',
  
  // Bidirectional diagonal
  LEFT_UP_RIGHT_DOWN = 'left_up_right_down',
  LEFT_DOWN_RIGHT_UP = 'left_down_right_up',
  
  // Any direction
  ANY = 'any',
}

/**
 * Circle trigger direction
 * 
 * Continuous circular motion direction.
 */
export enum CircleDirection {
  CLOCKWISE = 'clockwise',
  COUNTERCLOCKWISE = 'counterclockwise',
  ANY = 'any',
}

/**
 * Motion speed for triggers
 * 
 * Determines the speed at which a motion trigger must be performed.
 * Affects which trigger activates when multiple are possible.
 */
export enum MotionSpeed {
  FAST = 'fast',
  SLOW = 'slow',
}

/**
 * Trigger lifecycle events
 * 
 * When to execute an action during the trigger's lifecycle.
 * Different triggers support different events.
 */
export enum TriggerEvent {
  BEGIN = 'begin',       // Trigger starts (may be delayed by threshold)
  UPDATE = 'update',    // Trigger is updated (motion detected)
  TICK = 'tick',        // Time-based tick (same interval as time triggers)
  END = 'end',          // Trigger completed successfully
  CANCEL = 'cancel',    // Trigger was cancelled
  END_CANCEL = 'end_cancel', // Trigger ended but was cancelled
}

/**
 * Cursor shapes for cursor_change action
 * 
 * Available cursor shapes that can be set programmatically.
 * Requires application to support cursor shape protocol.
 * 
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/cursor#syntax
 */
export enum CursorShape {
  ALIAS = 'alias',
  ALL_SCROLL = 'all_scroll',
  COL_RESIZE = 'col_resize',
  COPY = 'copy',
  CROSSHAIR = 'crosshair',
  DEFAULT = 'default',
  E_RESIZE = 'e_resize',
  EW_RESIZE = 'ew_resize',
  GRAB = 'grab',
  GRABBING = 'grabbing',
  HELP = 'help',
  MOVE = 'move',
  N_RESIZE = 'n_resize',
  NE_RESIZE = 'ne_resize',
  NESW_RESIZE = 'nesw_resize',
  NOT_ALLOWED = 'not_allowed',
  NS_RESIZE = 'ns_resize',
  NW_RESIZE = 'nw_resize',
  NWSE_RESIZE = 'nwse_resize',
  POINTER = 'pointer',
  PROGRESS = 'progress',
  ROW_RESIZE = 'row_resize',
  S_RESIZE = 's_resize',
  SE_RESIZE = 'se_resize',
  SW_RESIZE = 'sw_resize',
  TEXT = 'text',
  UP_ARROW = 'up_arrow',
  W_RESIZE = 'w_resize',
  WAIT = 'wait',
}

/**
 * Keyboard modifiers
 * 
 * Modifiers that can be checked in conditions or used in shortcuts.
 * Used with keyboard_modifiers variable.
 */
export enum KeyboardModifier {
  ALT = 'alt',
  CTRL = 'ctrl',
  META = 'meta',    // Super/Win/Cmd key
  SHIFT = 'shift',
}

// ============================================================================
// SECTION 2: DEVICE-SPECIFIC TYPES
// ============================================================================

/**
 * Mouse button identifiers
 * 
 * Available mouse buttons that can be watched/actions.
 * These map to evdev scancodes.
 * 
 * @see https://github.com/InputActions/wiki/devices/mouse/index.md#buttons
 */
export enum MouseButton {
  LEFT = 'left',
  MIDDLE = 'middle',
  RIGHT = 'right',
  BACK = 'back',       // BTN_SIDE
  FORWARD = 'forward',  // BTN_EXTRA
  TASK = 'task',      // BTN_FORWARD
  SIDE = 'side',     // BTN_BACK
  EXTRA = 'extra',   // BTN_TASK
  EXTRA1 = 'extra1', // alias for back
  EXTRA2 = 'extra2', // alias for forward
  EXTRA3 = 'extra3', // alias for task
  EXTRA4 = 'extra4', // alias for side
  EXTRA5 = 'extra5', // alias for extra
  EXTRA6 = 'extra6',
  EXTRA7 = 'extra7',
  EXTRA8 = 'extra8',
  EXTRA9 = 'extra9',
  EXTRA10 = 'extra10',
  EXTRA11 = 'extra11',
  EXTRA12 = 'extra12',
  EXTRA13 = 'extra13',
}

/**
 * Device configuration properties
 * 
 * Common properties that can be set on all devices.
 * These are typically set via device_rules in the config.
 */
export interface DeviceProperties {
  /** 
   * Grab the evdev device, required for event filtering.
   * Only available in standalone implementation.
   * @default false
   */
  grab?: boolean;
  
  /** 
   * Ignore all events generated by the device.
   * @default false
   */
  ignore?: boolean;
}

/**
 * Mouse device specific properties
 * 
 * Additional properties available for mouse devices.
 * Affects motion detection and button handling.
 * 
 * @see https://github.com/InputActions/wiki/devices/mouse/index.md#properties
 */
export interface MouseDeviceProperties extends DeviceProperties {
  /**
   * The time in milliseconds during which a motion trigger must be performed.
   * If not met, a press trigger will be started instead.
   * If no press triggers are active, all pressed buttons will be actually pressed.
   * @default 200 (milliseconds)
   */
  motion_timeout?: number;
  
  /**
   * Threshold for accurately determining the direction of swipe triggers.
   * Higher values require more movement before direction is determined.
   * @default 10
   */
  motion_threshold?: number;
  
  /**
   * The time in milliseconds during which press triggers are not started
   * when user presses more than one mouse button.
   * Prevents accidental multi-button gestures.
   * @default 50 (milliseconds)
   */
  press_timeout?: number;
  
  /**
   * Angle tolerance for left, right, up, down, left_right, and up_down directions.
   * Remaining space is used for diagonal directions.
   * @minimum 0
   * @maximum 45
   * @default 20
   */
  swipe?: {
    angle_tolerance?: number;
  };
  
  /**
   * Whether blocked mouse buttons should be pressed immediately on timeout.
   * If false, they will be pressed and instantly released.
   * @default true
   */
  unblock_buttons_on_timeout?: boolean;
}

/**
 * Touchpad device specific properties
 * 
 * Additional properties for touchpad devices.
 * Many are automatically detected but can be overridden.
 * 
 * @see https://github.com/InputActions/wiki/devices/touchpad/index.md#properties
 */
export interface TouchpadDeviceProperties extends DeviceProperties {
  /**
   * Whether the touchpad is a buttonpad (no physical buttons below).
   * The entire device acts as a button.
   * Auto-detected by default.
   * @default false
   */
  buttonpad?: boolean;
  
  /**
   * The time in milliseconds during which a click trigger must be performed.
   * If not met, a hold trigger will be started.
   * @default 200 (milliseconds)
   */
  click_timeout?: number;
  
  /**
   * Whether to handle evdev events.
   * Disable if there are any issues.
   * @default true
   */
  handle_evdev_events?: boolean;
  
  /**
   * Motion threshold for 1-finger swipe triggers.
   * @default 10
   */
  motion_threshold?: number;
  
  /**
   * Motion threshold for 2-finger swipe triggers.
   * @default 10
   */
  motion_threshold_2?: number;
  
  /**
   * Motion threshold for 3- and 4-finger swipe triggers.
   * @default 10
   */
  motion_threshold_3?: number;
  
  /**
   * Pressure ranges for finger detection.
   * Everything below finger threshold is ignored.
   */
  pressure_ranges?: {
    /** Minimum pressure for a finger. @default 0 */
    finger?: number;
    /** Minimum pressure for a thumb (required for thumb_* variables). @default 4294967295 */
    thumb?: number;
    /** Everything above this is considered palm (ignored). @default 4294967295 */
    palm?: number;
  };
  
  /**
   * Angle tolerance for swipe directions.
   * @minimum 0
   * @maximum 45
   * @default 20
   */
  swipe?: {
    angle_tolerance?: number;
  };
}

/**
 * Touchscreen device specific properties
 * 
 * Additional properties for touchscreen devices.
 * Note: Touchscreen support is experimental.
 * 
 * @see https://github.com/InputActions/wiki/devices/touchscreen/index.md#properties
 */
export interface TouchscreenDeviceProperties extends DeviceProperties {
  /**
   * Motion threshold in millimeters for determining swipe direction.
   * @default 4
   */
  motion_threshold?: number;
  
  /**
   * Angle tolerance for swipe directions.
   * @minimum 0
   * @maximum 45
   * @default 20
   */
  swipe?: {
    angle_tolerance?: number;
  };
}

/**
 * Combined device properties (for any device type)
 */
export type DeviceConfigProperties = 
  | DeviceProperties 
  | MouseDeviceProperties 
  | TouchpadDeviceProperties 
  | TouchscreenDeviceProperties;

/**
 * Device rule - applies properties to devices matching conditions
 * 
 * Allows conditional device configuration based on device properties.
 * 
 * @example
 * ```yaml
 * device_rules:
 *   - conditions:
 *       - $touchpad
 *       - $name contains Synaptics
 *     click_timeout: 150
 * ```
 */
export interface DeviceRule {
  /** Conditions that must be matched for this rule to apply */
  conditions?: Condition[];
  
  /** Properties to apply when conditions are matched */
  grab?: boolean;
  ignore?: boolean;
  
  // Mouse properties
  motion_timeout?: number;
  motion_threshold?: number;
  press_timeout?: number;
  unblock_buttons_on_timeout?: boolean;
  swipe?: { angle_tolerance?: number };
  
  // Touchpad properties
  buttonpad?: boolean;
  click_timeout?: number;
  handle_evdev_events?: boolean;
  motion_threshold_2?: number;
  motion_threshold_3?: number;
  pressure_ranges?: {
    finger?: number;
    thumb?: number;
    palm?: number;
  };
  
  // Touchscreen properties
  // (uses common properties above)
}

// ============================================================================
// SECTION 3: TRIGGER TYPES
// ============================================================================

/**
 * Base trigger configuration
 * 
 * Common properties available on all trigger types.
 * 
 * @see https://github.com/InputActions/wiki/trigger.md#properties
 */
export interface BaseTriggerConfig {
  /**
   * Type of trigger (circle, click, hold, hover, pinch, press, rotate, shortcut, stroke, swipe, tap, wheel)
   * Must be lowercase and match one of the available trigger types for the device.
   */
  type: TriggerType;
  
  /**
   * Unique identifier for this trigger.
   * Must be unique across all triggers in the configuration.
   * Used in last_trigger_id variable.
   */
  id?: string;
  
  /**
   * Use the accelerated delta (if available) for action intervals
   * and the move_by_delta input action.
   * @default false
   */
  accelerated?: boolean;
  
  /**
   * List of actions to execute when trigger activates.
   * At least one action is required.
   */
  actions: Action[];
  
  /**
   * Whether this trigger should block all input events required to perform it.
   * Only one active trigger needs this to be true for blocking to occur.
   * @default true
   */
  block_events?: boolean;
  
  /**
   * Whether keyboard modifiers should be cleared when trigger begins.
   * They will NOT be restored after trigger ends.
   * @default true if input action present, false otherwise
   */
  clear_modifiers?: boolean;
  
  /**
   * Conditions that must be satisfied for this trigger to activate.
   * @see Condition
   */
  conditions?: Condition[];
  
  /**
   * Conditions that must be satisfied for trigger to end.
   * If not satisfied, trigger is cancelled instead of ending.
   */
  end_conditions?: Condition[];
  
  /**
   * The amount of time after trigger ends during which the trigger can be performed again
   * as if it never ended.
   * Any action that does NOT activate this trigger cancels it immediately.
   * Not compatible with stroke triggers.
   * @default 0 (no resume)
   */
  resume_timeout?: string | number;
  
  /**
   * Whether to set last_trigger variables.
   * @default true
   */
  set_last_trigger?: boolean;
  
  /**
   * How far the trigger must progress before beginning.
   * Can be a single value (minimum) or range (min and max).
   * Triggers with on: begin or on: update actions CANNOT have maximum thresholds.
   */
  threshold?: number | string | [number, number];
  
  /**
   * The speed at which the trigger must be performed.
   * @see MotionSpeed
   */
  speed?: MotionSpeed;
}

/**
 * Swipe trigger configuration
 * 
 * Straight motion at a particular angle/direction.
 * Available on: Mouse, Touchpad, Touchscreen
 * 
 * @see https://github.com/InputActions/wiki/devices/mouse/triggers/swipe.md
 */
export interface SwipeTriggerConfig extends BaseTriggerConfig {
  type: TriggerType.SWIPE;
  
  /**
   * Custom angle range for the swipe.
   * Format: "a-b" where each angle ranges from 0 to 360.
   * Mutually exclusive with direction.
   * 
   * Angle reference:
   * - 0° = right
   * - 90° = up
   * - 180° = left
   * - 270° = down
   * 
   * @example "30-330" - swipe at 30° with ±30° tolerance
   * @example "330-30" - wraps around (330° to 30°)
   */
  angle?: string;
  
  /**
   * Predefined swipe direction.
   * Mutually exclusive with angle.
   * 
   * @see SwipeDirection
   */
  direction?: SwipeDirection;
  
  /**
   * Allow motion in the opposite angular range.
   * For angle ranges only, not predefined directions.
   * Negative delta for opposite direction.
   * @default false
   */
  bidirectional?: boolean;
  
  /**
   * Lock the pointer's position while the trigger is active.
   * Prevents cursor from moving during swipe.
   * @default false
   */
  lock_pointer?: boolean;
  
  /**
   * Mouse buttons that must be pressed for trigger to activate.
   * Only for Mouse triggers.
   */
  mouse_buttons?: MouseButton[];
  
  /**
   * Whether mouse buttons must be pressed in exact order.
   * Only for Mouse triggers.
   * @default false
   */
  mouse_buttons_exact_order?: boolean;
  
  /**
   * Number of fingers required (Touchpad/Touchscreen only).
   * Equivalent to $fingers == [value] condition.
   */
  fingers?: number;
}

/**
 * Circle trigger configuration
 * 
 * Continuous circular motion.
 * Available on: Mouse, Touchpad, Touchscreen
 * 
 * @see https://github.com/InputActions/wiki/devices/mouse/triggers/circle.md
 */
export interface CircleTriggerConfig extends BaseTriggerConfig {
  type: TriggerType.CIRCLE;
  
  /**
   * Direction of circular motion.
   * @see CircleDirection
   */
  direction?: CircleDirection;
  
  /**
   * Lock the pointer's position while trigger is active.
   * @default false
   */
  lock_pointer?: boolean;
  
  /**
   * Mouse buttons required (Mouse only)
   */
  mouse_buttons?: MouseButton[];
  mouse_buttons_exact_order?: boolean;
  
  /**
   * Number of fingers (Touchpad/Touchscreen only)
   */
  fingers?: number;
}

/**
 * Hold trigger configuration
 * 
 * Performed by placing fingers on touchpad and not moving them.
 * Time-based trigger.
 * Available on: Touchpad, Touchscreen
 * 
 * @see https://github.com/InputActions/wiki/devices/touchpad/triggers/hold.md
 */
export interface HoldTriggerConfig extends BaseTriggerConfig {
  type: TriggerType.HOLD;
  
  /**
   * Number of fingers required.
   * @minimum 1
   * @maximum 4
   */
  fingers: number;
}

/**
 * Tap trigger configuration
 * 
 * Performed by tapping (touching briefly).
 * Available on: Touchpad, Touchscreen
 */
export interface TapTriggerConfig extends BaseTriggerConfig {
  type: TriggerType.TAP;
  
  /**
   * Number of fingers required.
   * @minimum 1
   * @maximum 4
   */
  fingers: number;
}

/**
 * Click trigger configuration
 * 
 * Performed by tapping with button pressed (physical click).
 * Only available on touchpads with evdev support.
 * Available on: Touchpad
 */
export interface ClickTriggerConfig extends BaseTriggerConfig {
  type: TriggerType.CLICK;
  
  /**
   * Number of fingers required.
   */
  fingers?: number;
}

/**
 * Press trigger configuration
 * 
 * Mouse button press.
 * Time-based trigger with delay to prevent conflicts.
 * Available on: Mouse
 * 
 * @see https://github.com/InputActions/wiki/devices/mouse/triggers/press.md
 */
export interface PressTriggerConfig extends BaseTriggerConfig {
  type: TriggerType.PRESS;
  
  /**
   * Whether the trigger should begin immediately.
   * By default, there's a delay to prevent conflicts with normal clicks.
   * @default false
   */
  instant?: boolean;
  
  /**
   * Mouse buttons required
   */
  mouse_buttons?: MouseButton[];
  mouse_buttons_exact_order?: boolean;
}

/**
 * Stroke trigger configuration
 * 
 * Motion with changing direction (not straight line).
 * Available on: Mouse, Touchpad, Touchscreen
 */
export interface StrokeTriggerConfig extends BaseTriggerConfig {
  type: TriggerType.STROKE;
  
  /**
   * Mouse buttons required (Mouse only)
   */
  mouse_buttons?: MouseButton[];
  mouse_buttons_exact_order?: boolean;
  
  /**
   * Number of fingers (Touchpad/Touchscreen only)
   */
  fingers?: number;
}

/**
 * Pinch trigger configuration
 * 
 * Pinch gesture for zooming (two/four finger).
 * Motion based on distance change.
 * Available on: Touchpad, Touchscreen
 */
export interface PinchTriggerConfig extends BaseTriggerConfig {
  type: TriggerType.PINCH;
  
  /**
   * Number of fingers (2 or 4)
   */
  fingers: number;
}

/**
 * Rotate trigger configuration
 * 
 * Rotation gesture (two/four finger).
 * Motion based on angle change.
 * Available on: Touchpad, Touchscreen
 */
export interface RotateTriggerConfig extends BaseTriggerConfig {
  type: TriggerType.ROTATE;
  
  /**
   * Number of fingers (2-4)
   */
  fingers: number;
}

/**
 * Wheel trigger configuration
 * 
 * Mouse wheel rotation.
 * Available on: Mouse
 */
export interface WheelTriggerConfig extends BaseTriggerConfig {
  type: TriggerType.WHEEL;
  
  /**
   * Mouse buttons required
   */
  mouse_buttons?: MouseButton[];
  mouse_buttons_exact_order?: boolean;
}

/**
 * Shortcut trigger configuration
 * 
 * Keyboard shortcut (key combination).
 * Available on: Keyboard
 * 
 * @see https://github.com/InputActions/wiki/devices/keyboard/triggers/shortcut.md
 */
export interface ShortcutTriggerConfig extends BaseTriggerConfig {
  type: TriggerType.SHORTCUT;
  
  /**
   * Key combination to trigger on.
   * Format: keys joined with + (e.g., "alt+tab", "ctrl+shift+a")
   * Order doesn't matter.
   */
  keys: string[];
}

/**
 * Union of all trigger configurations
 */
export type TriggerConfig = 
  | SwipeTriggerConfig 
  | CircleTriggerConfig 
  | HoldTriggerConfig 
  | TapTriggerConfig 
  | ClickTriggerConfig 
  | PressTriggerConfig 
  | StrokeTriggerConfig 
  | PinchTriggerConfig 
  | RotateTriggerConfig 
  | WheelTriggerConfig 
  | ShortcutTriggerConfig;

// ============================================================================
// SECTION 4: ACTION TYPES
// ============================================================================

/**
 * Base action configuration
 * 
 * Common properties for all action types.
 * 
 * @see https://github.com/InputActions/wiki/actions/index.md#properties
 */
export interface BaseActionConfig {
  /**
   * At which point of the trigger's lifecycle to execute this action.
   * @see TriggerEvent
   * @default 'end'
   */
  on?: TriggerEvent;
  
  /**
   * Conditions that must be satisfied for this action to execute.
   */
  conditions?: Condition[];
  
  /**
   * Whether this action can activate trigger conflict resolution.
   * If false, trigger won't be cancelled when this action executes.
   * @default true
   */
  conflicting?: boolean;
  
  /**
   * How often an on: update action should execute.
   * @default 0 (once per event)
   * 
   * Values:
   * - 0: Execute once per event
   * - '+': Execute only when delta is positive
   * - '-': Execute only when delta is negative
   * - number: Execute when total delta >= number
   * - -number: Execute when total delta <= number
   */
  interval?: number | string;
  
  /**
   * Maximum number of times this action can execute during a trigger.
   * 0 = no limit
   * @default 0
   */
  limit?: number;
  
  /**
   * Threshold for this action (different from trigger threshold).
   * Cannot be used with on: begin actions.
   */
  threshold?: number | string | [number, number];
}

/**
 * Input action - simulates keyboard and mouse input
 * 
 * Most commonly used action for input simulation.
 * 
 * @see https://github.com/InputActions/wiki/actions/input.md
 */
export interface InputActionConfig extends BaseActionConfig {
  /**
   * List of input actions to perform.
   * Each item can contain keyboard and/or mouse actions.
   */
  input: InputActionItem[];
  
  /**
   * Delay between each item in the sequence.
   * @default 0 (no delay)
   */
  delay?: number | string;
}

/**
 * Single input action item (one step in the sequence)
 */
export interface InputActionItem {
  /**
   * Keyboard actions to perform.
   * Format: see KeyboardAction
   * 
   * @example ['+a'] - press key a
   * @example ['-ctrl'] - release ctrl
   * @example ['ctrl+a'] - press ctrl+a together
   * @example ['text: Hello World'] - type text
   */
  keyboard?: string[];
  
  /**
   * Mouse actions to perform.
   * Format: see MouseAction
   * 
   * @example ['+left'] - press left button
   * @example ['move_by 10 0'] - move cursor right
   * @example ['move_to 1920 1080'] - move to position
   * @example ['wheel 0 -1'] - scroll up
   */
  mouse?: string[];
}

/**
 * Keyboard action string format
 * 
 * Defines how to simulate keyboard input.
 * 
 * Press/Release:
 * - +key: Press key (e.g., +a, +ctrl)
 * - -key: Release key (e.g., -a, -ctrl)
 * 
 * Combine keys:
 * - key1+key2+...: Press multiple keys together, release in reverse order
 *   (e.g., "ctrl+c" becomes [ +ctrl, +c, -c, -ctrl ])
 * 
 * Text input:
 * - text: [text]: Type text string
 * - text: [command]: Execute command and type its output
 */
export type KeyboardAction = 
  | `+${string}`    // Press key
  | `-${string}`    // Release key
  | `${string}+${string}` // Key combination
  | `text: ${string}`;    // Text input

/**
 * Mouse action string format
 * 
 * Defines how to simulate mouse input.
 * 
 * Button:
 * - +button: Press button (e.g., +left, +right)
 * - -button: Release button
 * - button1+button2+...: Multiple buttons
 * 
 * Movement:
 * - move_by [x] [y]: Move cursor by offset
 * - move_by_delta [multiplier]: Move by trigger delta (use for motion triggers)
 * - move_to [x] [y]: Move cursor to absolute position
 * 
 * Wheel:
 * - wheel [x] [y]: Move scroll wheel (x=horizontal, y=vertical)
 */
export type MouseAction = 
  | `+${MouseButton}`  // Press button
  | `-${MouseButton}`  // Release button
  | `${MouseButton}+${MouseButton}` // Multiple buttons
  | `move_by ${number} ${number}` // Move by offset
  | `move_by_delta` | `move_by_delta ${number}` // Move by trigger delta
  | `move_to ${number} ${number}` // Move to position
  | `wheel ${number} ${number}`; // Scroll wheel

/**
 * Command action - executes shell command
 * 
 * @see https://github.com/InputActions/wiki/actions/command.md
 */
export interface CommandActionConfig extends BaseActionConfig {
  /**
   * Command to execute.
   * Variables can be referenced using $variable_name syntax.
   */
  command: string;
  
  /**
   * Execute command asynchronously.
   * If false, waits for command to complete.
   * @default false
   */
  async?: boolean;
}

/**
 * Plasma shortcut action - sends Plasma shortcut
 * 
 * @see https://github.com/InputActions/wiki/actions/plasma-shortcut.md
 */
export interface PlasmaShortcutActionConfig extends BaseActionConfig {
  /**
   * Plasma shortcut to send.
   * @example 'Alt+F4'
   * @example 'Meta+Tab'
   */
  shortcut: string;
}

/**
 * Replace text action - replaces clipboard content
 * 
 * Pastes the specified text, replacing any existing clipboard content.
 * 
 * @see https://github.com/InputActions/wiki/actions/replace-text.md
 */
export interface ReplaceTextActionConfig extends BaseActionConfig {
  /**
   * Text to replace/paste.
   * Can include variables.
   */
  replace_with: string;
}

/**
 * Sleep action - adds delay
 * 
 * Pauses execution for specified duration.
 * Useful between actions that need delays.
 * 
 * @see https://github.com/InputActions/wiki/actions/sleep.md
 */
export interface SleepActionConfig extends BaseActionConfig {
  /**
   * Duration to sleep in milliseconds.
   */
  time: number | string;
}

/**
 * Union of all action configurations
 */
export type ActionConfig = 
  | InputActionConfig 
  | CommandActionConfig 
  | PlasmaShortcutActionConfig 
  | ReplaceTextActionConfig 
  | SleepActionConfig;

/**
 * Action type for serialization (used in YAML)
 * 
 * Type is determined by which property is present:
 * - input property -> input action
 * - command property -> command action
 * - shortcut property -> plasma-shortcut action
 * - replace_with property -> replace-text action
 * - time property -> sleep action
 */
export type Action = ActionConfig;

// ============================================================================
// SECTION 5: CONDITION TYPES
// ============================================================================

/**
 * Condition for trigger/action activation
 * 
 * Conditions are evaluated to determine if a trigger should activate
 * or an action should execute.
 * 
 * @see https://github.com/InputActions/wiki/conditions/index.md
 */

// Condition comparison operators
export enum ConditionOperator {
  EQUAL = '==',
  NOT_EQUAL = '!=',
  GREATER_THAN = '>',
  LESS_THAN = '<',
  GREATER_OR_EQUAL = '>=',
  LESS_OR_EQUAL = '<=',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  STARTS_WITH = 'starts_with',
  ENDS_WITH = 'ends_with',
  MATCHES = 'matches',       // Regex
  IN = 'in',
  NOT_IN = 'not_in',
}

/**
 * Single condition expression
 */
export interface Condition {
  /**
   * Variable or property to evaluate.
   * Can be:
   * - $variable (global variable)
   * - $device_type (keyboard, mouse, touchpad, touchscreen)
   * - $name (device name)
   * - $fingers (current finger count)
   * - $keyboard_modifiers (pressed modifiers)
   * - Triggers can access trigger-specific properties
   */
  var: string;
  
  /**
   * Comparison operator.
   * @see ConditionOperator
   */
  op?: ConditionOperator;
  
  /**
   * Value(s) to compare against.
   * Can be a single value or array for IN/NOT_IN operators.
   */
  value?: string | number | boolean | string[] | number[];
}

/**
 * Condition set (multiple conditions with AND/OR)
 */
export interface ConditionSet {
  /** Multiple conditions - ALL must match (AND logic) */
  and?: Condition[];
  
  /** Multiple conditions - ANY must match (OR logic) */
  or?: Condition[];
  
  /** Negate the result */
  not?: boolean;
}

/**
 * Complete condition type (can be simple or set)
 */
export type Condition = Condition | ConditionSet;

// ============================================================================
// SECTION 6: VARIABLE TYPES
// ============================================================================

/**
 * Global variables available in InputActions
 * 
 * These can be used in conditions and passed to commands.
 * 
 * @see https://github.com/InputActions/wiki/variables.md
 */

/**
 * Pointer position (x, y as percentage 0.0-1.0)
 */
export interface PointPosition {
  x: number;
  y: number;
}

/**
 * Keyboard modifier flags
 */
export type KeyboardModifierFlags = KeyboardModifier[];

/**
 * Global variables grouped by category
 */
export interface GlobalVariables {
  // Cursor
  cursor_shape?: CursorShape;
  
  // Finger information
  fingers?: number;
  finger_1_initial_position_percentage?: PointPosition;
  finger_2_initial_position_percentage?: PointPosition;
  finger_3_initial_position_percentage?: PointPosition;
  finger_4_initial_position_percentage?: PointPosition;
  finger_5_initial_position_percentage?: PointPosition;
  finger_1_position_percentage?: PointPosition;
  finger_2_position_percentage?: PointPosition;
  finger_3_position_percentage?: PointPosition;
  finger_4_position_percentage?: PointPosition;
  finger_5_position_percentage?: PointPosition;
  finger_1_pressure?: number;
  finger_2_pressure?: number;
  finger_3_pressure?: number;
  finger_4_pressure?: number;
  finger_5_pressure?: number;
  
  // Keyboard
  keyboard_modifiers?: KeyboardModifierFlags;
  
  // Last trigger
  last_trigger_id?: string;
  time_since_last_trigger?: number;
  
  // Plasma
  plasma_overview_active?: boolean;
  
  // Pointer position
  pointer_position_screen_percentage?: PointPosition;
  pointer_position_window_percentage?: PointPosition;
  
  // Screen
  screen_name?: string;
  
  // Thumb (touchpad)
  thumb_present?: boolean;
  thumb_initial_position_percentage?: PointPosition;
  thumb_position_percentage?: PointPosition;
  
  // Window information (various properties)
  window_class?: string;
  window_fullscreen?: boolean;
  window_id?: string;
  window_maximized?: boolean;
  window_name?: string;
  window_pid?: number;
  window_title?: string;
  
  // Window under pointer/fingers
  window_under_pointer_class?: string;
  window_under_pointer_fullscreen?: boolean;
  window_under_pointer_id?: string;
  window_under_pointer_maximized?: boolean;
  window_under_pointer_name?: string;
  window_under_pointer_pid?: number;
  window_under_pointer_title?: string;
  
  window_under_fingers_class?: string;
  window_under_fingers_fullscreen?: boolean;
  window_under_fingers_id?: string;
  window_under_fingers_maximized?: boolean;
  window_under_fingers_name?: string;
  window_under_fingers_pid?: number;
  window_under_fingers_title?: string;
}

// ============================================================================
// SECTION 7: COMPLETE CONFIG STRUCTURE
// ============================================================================

/**
 * Complete InputActions configuration file structure
 * 
 * This is the root structure of ~/.config/inputactions/config.yaml
 */
export interface InputActionsConfig {
  /**
   * Device-specific configuration.
   * Each key is a device type, value is array of triggers.
   */
  device?: {
    keyboard?: ShortcutTriggerConfig[];
    mouse?: Array<
      | SwipeTriggerConfig 
      | CircleTriggerConfig 
      | PressTriggerConfig 
      | StrokeTriggerConfig 
      | WheelTriggerConfig
    >;
    touchpad?: Array<
      | SwipeTriggerConfig 
      | CircleTriggerConfig 
      | HoldTriggerConfig 
      | TapTriggerConfig 
      | ClickTriggerConfig 
      | StrokeTriggerConfig 
      | PinchTriggerConfig 
      | RotateTriggerConfig
    >;
    touchscreen?: Array<
      | SwipeTriggerConfig 
      | CircleTriggerConfig 
      | HoldTriggerConfig 
      | TapTriggerConfig 
      | StrokeTriggerConfig 
      | PinchTriggerConfig 
      | RotateTriggerConfig
    >;
  };
  
  /**
   * Device rules for conditional configuration.
   */
  device_rules?: DeviceRule[];
  
  /**
   * Additional settings.
   */
  settings?: {
    /**
     * Name of the active screen.
     * Used with $screen_name variable.
     */
    screen_name?: string;
  };
}

/**
 * Parsed trigger with resolved types
 * 
 * Used internally for UI representation.
 */
export interface ParsedTrigger {
  /** Device type this trigger belongs to */
  device: DeviceType;
  
  /** Original trigger configuration */
  config: TriggerConfig;
  
  /** Computed valid events for this trigger type */
  validEvents: TriggerEvent[];
  
  /** Computed required fields */
  requiredFields: string[];
  
  /** Computed optional fields */
  optionalFields: string[];
}

/**
 * Action with resolved type
 */
export interface ParsedAction {
  /** Original action configuration */
  config: Action;
  
  /** Resolved action type */
  type: 'input' | 'command' | 'plasma-shortcut' | 'replace-text' | 'sleep';
  
  /** Valid events for this action type */
  validEvents: TriggerEvent[];
}

// ============================================================================
// SECTION 8: UTILITY TYPES & CONSTANTS
// ============================================================================

/**
 * Time value format
 * 
 * Can be specified as:
 * - number: milliseconds
 * - string: with unit (e.g., "200ms", "1s", "500us")
 */
export type TimeValue = number | string;

/**
 * Threshold format
 * 
 * Can be:
 * - number: minimum threshold
 * - string: "min-max" range
 * - [min, max]: array format
 */
export type ThresholdValue = number | string | [number, number];

/**
 * Default values for device properties
 */
export const DEFAULT_DEVICE_PROPERTIES = {
  mouse: {
    motion_timeout: 200,
    motion_threshold: 10,
    press_timeout: 50,
    swipe: { angle_tolerance: 20 },
    unblock_buttons_on_timeout: true,
  },
  touchpad: {
    buttonpad: false,
    click_timeout: 200,
    handle_evdev_events: true,
    motion_threshold: 10,
    motion_threshold_2: 10,
    motion_threshold_3: 10,
    pressure_ranges: {
      finger: 0,
      thumb: 4294967295,
      palm: 4294967295,
    },
    swipe: { angle_tolerance: 20 },
  },
  touchscreen: {
    motion_threshold: 4,
    swipe: { angle_tolerance: 20 },
  },
} as const;

/**
 * Valid trigger events by trigger type
 */
export const TRIGGER_EVENTS: Record<TriggerType, TriggerEvent[]> = {
  [TriggerType.SHORTCUT]: [TriggerEvent.BEGIN, TriggerEvent.END, TriggerEvent.CANCEL],
  [TriggerType.CIRCLE]: [TriggerEvent.BEGIN, TriggerEvent.UPDATE, TriggerEvent.TICK, TriggerEvent.END, TriggerEvent.CANCEL],
  [TriggerType.CLICK]: [TriggerEvent.BEGIN, TriggerEvent.END, TriggerEvent.CANCEL],
  [TriggerType.HOLD]: [TriggerEvent.BEGIN, TriggerEvent.UPDATE, TriggerEvent.TICK, TriggerEvent.END, TriggerEvent.CANCEL],
  [TriggerType.PINCH]: [TriggerEvent.BEGIN, TriggerEvent.UPDATE, TriggerEvent.TICK, TriggerEvent.END, TriggerEvent.CANCEL],
  [TriggerType.PRESS]: [TriggerEvent.BEGIN, TriggerEvent.UPDATE, TriggerEvent.END, TriggerEvent.CANCEL],
  [TriggerType.ROTATE]: [TriggerEvent.BEGIN, TriggerEvent.UPDATE, TriggerEvent.TICK, TriggerEvent.END, TriggerEvent.CANCEL],
  [TriggerType.STROKE]: [TriggerEvent.BEGIN, TriggerEvent.UPDATE, TriggerEvent.TICK, TriggerEvent.END, TriggerEvent.CANCEL],
  [TriggerType.SWIPE]: [TriggerEvent.BEGIN, TriggerEvent.UPDATE, TriggerEvent.TICK, TriggerEvent.END, TriggerEvent.CANCEL],
  [TriggerType.TAP]: [TriggerEvent.BEGIN, TriggerEvent.END, TriggerEvent.CANCEL],
  [TriggerType.WHEEL]: [TriggerEvent.BEGIN, TriggerEvent.UPDATE, TriggerEvent.TICK, TriggerEvent.END, TriggerEvent.CANCEL],
};

/**
 * Triggers available per device type
 */
export const TRIGGERS_BY_DEVICE: Record<DeviceType, TriggerType[]> = {
  [DeviceType.KEYBOARD]: [TriggerType.SHORTCUT],
  [DeviceType.MOUSE]: [
    TriggerType.CIRCLE,
    TriggerType.PRESS,
    TriggerType.STROKE,
    TriggerType.SWIPE,
    TriggerType.WHEEL,
  ],
  [DeviceType.TOUCHPAD]: [
    TriggerType.CIRCLE,
    TriggerType.CLICK,
    TriggerType.HOLD,
    TriggerType.PINCH,
    TriggerType.ROTATE,
    TriggerType.STROKE,
    TriggerType.SWIPE,
    TriggerType.TAP,
  ],
  [DeviceType.TOUCHSCREEN]: [
    TriggerType.CIRCLE,
    TriggerType.HOLD,
    TriggerType.PINCH,
    TriggerType.ROTATE,
    TriggerType.STROKE,
    TriggerType.SWIPE,
    TriggerType.TAP,
  ],
};

/**
 * Required fields by trigger type
 */
export const REQUIRED_FIELDS: Partial<Record<TriggerType, (keyof TriggerConfig)[]>> = {
  [TriggerType.SHORTCUT]: ['keys'],
  [TriggerType.HOLD]: ['fingers'],
  [TriggerType.PINCH]: ['fingers'],
  [TriggerType.ROTATE]: ['fingers'],
};

/**
 * Validation error types
 */
export interface ValidationError {
  path: string;
  message: string;
  code: string;
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}