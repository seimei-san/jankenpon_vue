'use strict';

const app = Vue.createApp({
  data: () => ({
    local_storage_name: 'jankenpon',
    sub_title: '勝つのはどいつだ？',
    style_sub_title: { color: 'whilte'},
    style_winner_box: { left: '350px' },
    user_name: 'オマエ',

    oresama_result: 0,
    oresama_timestamp: 0,
    omae_result: 0,

    // dialog for name entry miss
    alert_dialog: false,

    // v-if: Shout Jan, Ken, Pon
    shout_jan: false,
    shout_ken: false,
    shout_pon: false,
    // v-if: Oresama Speaks
    oresama_speak1: false,
    oresama_speak2: false,
    // v-if Omae Speaks
    omae_speak1: false,
    omae_speak2: false,
    // v-if Oresama Gu, Choki, Pa
    oresama_gu: false,
    oresama_choki: false,
    oresama_pa: false,
    // v-if Omae Gu, Choki, Pa
    omae_gu: false,
    omae_choki: false,
    omae_pa: false,
    // v-if Atodashi No No
    atodashi_no: false,
    // v-if Winner Logo
    winner_box: false,

    // within Controller Box
    // v-if Start Box
    start_box: false,
    // v-if Challenge Box
    challenge_box: false,
    // v-if Again Box
    again_box:false,
    // v-if Gu Choki Pa Box
    gu_choki_pa_box: false,

    // Speak Boxes
    oresama_speak1_text: '',
    oresama_speak2_text: '',
    omae_speak1_text: '',
    omae_speak2_text: ''
  }),
  mounted() {
    if (localStorage.jankenpon) {
      this.user_name = JSON.parse(localStorage.jankenpon)["name"]
    } else {
      setLocalStrageByJson(default_jankenpon_json)
    }
    window.onload =  () => {  
      let user_info = JSON.parse(localStorage.jankenpon)
      this.user_name = user_info['name']
      const status = loadUserPoints(user_info)
      let round = status['count']
      if (round === max_round) {  // reached Max Round
        this.again_box = true

      } else if (round === 0) {   // not played before
        this.start_box = true
        this.oresama_speak1_text = 'オマエは誰だ？'
        this.oresama_speak2_text = '名前を入れろ！<br>始めるぞ！'
        this.omae_speak1_text = 'Vue.jsで勝負だ！'
        this.oresama_speak1 = true
        this.oresama_speak2 = true
        this.omae_speak1 = true
      } else {          // reloaded in the middle of challenge
        generateSpeakTextDuringChallenge(this.user_name);
        this.close_guchokipa()
        this.close_speaks()
        // this.start_box = false
        this.challenge_box = true
      }
    }
  },
  methods: {
    startJankenpon: function(){   // function called from Start Box
      setLocalStrageByJson(default_jankenpon_json)
      const input_user_name = document.getElementById('input_user_name')
      const regex = new RegExp(/^[^\x20-\x7e]{1,5}$/)
      let user_name = input_user_name.value;
      if (regex.test(user_name) === false) {  // User Name not satisfy the pattern
        this.alert_dialog = true
        input_user_name.value = "";
      } else {
        updateLocalStorage('name', user_name);
        generateSpeakTextDuringChallenge(user_name);
        this.oresama_speak1 = false
        this.oresama_speak2 = false
        this.omae_speak1 = false
        this.omae_speak2 = false
        this.start_box = false
        this.displayNotAtMaxRound()
      }       
    },
    btn_yes: function(){    // close Alert Dialg
      this.alert_dialog = false
    },


    // ############ Challenge Jankenpon ################
    challengeJankenpon: function(){   // function called from Challenge Box
      this.close_guchokipa(),
      this.close_winner_box(),
      this.close_speaks(),

      this.oresama_result = Math.ceil(Math.random() * 3),
      this.challenge_box = false,
      this.gu_choki_pa_box = true,
      // Shout Jan Ken Pon

      playVoice('jan.mp4'),
      this.shout_jan = true,
      this.promise_wait(shout_jankenpon_interval)
      .then(()=>{
        this.shout_jan = false
        this.promise_wait(shout_jankenpon_interval)
        .then(() => {
          this.shout_ken = true;
          playVoice('ken.mp4')
          this.promise_wait(shout_jankenpon_interval)
          .then(()=>{
            this.shout_ken = false
            this.promise_wait(shout_jankenpon_interval)
            .then(() => {
              this.shout_pon = true
              playVoice('pon.mp4')
              setTimeout(()=>{
                if (this.oresama_result === 1) {
                  this.oresama_gu = true     
                } else if (this.oresama_result === 2) {
                  this.oresama_choki = true
                } else if (this.oresama_result === 3) {
                  this.oresama_pa = true      
                }
                this.oresama_timestamp = performance.now();
              }, 100)
              this.promise_wait(shout_jankenpon_interval)
              .then(()=>{
                this.shout_pon = false
              })
            })
          })

        })
      })
    },

    // #########  Oma's Jankenpon Challenge   ###########
    omaeGu: function () {
      this.omae_result = 1
      this.omaeGuChokiPa_proc()
    },
    omaeChoki: function () {
      this.omae_result = 2
      this.omaeGuChokiPa_proc()
    },
    omaePa: function () {
      this.omae_result = 3
      this.omaeGuChokiPa_proc()
    },

    omaeGuChokiPa_proc(){
      this.omae_timestamp = performance.now()
      let gap_timestamp = this.omae_timestamp - this.oresama_timestamp
      if (this.omae_result === 1) {
        this.omae_gu = true
      } else if (this.omae_result === 2) {
        this.omae_choki = true
      } else if (this.omae_result === 3) {
        this.omae_pa = true
      }
      this.gu_choki_pa_box = false
      this.challenge_box = true
      if (gap_timestamp > atodashi_limit && this.oresama_timestamp != 0) {   // Warn Atodashi 
        this.promise_wait(1000)
        .then(()=>{
          this.atodashi_no = true
          this.promise_wait(500)
          .then(()=>{
            this.oresama_speak1 = true
            this.oresama_speak1_text = '後出しはなぁ、<br>ダメダ〜メ！'
          })
        })
      } else {
        let winner = judge_result(this.oresama_result, this.omae_result);
        let jankenpon_json = loadLocalStorage();
        this.user_name = jankenpon_json['name'];
        let round = jankenpon_json['count'];   
        if (winner === 'omae') {
          round++
          let key = 'point_round' + round;
          updateLocalStorage(key, 1);
          updateLocalStorage('count', round);
          updateScoreBoard(round, 1);         
          let omae_win_speak = selectSpeakTextDuringChallegne('omae');
          if (round < 5) {
            this.promise_wait(800).then(()=>{
              this.oresama_speak1_text = omae_win_speak[1]
              this.oresama_speak1 = true
              this.promise_wait(300).then(()=>{
                this.omae_speak1_text = omae_win_speak[0]
                this.omae_speak1 = true
              })
            })
          } else {
            this.promise_wait(200).then(()=>{
              this.challenge_box = false
              this.promise_wait(300).then(()=>{
                let omae_point = loadUserPoints(loadLocalStorage())
                this.displayAtMaxRound(omae_point["omae_win"], this.user_name, omae_point["omae_point"], omae_point["oresama_point"] )
                this.promise_wait(300).then(()=>{
                  if (omae_point['omae_win']) {
                    this.insertWinnerLogo('omae');
                  } else {
                    this.insertWinnerLogo('oresama');
                  }
                })
              })
            })
          }
        } else if (winner === 'oresama') {
          round ++;
          let key = 'point_round' + round;
          updateLocalStorage(key, -1);
          updateLocalStorage('count', round);
          updateScoreBoard(round, -1);
          let oresama_win_speak = selectSpeakTextDuringChallegne('oresama');
          if (round < 5) {
            this.promise_wait(800).then(()=>{
              this.oresama_speak1_text = oresama_win_speak[0]
              this.oresama_speak1 = true
              this.promise_wait(800).then(()=>{
                this.omae_speak1_text = oresama_win_speak[1]
                this.omae_speak1 = true
              })
            })
          } else {
            this.promise_wait(200).then(()=>{
              this.challenge_box = false
              this.promise_wait(300).then(()=>{
                let omae_point = loadUserPoints(loadLocalStorage())
                this.displayAtMaxRound(omae_point["omae_win"], this.user_name, omae_point["omae_point"], omae_point["oresama_point"] )
                this.promise_wait(300).then(()=>{
                  if (omae_point['omae_win']) {
                    this.insertWinnerLogo('omae');
                  } else {
                    this.insertWinnerLogo('oresama');
                  }
                })
              })
            })
          }           
        } else {  // Aiko!
          this.promise_wait(800).then(() => {
            this.oresama_speak1_text =  this.user_name + '、、、<br>しぶといヤツだ！'
            this.oresama_speak1 = true
            this.promise_wait(300).then(() => {
              this.oresama_speak2 = '勝負を続けろ！！！'
              this.promise_wait(400).then(() => {
                this.omae_speak1_text = "・・・・・"
                this.omae_speak1 = true
              })
            })
          })
        }
      }
    },

  // Again Challenge after reached Max Round  
    challengeJankenponAgain: function () {    
      this.style_sub_title = {color: 'white'}
      this.sub_title = '勝つのはどいつだ？？？'
      this.close_guchokipa()
      this.close_speaks()
      this.close_winner_box()
      let jankenpon_json = loadLocalStorage();
      this.user_name = jankenpon_json['name'];
      jankenpon_json = default_jankenpon_json;
      jankenpon_json['name'] = this.user_name;
      setLocalStrageByJson(jankenpon_json);
      loadUserPoints(jankenpon_json);
      this.again_box = false
      this.promise_wait(200).then(()=>{
        this.displayNotAtMaxRound()
      })
    },    

    // ########### Quit Jankenpon ################## 
    quitJankenponFromChallenge: function () {
      this.quiteJankenPon('challenge')
    },
    quitJankenponFromAgain: function () {
      this.quiteJankenPon('again')
    },

    quiteJankenPon(box) {
      this.style_sub_title = {color: 'white'}
      this.sub_title = '勝つのはどいつだ？？？'
      this.close_guchokipa()
      this.close_speaks()
      this.winner_box = false
      localStorage.removeItem('jankenpon')
      loadUserPoints(default_jankenpon_json)
      if (box === 'again') {
        this.again_box = false
      } else if (box === 'challenge') {
        this.challenge_box = false
      }
      this.promise_wait(1000).then(()=>{
        this.oresama_speak1_text = 'オマエは誰だ？'
        this.oresama_speak2_text = '名前を入れろ！<br>始めるぞ！'
        this.omae_speak1_text = 'Vue.jsで勝負だ！'
        this.oresama_speak1 = true
        this.oresama_speak2 = true
        this.omae_speak1 = true
        this.start_box = true
      })
    },


    // ######### common functions #################
    displayNotAtMaxRound() {
      this.style_sub_title = {color: 'white'}
      this.sub_title = '勝つのはどいつだ？？？'
      this.challenge_box = true
    },

    displayAtMaxRound (omae_win, tmp_user_name, omae_point, oresama_point) {
      if (omae_win) {
        this.style_sub_title = {color: 'blue'}
        this.sub_title = `${omae_point} 対 ${oresama_point} で${tmp_user_name}様の勝ち！！！`
        this.oresama_speak1_text = `${tmp_user_name}様<br>参りました！`
        this.oresama_speak1 = true
        this.promise_wait(800).then(() => {
          this.omae_speak1_text = "フッフッフッ<br>参ったか！"
          this.omae_speak1 = true
        })
      } else {
        this.style_sub_title = {color: 'red'}
        this.sub_title = `${omae_point} 対 ${oresama_point} でオレ様の勝ちだ！！！`
        this.oresama_speak1_text = "ワッハッハー！<br>オレ様の勝ちだ！" 
        this.oresama_speak1 = true
        this.promise_wait(800).then(()=>{
          this.omae_speak1_text = "・・・・"
          this.omae_speak1 = true
        })
      }
      this.again_box = true
    },

    insertWinnerLogo(winner) {
      this.promise_wait(300).then(()=>{
        if (winner === 'oresama') {
          this.winner_box = true
          playVoice('ohhh.m4a');
          this.style_winner_box = { left: '650px'}
        } else {
          this.winner_box = true
          playVoice('bravo.m4a');
          this.style_winner_box = { left: '250px'}
        }
      })
    },

    promise_wait (timeout) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve()
        }, timeout)

      })

    },

    close_guchokipa () {
      this.oresama_gu = false
      this.oresama_choki = false
      this.oresama_pa = false
      this.omae_gu = false
      this.omae_choki = false
      this.omae_pa = false
      this.atodashi_no = false
    },
    close_winner_box() {
      this.winner_box = false
    },
    close_speaks(){
      this.oresama_speak1 = false
      this.oresama_speak2 = false
      this.omae_speak1 = false     
      this.omae_speak2 = false     
    },

  }

})
app.mount('#app')


