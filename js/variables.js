'use strict';

// ########### Common Variables (Begin) #############################
const max_round = 5;
const shout_jankenpon_interval = 500;
const atodashi_limit = 500; // ms
const default_jankenpon_json = {'name': 'オマエ' , 'count': 0, 'point_round1': 0, 'point_round2': 0, 'point_round3': 0, 'point_round4': 0, 'point_round5': 0}
// const default_jankenpon_json = {'name': 'テスト' , 'count': 3, 'point_round1': 1, 'point_round2': 1, 'point_round3': -1, 'point_round4': 0, 'point_round5': 0}

// ############ Animation Parameters ##############
const remove_talks_duration = '1.0s';
const remove_button_duration = '0.8s';

// ############ Speak Texts during Challenge #################
let oresama_win_speak_text = "";
let omae_lose_speak_text = "";
let oresama_lose_speak_text = "";
let omae_win_speak_text = "";

// ########### Common Variables (End)  #############################
