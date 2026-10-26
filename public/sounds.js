/* نغمات الواجهة — تُولَّد برمجياً بـ Web Audio (بلا ملفات صوتية ولا اتصال بالإنترنت).
   التصميم: نبرات جيبية نقية بهجوم FM زجاجي قصير، سلّم بنتاتوني (مي ماجور) مريح، صدى ناعم وتأخير خفيف،
   ومضغوط/محدِّد في النهاية كي لا يعلو الصوت ولا يتشوّه. كل نغمة بين 0.9 و 2 ثانية. */
(function () {
  'use strict';
  var ctx = null, bus = null, send = null, last = {};
  var N = { E5: 659.25, F5s: 739.99, G5s: 830.61, A5: 880, B5: 987.77, C6s: 1108.73, E6: 1318.51 };
  /* [التردد، البداية(ث)، المدة(ث)، الشدة 0..1، التوزيع اليمين/اليسار -1..1] */
  var SND = {
    add:      [[N.E5, 0, 1.1, .8, -.2], [N.B5, .11, 1.1, .8, 0], [N.E6, .22, 1.3, .9, .2], [N.G5s, .22, .9, .35, -.1]],
    enter:    [[N.A5, 0, .9, .8, -.15], [N.E6, .14, 1.2, .9, .15]],
    finish:   [[N.E5, 0, 1, .7, -.25], [N.G5s, .09, 1, .75, -.08], [N.B5, .18, 1.1, .8, .08], [N.E6, .3, 1.5, .95, .25]],
    task:     [[N.B5, 0, .8, .85, -.2], [N.E6, .18, .9, .95, .2], [N.B5, .6, .7, .7, -.2], [N.E6, .78, 1, .8, .2]],
    taskdone: [[N.E5, 0, .8, .75, -.1], [N.B5, .1, 1.1, .85, .1]],
    skip:     [[N.A5, 0, .6, .85, -.15], [N.A5, .2, .6, .85, 0], [N.E6, .4, 1.5, 1, .15], [N.C6s, .4, 1.1, .45, -.1]],
    denied:   [[N.E6, 0, .7, .7, .15], [N.B5, .13, .7, .7, 0], [N.E5, .26, 1, .75, -.15]],
    turn:     [[N.E5, 0, .8, .8, -.2], [N.G5s, .1, .8, .8, -.07], [N.B5, .2, .9, .85, .07], [N.E6, .32, 1.2, 1, .2],
               [N.B5, .8, .7, .6, -.1], [N.E6, .95, .95, .7, .1]]
  };

  function build() {
    var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
    ctx = new AC();
    var comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18; comp.knee.value = 20; comp.ratio.value = 4; comp.attack.value = .004; comp.release.value = .25;
    var out = ctx.createGain(); out.gain.value = .85; comp.connect(out); out.connect(ctx.destination);
    bus = ctx.createGain(); bus.connect(comp);
    /* مرسل الصدى: تأخير خفيف بتغذية راجعة مُرشَّحة + رنين قصير ناعم */
    send = ctx.createGain(); send.gain.value = 1;
    var dly = ctx.createDelay(1), fb = ctx.createGain(), lp = ctx.createBiquadFilter(), dw = ctx.createGain();
    dly.delayTime.value = .19; fb.gain.value = .28; lp.type = 'lowpass'; lp.frequency.value = 3000; dw.gain.value = .22;
    send.connect(dly); dly.connect(lp); lp.connect(fb); fb.connect(dly); lp.connect(dw); dw.connect(comp);
    var len = Math.floor(ctx.sampleRate * .85), ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (var c = 0; c < 2; c++) {
      var d = ir.getChannelData(c), s = 0;
      for (var i = 0; i < len; i++) { s += ((Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2) - s) * .35; d[i] = s; }
    }
    var cv = ctx.createConvolver(), rw = ctx.createGain(); cv.buffer = ir; rw.gain.value = .3;
    send.connect(cv); cv.connect(rw); rw.connect(comp);
    return true;
  }

  function voice(f, at, dur, g, pan) {
    var t = ctx.currentTime + .03 + at, end = t + dur;
    var car = ctx.createOscillator(), mod = ctx.createOscillator(), mg = ctx.createGain(), hi = ctx.createOscillator(), hg = ctx.createGain(), env = ctx.createGain(), node = env;
    car.type = 'sine'; car.frequency.value = f;
    /* هجوم زجاجي: تضمين FM يتلاشى خلال ~0.2ث فتبقى نبرة جيبية نقية */
    mod.type = 'sine'; mod.frequency.value = f * 2; mg.gain.setValueAtTime(f * 1.5, t); mg.gain.exponentialRampToValueAtTime(.01, t + .2);
    mod.connect(mg); mg.connect(car.frequency);
    /* لمعان خفيف بالأوكتاف يتلاشى أسرع */
    hi.type = 'sine'; hi.frequency.value = f * 2; hg.gain.setValueAtTime(.16, t); hg.gain.exponentialRampToValueAtTime(.001, t + Math.min(dur, .5));
    hi.connect(hg); hg.connect(env); car.connect(env);
    var peak = .24 * g;
    env.gain.setValueAtTime(.0001, t); env.gain.linearRampToValueAtTime(peak, t + .008); env.gain.exponentialRampToValueAtTime(.0001, end);
    if (ctx.createStereoPanner) { var p = ctx.createStereoPanner(); p.pan.value = pan || 0; env.connect(p); node = p; }
    node.connect(bus); node.connect(send);
    car.start(t); mod.start(t); hi.start(t);
    car.stop(end + .05); mod.stop(end + .05); hi.stop(end + .05);
    car.onended = function () { try { node.disconnect(); env.disconnect(); } catch (e) {} };
  }

  function unlock() {
    try { if (!ctx && !build()) return false; if (ctx.state === 'suspended') ctx.resume(); return true; } catch (e) { return false; }
  }
  function play(name) {
    try {
      var seq = SND[name]; if (!seq || !unlock()) return;
      var now = Date.now(); if (last[name] && now - last[name] < 150) return; last[name] = now;   // يمنع تكرار الطنين المتزامن
      seq.forEach(function (n) { voice(n[0], n[1], n[2], n[3], n[4]); });
    } catch (e) {}
  }
  window.UISound = { play: play, unlock: unlock, names: Object.keys(SND), seq: SND };
})();
