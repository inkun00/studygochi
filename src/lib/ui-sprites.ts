/**
 * UI 스프라이트 경로 (public/sprites/ui)
 * 골든-오렌지 픽셀아트 스타일
 */

const base = '/sprites/ui';

export const UI_SPRITES = {
  panels: {
    panel1: `${base}/Panels/${encodeURIComponent('Panel 1.PNG')}`,
    panel2: `${base}/Panels/${encodeURIComponent('Panel 2.PNG')}`,
    panel3: `${base}/Panels/${encodeURIComponent('Panel 3.PNG')}`,
  },
  popups: {
    popup1: `${base}/Popups/${encodeURIComponent('Popup 1.PNG')}`,
    popup2: `${base}/Popups/${encodeURIComponent('Popup 2.PNG')}`,
    popup3: `${base}/Popups/${encodeURIComponent('Popup 3.PNG')}`,
  },
  buttons: {
    btn1: { normal: `${base}/Buttons/${encodeURIComponent('Button 1')}/1.PNG`, pressed: `${base}/Buttons/${encodeURIComponent('Button 1')}/2.PNG` },
    btn2: { normal: `${base}/Buttons/${encodeURIComponent('Button 2')}/1.PNG`, pressed: `${base}/Buttons/${encodeURIComponent('Button 2')}/2.PNG` },
    btn3: { normal: `${base}/Buttons/${encodeURIComponent('Button 3')}/1.PNG`, pressed: `${base}/Buttons/${encodeURIComponent('Button 3')}/2.PNG` },
    btn4: { normal: `${base}/Buttons/${encodeURIComponent('Button 4')}/1.PNG`, pressed: `${base}/Buttons/${encodeURIComponent('Button 4')}/2.PNG` },
    btn5: { normal: `${base}/Buttons/${encodeURIComponent('Button 5')}/1.PNG`, pressed: `${base}/Buttons/${encodeURIComponent('Button 5')}/2.PNG` },
    btn6: { normal: `${base}/Buttons/${encodeURIComponent('Button 6')}/1.PNG`, pressed: `${base}/Buttons/${encodeURIComponent('Button 6')}/2.PNG` },
  },
  bars: {
    bar1: {
      panel: `${base}/Bars/${encodeURIComponent('Bar 1')}/Panel.PNG`,
      colour: `${base}/Bars/${encodeURIComponent('Bar 1')}/Colour.PNG`,
      black: `${base}/Bars/${encodeURIComponent('Bar 1')}/Black.PNG`,
    },
    bar2: {
      panel: `${base}/Bars/${encodeURIComponent('Bar 2')}/Panel.PNG`,
      colour: `${base}/Bars/${encodeURIComponent('Bar 2')}/Colour.PNG`,
      black: `${base}/Bars/${encodeURIComponent('Bar 2')}/Black.PNG`,
    },
  },
  icons: {
    home: `${base}/Icons/Home.PNG`,
    cross: `${base}/Icons/Cross.PNG`,
    tick: `${base}/Icons/Tick.PNG`,
    info: `${base}/Icons/Info.PNG`,
    play: `${base}/Icons/Play.PNG`,
    pause: `${base}/Icons/Pause.PNG`,
    exit: `${base}/Icons/Exit.PNG`,
    save: `${base}/Icons/Save.PNG`,
    load: `${base}/Icons/Load.PNG`,
    options: `${base}/Icons/Options.PNG`,
    soundOn: `${base}/Icons/${encodeURIComponent('Sound On.PNG')}`,
    soundOff: `${base}/Icons/${encodeURIComponent('Sound Off.PNG')}`,
  },
} as const;
