export interface PlayerSettings {
  transpose: number;
  pitch: number;
  speed: number;
  loopStart: number;
  loopEnd: number;
  enabled: boolean;
}

export interface MediaState {
  currentTime: number;
  duration: number;
  paused: boolean;
}

export interface ExtensionMessage {
  type: 'UPDATE_SETTINGS';
  payload: Partial<PlayerSettings>;
}

export interface StateRequestMessage {
  type: 'GET_STATE';
}

export interface StateResponseMessage {
  type: 'STATE_UPDATE';
  payload: MediaState;
}

export type Message =
  | ExtensionMessage
  | StateRequestMessage
  | StateResponseMessage;
