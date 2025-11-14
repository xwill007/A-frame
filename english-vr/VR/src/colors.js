// Palette for Karaoke VR UI
// This file exposes window.karaokeColors so components can standardize colors.
(function(){
    const c = {
        // primary accent (e.g., Play button)
        primary: '#060137',
        // button used for list items
        button: '#0008ff',
        // background panels
        background: '#454545',
        // main text color
        text: '#ffffff',
        // controls background (progress bar background)
        controlBg: '#101010',
        // progress line color
        progressLine: '#bbbbbb',
        // thumb color
        thumb: '#ffffff',
        // secondary control button color (back/forward)
        controlBtn: '#0008ff',
        // evaluate/danger color
        danger: '#ee0101'
    };
    try { window.karaokeColors = Object.assign({}, window.karaokeColors || {}, c); } catch(e) { console.warn('Could not set window.karaokeColors', e); }
})();
