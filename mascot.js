// Qabo — Sualtının maskotu. Dalğıc maskalı balaca balıq; şnorkeli sual işarəsi şəklindədir.
// mood: happy | think | wow | sad | party
window.mascot = function (mood = 'happy', extra = '') {
  const navy = '#0B2A5B';
  const eyes = {
    happy: `<g class="m-eyes"><circle cx="82" cy="101" r="8.5" fill="${navy}"/><circle cx="118" cy="101" r="8.5" fill="${navy}"/>
            <circle cx="85" cy="98" r="3" fill="#fff"/><circle cx="121" cy="98" r="3" fill="#fff"/></g>`,
    think: `<g class="m-eyes"><circle cx="86" cy="96" r="8" fill="${navy}"/><circle cx="122" cy="96" r="8" fill="${navy}"/>
            <circle cx="89" cy="93" r="2.8" fill="#fff"/><circle cx="125" cy="93" r="2.8" fill="#fff"/></g>`,
    wow:   `<g class="m-eyes"><circle cx="82" cy="101" r="10" fill="${navy}"/><circle cx="118" cy="101" r="10" fill="${navy}"/>
            <circle cx="86" cy="97" r="3.6" fill="#fff"/><circle cx="122" cy="97" r="3.6" fill="#fff"/></g>`,
    sad:   `<g class="m-eyes"><circle cx="82" cy="104" r="8" fill="${navy}"/><circle cx="118" cy="104" r="8" fill="${navy}"/>
            <circle cx="84" cy="101" r="2.6" fill="#fff"/><circle cx="120" cy="101" r="2.6" fill="#fff"/>
            <path d="M70 93 L91 88 M130 93 L109 88" stroke="${navy}" stroke-width="3" stroke-linecap="round"/></g>`,
    party: `<g class="m-eyes"><path d="M73 103 Q82 92 91 103" stroke="${navy}" stroke-width="5" fill="none" stroke-linecap="round"/>
            <path d="M109 103 Q118 92 127 103" stroke="${navy}" stroke-width="5" fill="none" stroke-linecap="round"/></g>`,
  }[mood];
  const mouth = {
    happy: `<path d="M86 140 Q100 156 114 140 Z" fill="${navy}"/><path d="M93 147 Q100 152 107 147" fill="#FF7A8A"/>`,
    think: `<path d="M92 146 Q101 141 110 145" stroke="${navy}" stroke-width="4" fill="none" stroke-linecap="round"/>`,
    wow:   `<ellipse cx="100" cy="146" rx="8" ry="10" fill="${navy}"/>`,
    sad:   `<path d="M88 150 Q100 140 112 150" stroke="${navy}" stroke-width="4" fill="none" stroke-linecap="round"/>`,
    party: `<path d="M82 138 Q100 164 118 138 Z" fill="${navy}"/><path d="M90 148 Q100 156 110 148" fill="#FF7A8A"/>`,
  }[mood];
  const finUp = mood === 'party' || mood === 'wow';
  return `<svg class="mascot mood-${mood} ${extra}" viewBox="0 0 200 210" aria-hidden="true">
    <g class="m-bubbles">
      <circle class="m-bub b1" cx="124" cy="24" r="6" fill="#fff" opacity=".85"/>
      <circle class="m-bub b2" cx="114" cy="10" r="3.5" fill="#fff" opacity=".7"/>
      <circle class="m-bub b3" cx="128" cy="4" r="2.5" fill="#fff" opacity=".6"/>
    </g>
    <g class="m-body">
      <path class="m-snorkel" d="M150 96 V74 C150 61 159 55 168 48 C182 37 179 15 160 12 C146 10 135 19 135 31"
            fill="none" stroke="#FF7A45" stroke-width="13" stroke-linecap="round"/>
      <path d="M150 96 V74 C150 61 159 55 168 48 C182 37 179 15 160 12 C146 10 135 19 135 31"
            fill="none" stroke="#fff" stroke-width="13" stroke-linecap="butt" stroke-dasharray="5 16" opacity=".35"/>
      <path d="M100 58 Q108 40 124 44 Q114 52 112 62 Z" fill="#1683E6"/>
      <ellipse class="m-fin m-fin-l" cx="36" cy="${finUp ? 104 : 134}" rx="20" ry="11" fill="#1683E6"
               transform="rotate(${finUp ? -55 : -25} 36 ${finUp ? 104 : 134})"/>
      <ellipse class="m-fin m-fin-r" cx="164" cy="${finUp ? 104 : 134}" rx="20" ry="11" fill="#1683E6"
               transform="rotate(${finUp ? 55 : 25} 164 ${finUp ? 104 : 134})"/>
      <ellipse cx="100" cy="124" rx="70" ry="64" fill="#2EA8FF"/>
      <ellipse cx="100" cy="153" rx="45" ry="30" fill="#C4EEFF"/>
      <circle cx="58" cy="86" r="5" fill="#86D6FF"/><circle cx="68" cy="72" r="3.5" fill="#86D6FF"/>
      <circle cx="142" cy="150" r="4" fill="#86D6FF"/>
      <rect x="28" y="97" width="144" height="10" rx="5" fill="${navy}"/>
      <rect x="50" y="76" width="100" height="50" rx="24" fill="#FFD43B" stroke="${navy}" stroke-width="4"/>
      <rect x="58" y="83" width="84" height="36" rx="18" fill="#E3F7FF"/>
      <path d="M64 92 Q66 86 74 86" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>
      ${eyes}
      <ellipse cx="64" cy="138" rx="9" ry="5.5" fill="#FF9DB0" opacity=".75"/>
      <ellipse cx="136" cy="138" rx="9" ry="5.5" fill="#FF9DB0" opacity=".75"/>
      ${mouth}
    </g>
  </svg>`;
};

// Loqo işarəsi: dairəvi okean fonunda Qabo
window.logoMark = function (size = 44) {
  return `<span class="logo-mark" style="width:${size}px;height:${size}px">${window.mascot('happy', 'in-logo')}</span>`;
};
