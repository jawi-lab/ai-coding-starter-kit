/* @ds-bundle: {"format":4,"namespace":"MellonDesignSystem_495048","components":[{"name":"Avatar","sourcePath":"components/display/Avatar.jsx"},{"name":"AvatarStack","sourcePath":"components/display/AvatarStack.jsx"},{"name":"Badge","sourcePath":"components/display/Badge.jsx"},{"name":"Card","sourcePath":"components/display/Card.jsx"},{"name":"DateRangePill","sourcePath":"components/display/DateRangePill.jsx"},{"name":"KanbanCard","sourcePath":"components/display/KanbanCard.jsx"},{"name":"VoteCard","sourcePath":"components/display/VoteCard.jsx"},{"name":"Button","sourcePath":"components/forms/Button.jsx"},{"name":"CalendarExportButton","sourcePath":"components/forms/CalendarExportButton.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Chip","sourcePath":"components/forms/Chip.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"SegmentedControl","sourcePath":"components/forms/SegmentedControl.jsx"},{"name":"Stepper","sourcePath":"components/forms/Stepper.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"Sidebar","sourcePath":"components/navigation/Sidebar.jsx"},{"name":"TabBar","sourcePath":"components/navigation/TabBar.jsx"}],"sourceHashes":{"components/display/Avatar.jsx":"a59da3e52b65","components/display/AvatarStack.jsx":"7a101ed4e815","components/display/Badge.jsx":"02399b06ef38","components/display/Card.jsx":"413f35fd0727","components/display/DateRangePill.jsx":"f0b5c168b2ec","components/display/KanbanCard.jsx":"2c8232e0d040","components/display/VoteCard.jsx":"3604d796778c","components/forms/Button.jsx":"56cc5d7ad613","components/forms/CalendarExportButton.jsx":"be7e085d40fe","components/forms/Checkbox.jsx":"9a2218e6cb8b","components/forms/Chip.jsx":"edd40e07b219","components/forms/Input.jsx":"e35e0b1f80e7","components/forms/SegmentedControl.jsx":"f8358a58d42b","components/forms/Stepper.jsx":"420ac331ed2d","components/forms/Switch.jsx":"40fe637125cc","components/navigation/Sidebar.jsx":"0ff6865d0c77","components/navigation/TabBar.jsx":"2052bb1102a8","ui_kits/mellon-app/screens-main.jsx":"9a7ba4ff7f1c","ui_kits/mellon-app/screens-more.jsx":"09d0ac9149b7"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.MellonDesignSystem_495048 = window.MellonDesignSystem_495048 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/display/Avatar.jsx
try { (() => {
const TONES = {
  green: 'var(--green-700)',
  gold: 'var(--gold-500)',
  blush: 'var(--blush-500)',
  ink: 'var(--ink-600)'
};
function initialsOf(name = '') {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join('');
}
function Avatar({
  name = '',
  src,
  tone = 'green',
  size = 38,
  ringColor
}) {
  return /*#__PURE__*/React.createElement("span", {
    title: name,
    style: {
      width: size,
      height: size,
      flex: 'none',
      borderRadius: 'var(--radius-pill)',
      background: src ? `center/cover url(${src})` : TONES[tone] || TONES.green,
      color: '#fff',
      display: 'inline-grid',
      placeItems: 'center',
      fontFamily: 'var(--font-sans)',
      fontWeight: 800,
      fontSize: Math.round(size * 0.34),
      border: ringColor ? `2px solid ${ringColor}` : 'none',
      boxSizing: 'border-box'
    }
  }, !src && initialsOf(name));
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/display/AvatarStack.jsx
try { (() => {
function AvatarStack({
  people = [],
  size = 30,
  max = 4,
  ringColor = 'var(--bg)'
}) {
  const shown = people.slice(0, max);
  const rest = people.length - shown.length;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center'
    }
  }, shown.map((p, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      marginLeft: i === 0 ? 0 : -Math.round(size * 0.3),
      display: 'inline-flex'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Avatar, {
    name: p.name,
    src: p.src,
    tone: p.tone,
    size: size,
    ringColor: ringColor
  }))), rest > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: -Math.round(size * 0.3),
      width: size,
      height: size,
      borderRadius: 999,
      background: 'var(--surface-2)',
      border: `2px solid ${ringColor}`,
      boxSizing: 'border-box',
      display: 'inline-grid',
      placeItems: 'center',
      fontFamily: 'var(--font-sans)',
      fontSize: Math.round(size * 0.34),
      fontWeight: 700,
      color: 'var(--text-muted)'
    }
  }, "+", rest));
}
Object.assign(__ds_scope, { AvatarStack });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/AvatarStack.jsx", error: String((e && e.message) || e) }); }

// components/display/Badge.jsx
try { (() => {
const ROLES = {
  admin: {
    bg: 'var(--role-admin-soft)',
    fg: 'var(--role-admin)',
    label: 'Admin'
  },
  editor: {
    bg: 'var(--role-editor-soft)',
    fg: 'var(--role-editor)',
    label: 'Redakteur'
  },
  observer: {
    bg: 'var(--role-observer-soft)',
    fg: '#B06B54',
    label: 'Beobachter'
  },
  success: {
    bg: 'var(--success-soft)',
    fg: 'var(--success)'
  },
  warning: {
    bg: 'var(--warning-soft)',
    fg: 'var(--warning)'
  },
  error: {
    bg: 'var(--error-soft)',
    fg: 'var(--error)'
  },
  neutral: {
    bg: 'var(--surface-2)',
    fg: 'var(--text-muted)'
  }
};
function Badge({
  role = 'neutral',
  children
}) {
  const r = ROLES[role] || ROLES.neutral;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      background: r.bg,
      color: r.fg,
      borderRadius: 'var(--radius-pill)',
      padding: '4px 11px',
      fontFamily: 'var(--font-sans)',
      fontSize: 11,
      fontWeight: 800,
      letterSpacing: '0.04em',
      whiteSpace: 'nowrap'
    }
  }, children || r.label);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Badge.jsx", error: String((e && e.message) || e) }); }

// components/display/Card.jsx
try { (() => {
function Card({
  padding = 20,
  interactive = false,
  onClick,
  children,
  style
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      background: 'var(--surface)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: interactive && hover ? 'var(--shadow-md)' : 'var(--shadow-sm)',
      border: '1px solid var(--line)',
      padding,
      cursor: interactive ? 'pointer' : 'default',
      transition: 'box-shadow var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out)',
      transform: interactive && hover ? 'translateY(-1px)' : 'none',
      fontFamily: 'var(--font-sans)',
      ...style
    }
  }, children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Card.jsx", error: String((e && e.message) || e) }); }

// components/display/DateRangePill.jsx
try { (() => {
const STATUS = {
  'zu_planen': {
    dot: 'var(--status-zu-planen)',
    label: 'Zu Planen'
  },
  'in_planung': {
    dot: 'var(--status-in-planung)',
    label: 'In Planung'
  },
  'planung_abgeschlossen': {
    dot: 'var(--status-abgestimmt)',
    label: 'Planung abgeschlossen'
  },
  'abgeschlossen': {
    dot: 'var(--status-abgeschlossen)',
    label: 'Abgeschlossen'
  }
};

/** Zeitraum-Pill (Kalender-Icon + Datum) oder Status-Pill (Dot + Label). */
function DateRangePill({
  range,
  status,
  onDark = false
}) {
  if (status) {
    const s = STATUS[status] || STATUS.zu_planen;
    return /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontFamily: 'var(--font-sans)',
        fontSize: 11.5,
        fontWeight: 700,
        borderRadius: 'var(--radius-pill)',
        padding: '5px 11px',
        background: onDark ? 'var(--glass-fill-dark)' : 'var(--surface-2)',
        color: onDark ? '#fff' : 'var(--text-muted)',
        backdropFilter: onDark ? 'var(--glass-blur)' : 'none',
        WebkitBackdropFilter: onDark ? 'var(--glass-blur)' : 'none'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 7,
        height: 7,
        borderRadius: 99,
        background: s.dot
      }
    }), s.label);
  }
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      fontFamily: 'var(--font-sans)',
      fontSize: 11.5,
      fontWeight: 700,
      borderRadius: 'var(--radius-pill)',
      padding: '5px 11px',
      background: onDark ? 'var(--glass-fill-dark)' : 'var(--primary-soft)',
      color: onDark ? '#fff' : 'var(--primary)',
      backdropFilter: onDark ? 'var(--glass-blur)' : 'none',
      WebkitBackdropFilter: onDark ? 'var(--glass-blur)' : 'none'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.4",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "4",
    width: "18",
    height: "18",
    rx: "4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M16 2v4M8 2v4M3 10h18"
  })), range);
}
Object.assign(__ds_scope, { DateRangePill });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/DateRangePill.jsx", error: String((e && e.message) || e) }); }

// components/display/KanbanCard.jsx
try { (() => {
/** Kanban-Karte: Cover-Strip, Serif-Titel, Initiator, Zeitraum, optional Fortschritt. */
function KanbanCard({
  title,
  cover = 'var(--cover-green)',
  coverSrc,
  initiator = '',
  initiatorTone = 'green',
  range,
  progress,
  onClick
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      background: 'var(--surface)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--line)',
      boxShadow: hover ? 'var(--shadow-md)' : 'var(--shadow-sm)',
      overflow: 'hidden',
      cursor: 'pointer',
      transform: hover ? 'translateY(-1px)' : 'none',
      transition: 'box-shadow var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out)',
      fontFamily: 'var(--font-sans)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 68,
      background: coverSrc ? `center/cover url(${coverSrc})` : cover
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 14px 14px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-serif-display)',
      fontWeight: 500,
      fontSize: 16.5,
      lineHeight: 1.25,
      letterSpacing: 'var(--tracking-tight)',
      marginBottom: 9
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, initiator && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 12,
      fontWeight: 600,
      color: 'var(--text-muted)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Avatar, {
    name: initiator,
    tone: initiatorTone,
    size: 20
  }), initiator.split(' ')[0]), range && /*#__PURE__*/React.createElement(__ds_scope.DateRangePill, {
    range: range
  })), progress && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginTop: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 4,
      borderRadius: 99,
      background: 'var(--surface-2)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: `${Math.min(100, progress.done / progress.total * 100)}%`,
      height: '100%',
      background: 'var(--accent-deep)',
      borderRadius: 99
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11.5,
      fontWeight: 700,
      color: 'var(--text-faint)'
    }
  }, progress.done, "/", progress.total))));
}
Object.assign(__ds_scope, { KanbanCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/KanbanCard.jsx", error: String((e && e.message) || e) }); }

// components/display/VoteCard.jsx
try { (() => {
const Heart = ({
  filled
}) => /*#__PURE__*/React.createElement("svg", {
  width: "20",
  height: "20",
  viewBox: "0 0 24 24",
  fill: filled ? 'currentColor' : 'none',
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, /*#__PURE__*/React.createElement("path", {
  d: "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
}));

/** Vorschlags-Karte mit Cover, Serif-Titel, Vote-Fortschritt und Herz-Button. */
function VoteCard({
  title,
  cover = 'var(--cover-green)',
  coverSrc,
  category,
  initiator = '',
  votes = 0,
  needed = 5,
  voted,
  defaultVoted = false,
  onVote
}) {
  const [internal, setInternal] = React.useState(defaultVoted);
  const isVoted = voted !== undefined ? voted : internal;
  const count = votes + (voted === undefined && internal && !defaultVoted ? 1 : 0);
  const pct = Math.min(100, Math.round(count / needed * 100));
  const toggle = () => {
    if (voted === undefined) setInternal(!isVoted);
    if (onVote) onVote(!isVoted);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--line)',
      boxShadow: 'var(--shadow-sm)',
      padding: 14,
      display: 'flex',
      gap: 14,
      alignItems: 'center',
      fontFamily: 'var(--font-sans)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 64,
      height: 64,
      flex: 'none',
      borderRadius: 'var(--radius-md)',
      background: coverSrc ? `center/cover url(${coverSrc})` : cover
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-display-sm)',
      fontFamily: 'var(--font-serif-display)',
      letterSpacing: 'var(--tracking-tight)',
      display: '-webkit-box',
      WebkitBoxOrient: 'vertical',
      WebkitLineClamp: 2,
      overflow: 'hidden'
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      fontWeight: 500,
      color: 'var(--text-faint)',
      margin: '3px 0 9px'
    }
  }, category, category && initiator ? ' · ' : '', initiator && `von ${initiator}`), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 9
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 5,
      borderRadius: 99,
      background: 'var(--surface-2)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: `${pct}%`,
      height: '100%',
      borderRadius: 99,
      background: pct >= 100 ? 'var(--success)' : 'var(--primary)',
      transition: 'width var(--dur-base) var(--ease-out)'
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: pct >= 100 ? 'var(--success)' : 'var(--text-muted)'
    }
  }, count, "/", needed))), /*#__PURE__*/React.createElement("button", {
    onClick: toggle,
    "aria-pressed": isVoted,
    style: {
      width: 48,
      height: 48,
      flex: 'none',
      borderRadius: 999,
      border: 'none',
      cursor: 'pointer',
      background: isVoted ? 'var(--primary)' : 'var(--surface)',
      color: isVoted ? '#fff' : 'var(--blush-500)',
      boxShadow: 'var(--shadow-float)',
      display: 'grid',
      placeItems: 'center',
      transition: 'background var(--dur-base) var(--ease-spring), color var(--dur-base) var(--ease-spring), transform var(--dur-base) var(--ease-spring)'
    }
  }, /*#__PURE__*/React.createElement(Heart, {
    filled: isVoted
  })));
}
Object.assign(__ds_scope, { VoteCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/VoteCard.jsx", error: String((e && e.message) || e) }); }

// components/forms/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const SIZES = {
  sm: {
    padding: '9px 18px',
    fontSize: 13.5
  },
  md: {
    padding: '13px 26px',
    fontSize: 15.5
  },
  lg: {
    padding: '17px 34px',
    fontSize: 17
  }
};
const VARIANTS = {
  primary: {
    background: 'var(--primary)',
    color: '#fff',
    border: '1.5px solid transparent'
  },
  secondary: {
    background: 'var(--surface)',
    color: 'var(--text-body)',
    border: '1.5px solid var(--line-strong)'
  },
  ghost: {
    background: 'transparent',
    color: 'var(--primary)',
    border: '1.5px solid transparent'
  },
  destructive: {
    background: 'transparent',
    color: 'var(--error)',
    border: '1.5px solid var(--error)'
  }
};
const HOVER = {
  primary: {
    background: 'var(--primary-hover)'
  },
  secondary: {
    background: 'var(--cream-100)'
  },
  ghost: {
    background: 'var(--primary-soft)'
  },
  destructive: {
    background: 'var(--error)',
    color: '#fff'
  }
};
function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  icon = null,
  children,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const v = VARIANTS[variant] || VARIANTS.primary;
  const s = SIZES[size] || SIZES.md;
  return /*#__PURE__*/React.createElement("button", _extends({
    disabled: disabled,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setPress(false);
    },
    onMouseDown: () => setPress(true),
    onMouseUp: () => setPress(false),
    style: {
      display: fullWidth ? 'flex' : 'inline-flex',
      width: fullWidth ? '100%' : undefined,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      fontFamily: 'var(--font-sans)',
      fontWeight: 600,
      letterSpacing: '0.005em',
      borderRadius: 'var(--radius-pill)',
      cursor: disabled ? 'default' : 'pointer',
      transition: 'transform var(--dur-fast) var(--ease-out), background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out)',
      transform: press && !disabled ? 'scale(var(--press-scale))' : 'none',
      opacity: disabled ? 0.4 : 1,
      ...v,
      ...(hover && !disabled ? HOVER[variant] : null),
      ...s,
      ...style
    }
  }, rest), icon, children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Button.jsx", error: String((e && e.message) || e) }); }

// components/forms/CalendarExportButton.jsx
try { (() => {
const CalIcon = ({
  size = 18
}) => /*#__PURE__*/React.createElement("svg", {
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, /*#__PURE__*/React.createElement("rect", {
  x: "3",
  y: "4",
  width: "18",
  height: "18",
  rx: "4"
}), /*#__PURE__*/React.createElement("path", {
  d: "M16 2v4M8 2v4M3 10h18"
}));
const CheckIcon = ({
  size = 18
}) => /*#__PURE__*/React.createElement("svg", {
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2.4",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, /*#__PURE__*/React.createElement("path", {
  d: "M20 6 9 17l-5-5"
}));

/** Kalender-Export mit 3 Zuständen: 'add' | 'added' | 'connect' */
function CalendarExportButton({
  state = 'add',
  fullWidth = true,
  onClick
}) {
  const [press, setPress] = React.useState(false);
  const base = {
    display: fullWidth ? 'flex' : 'inline-flex',
    width: fullWidth ? '100%' : undefined,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    fontFamily: 'var(--font-sans)',
    fontWeight: 600,
    fontSize: 15.5,
    borderRadius: 'var(--radius-pill)',
    padding: '14px 26px',
    border: '1.5px solid transparent',
    cursor: 'pointer',
    transition: 'transform var(--dur-fast) var(--ease-out)',
    transform: press ? 'scale(var(--press-scale))' : 'none'
  };
  const byState = {
    add: {
      background: 'var(--primary)',
      color: '#fff'
    },
    added: {
      background: 'var(--success-soft)',
      color: 'var(--success)',
      cursor: 'default'
    },
    connect: {
      background: 'var(--surface)',
      color: 'var(--text-body)',
      border: '1.5px solid var(--line-strong)'
    }
  };
  const label = state === 'added' ? 'Im Kalender' : state === 'connect' ? 'Kalender verbinden' : 'Zu meinem Kalender hinzufügen';
  return /*#__PURE__*/React.createElement("button", {
    onMouseDown: () => setPress(true),
    onMouseUp: () => setPress(false),
    onMouseLeave: () => setPress(false),
    onClick: onClick,
    style: {
      ...base,
      ...byState[state]
    }
  }, state === 'added' ? /*#__PURE__*/React.createElement(CheckIcon, null) : /*#__PURE__*/React.createElement(CalIcon, null), label);
}
Object.assign(__ds_scope, { CalendarExportButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/CalendarExportButton.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function Checkbox({
  checked,
  defaultChecked = false,
  onChange,
  label,
  disabled = false
}) {
  const [internal, setInternal] = React.useState(defaultChecked);
  const isOn = checked !== undefined ? checked : internal;
  const toggle = () => {
    if (disabled) return;
    if (checked === undefined) setInternal(!isOn);
    if (onChange) onChange(!isOn);
  };
  return /*#__PURE__*/React.createElement("label", {
    onClick: toggle,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 11,
      cursor: disabled ? 'default' : 'pointer',
      fontFamily: 'var(--font-sans)',
      opacity: disabled ? 0.4 : 1,
      userSelect: 'none'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 22,
      height: 22,
      flex: 'none',
      borderRadius: 7,
      display: 'grid',
      placeItems: 'center',
      border: `2px solid ${isOn ? 'var(--primary)' : 'var(--line-strong)'}`,
      background: isOn ? 'var(--primary)' : 'var(--surface)',
      transition: 'background var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out)'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "13",
    height: "13",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "#fff",
    strokeWidth: "3.4",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: {
      opacity: isOn ? 1 : 0,
      transform: isOn ? 'scale(1)' : 'scale(.6)',
      transition: 'all var(--dur-base) var(--ease-spring)'
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M20 6 9 17l-5-5"
  }))), label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15,
      color: 'var(--text-body)'
    }
  }, label));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Chip.jsx
try { (() => {
function Chip({
  active = false,
  onClick,
  icon = null,
  children
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 7,
      fontFamily: 'var(--font-sans)',
      fontSize: 13,
      fontWeight: 700,
      borderRadius: 'var(--radius-pill)',
      padding: '8px 15px',
      cursor: 'pointer',
      border: `1.5px solid ${active ? 'var(--primary)' : 'var(--line-strong)'}`,
      background: active ? 'var(--primary)' : hover ? 'var(--cream-100)' : 'var(--surface)',
      color: active ? '#fff' : 'var(--text-muted)',
      transition: 'background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out)',
      whiteSpace: 'nowrap'
    }
  }, icon, children);
}
Object.assign(__ds_scope, { Chip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Chip.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Input({
  label,
  helper,
  error,
  type = 'text',
  placeholder,
  value,
  onChange,
  multiline = false,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const border = error ? 'var(--error)' : focus ? 'var(--primary)' : 'var(--line-strong)';
  const ring = focus ? error ? '0 0 0 3px var(--error-soft)' : '0 0 0 3px var(--primary-soft)' : 'none';
  const field = {
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: 'var(--font-sans)',
    fontSize: 15.5,
    color: 'var(--text-body)',
    background: 'var(--surface)',
    border: `1.5px solid ${border}`,
    borderRadius: 'var(--radius-md)',
    padding: '13px 16px',
    outline: 'none',
    boxShadow: ring,
    transition: 'border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)',
    resize: 'vertical'
  };
  const shared = {
    placeholder,
    value,
    onChange,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: field,
    ...rest
  };
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 7,
      fontFamily: 'var(--font-sans)',
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--text-muted)'
    }
  }, label), multiline ? /*#__PURE__*/React.createElement("textarea", _extends({
    rows: 3
  }, shared)) : /*#__PURE__*/React.createElement("input", _extends({
    type: type
  }, shared)), (error || helper) && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 500,
      color: error ? 'var(--error)' : 'var(--text-faint)'
    }
  }, error || helper));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/SegmentedControl.jsx
try { (() => {
function SegmentedControl({
  options = [],
  value,
  defaultValue,
  onChange
}) {
  const [internal, setInternal] = React.useState(defaultValue !== undefined ? defaultValue : options[0] && options[0].value);
  const active = value !== undefined ? value : internal;
  const pick = v => {
    if (value === undefined) setInternal(v);
    if (onChange) onChange(v);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 3,
      background: 'var(--surface-2)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--radius-pill)',
      padding: 4,
      fontFamily: 'var(--font-sans)'
    }
  }, options.map(o => {
    const on = o.value === active;
    return /*#__PURE__*/React.createElement("button", {
      key: o.value,
      onClick: () => pick(o.value),
      style: {
        flex: 1,
        border: 'none',
        borderRadius: 'var(--radius-pill)',
        padding: '9px 16px',
        fontFamily: 'inherit',
        fontSize: 13,
        fontWeight: 700,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        background: on ? 'var(--primary)' : 'transparent',
        color: on ? '#fff' : 'var(--text-muted)',
        boxShadow: on ? 'var(--shadow-sm)' : 'none',
        transition: 'background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out)'
      }
    }, o.label);
  }));
}
Object.assign(__ds_scope, { SegmentedControl });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/SegmentedControl.jsx", error: String((e && e.message) || e) }); }

// components/forms/Stepper.jsx
try { (() => {
function Stepper({
  value,
  defaultValue = 3,
  min = 1,
  max = 20,
  onChange,
  label
}) {
  const [internal, setInternal] = React.useState(defaultValue);
  const n = value !== undefined ? value : internal;
  const set = next => {
    const clamped = Math.min(max, Math.max(min, next));
    if (value === undefined) setInternal(clamped);
    if (onChange) onChange(clamped);
  };
  const btn = disabled => ({
    width: 40,
    height: 40,
    border: 'none',
    borderRadius: 'var(--radius-pill)',
    background: 'var(--surface-2)',
    color: 'var(--text-body)',
    cursor: disabled ? 'default' : 'pointer',
    display: 'grid',
    placeItems: 'center',
    opacity: disabled ? 0.35 : 1,
    transition: 'background var(--dur-fast) var(--ease-out)'
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      background: 'var(--surface)',
      border: '1.5px solid var(--line-strong)',
      borderRadius: 'var(--radius-pill)',
      padding: 5,
      fontFamily: 'var(--font-sans)'
    }
  }, /*#__PURE__*/React.createElement("button", {
    "aria-label": "weniger",
    onClick: () => set(n - 1),
    style: btn(n <= min)
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.4",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 12h14"
  }))), /*#__PURE__*/React.createElement("span", {
    style: {
      minWidth: 56,
      textAlign: 'center',
      fontSize: 18,
      fontWeight: 800
    }
  }, n, label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      color: 'var(--text-faint)',
      display: 'block',
      lineHeight: 1.1
    }
  }, label)), /*#__PURE__*/React.createElement("button", {
    "aria-label": "mehr",
    onClick: () => set(n + 1),
    style: btn(n >= max)
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.4",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 12h14M12 5v14"
  }))));
}
Object.assign(__ds_scope, { Stepper });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Stepper.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
function Switch({
  checked,
  defaultChecked = false,
  onChange,
  disabled = false
}) {
  const [internal, setInternal] = React.useState(defaultChecked);
  const isOn = checked !== undefined ? checked : internal;
  const toggle = () => {
    if (disabled) return;
    if (checked === undefined) setInternal(!isOn);
    if (onChange) onChange(!isOn);
  };
  return /*#__PURE__*/React.createElement("button", {
    onClick: toggle,
    "aria-checked": isOn,
    role: "switch",
    disabled: disabled,
    style: {
      width: 48,
      height: 29,
      flex: 'none',
      borderRadius: 'var(--radius-pill)',
      border: 'none',
      padding: 0,
      background: isOn ? 'var(--success)' : 'var(--line-strong)',
      position: 'relative',
      cursor: disabled ? 'default' : 'pointer',
      opacity: disabled ? 0.4 : 1,
      transition: 'background var(--dur-base) var(--ease-out)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 3,
      left: isOn ? 22 : 3,
      width: 23,
      height: 23,
      borderRadius: 99,
      background: '#fff',
      boxShadow: 'var(--shadow-sm)',
      transition: 'left var(--dur-base) var(--ease-spring)'
    }
  }));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Sidebar.jsx
try { (() => {
/** Desktop-Sidebar: Gruppen-Switcher, Navigation, User-Card. */
function Sidebar({
  groupName = 'Meine Gruppe',
  items = [],
  active,
  onChange,
  user = {
    name: 'Du'
  },
  width = 248
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width,
      flex: 'none',
      minHeight: '100%',
      boxSizing: 'border-box',
      background: 'var(--surface)',
      borderRight: '1px solid var(--line)',
      display: 'flex',
      flexDirection: 'column',
      padding: 14,
      fontFamily: 'var(--font-sans)'
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      width: '100%',
      border: '1px solid var(--line)',
      background: 'var(--bg)',
      borderRadius: 'var(--radius-md)',
      padding: '10px 12px',
      cursor: 'pointer',
      fontFamily: 'inherit',
      textAlign: 'left',
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 30,
      height: 30,
      borderRadius: 10,
      background: 'var(--cover-green)',
      flex: 'none'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontSize: 14,
      fontWeight: 700,
      color: 'var(--text-body)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, groupName), /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--text-faint)",
    strokeWidth: "2.4",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "m7 15 5 5 5-5M7 9l5-5 5 5"
  }))), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 3,
      flex: 1
    }
  }, items.map(it => {
    const on = it.id === active;
    return /*#__PURE__*/React.createElement("button", {
      key: it.id,
      onClick: () => onChange && onChange(it.id),
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        border: 'none',
        cursor: 'pointer',
        background: on ? 'var(--primary-soft)' : 'transparent',
        color: on ? 'var(--primary)' : 'var(--text-muted)',
        borderRadius: 'var(--radius-md)',
        padding: '11px 13px',
        fontFamily: 'inherit',
        fontSize: 14,
        fontWeight: on ? 700 : 600,
        textAlign: 'left',
        transition: 'background var(--dur-fast) var(--ease-out)'
      }
    }, it.icon, it.label, it.count != null && /*#__PURE__*/React.createElement("span", {
      style: {
        marginLeft: 'auto',
        fontSize: 11.5,
        fontWeight: 800,
        background: on ? 'var(--primary)' : 'var(--surface-2)',
        color: on ? '#fff' : 'var(--text-faint)',
        borderRadius: 99,
        padding: '2px 8px'
      }
    }, it.count));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      borderTop: '1px solid var(--line)',
      paddingTop: 14,
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Avatar, {
    name: user.name,
    src: user.src,
    tone: user.tone || 'gold',
    size: 34
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      fontWeight: 700,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflowY: 'ellipsis',
      textOverflow: 'ellipsis'
    }
  }, user.name), user.meta && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: 'var(--text-faint)',
      fontWeight: 500
    }
  }, user.meta))));
}
Object.assign(__ds_scope, { Sidebar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Sidebar.jsx", error: String((e && e.message) || e) }); }

// components/navigation/TabBar.jsx
try { (() => {
/** Schwebende Liquid-Glass-Tab-Bar (iOS) mit zentralem FAB. */
function TabBar({
  items = [],
  active,
  onChange,
  onFab,
  fabLabel = 'Neuer Vorschlag'
}) {
  const half = Math.ceil(items.length / 2);
  const renderItem = it => {
    const on = it.id === active;
    return /*#__PURE__*/React.createElement("button", {
      key: it.id,
      onClick: () => onChange && onChange(it.id),
      "aria-label": it.label,
      style: {
        flex: 1,
        minWidth: 56,
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
        padding: '9px 2px',
        color: on ? 'var(--primary)' : 'var(--text-faint)',
        fontFamily: 'var(--font-sans)',
        transition: 'color var(--dur-fast) var(--ease-out)'
      }
    }, it.icon, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10.5,
        fontWeight: on ? 700 : 600
      }
    }, it.label));
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      padding: '4px 10px',
      background: 'var(--glass-fill)',
      border: '1px solid var(--glass-stroke)',
      backdropFilter: 'var(--glass-blur)',
      WebkitBackdropFilter: 'var(--glass-blur)',
      borderRadius: 'var(--radius-pill)',
      boxShadow: 'var(--glass-shadow)'
    }
  }, items.slice(0, half).map(renderItem), /*#__PURE__*/React.createElement("button", {
    onClick: onFab,
    "aria-label": fabLabel,
    style: {
      width: 54,
      height: 54,
      flex: 'none',
      margin: '0 6px',
      borderRadius: 999,
      border: 'none',
      background: 'var(--primary)',
      color: '#fff',
      cursor: 'pointer',
      display: 'grid',
      placeItems: 'center',
      boxShadow: 'var(--shadow-float)',
      transform: 'translateY(-10px)',
      transition: 'background var(--dur-fast) var(--ease-out)'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.4",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 12h14M12 5v14"
  }))), items.slice(half).map(renderItem));
}
Object.assign(__ds_scope, { TabBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/TabBar.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mellon-app/screens-main.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Mellon App — Screens Teil 1: Übersicht (Vorschläge) & Board (Kanban)
const {
  VoteCard,
  KanbanCard,
  Chip,
  Avatar,
  AvatarStack,
  DateRangePill,
  Badge
} = window.MellonDesignSystem_495048;
const ACTIVITIES = [{
  id: 1,
  title: 'Silvester in Dänemark',
  category: 'Längerer Zeitraum',
  initiator: 'Lena',
  votes: 3,
  needed: 5,
  cover: 'var(--cover-blush)'
}, {
  id: 2,
  title: 'Klettern im Kletterzentrum',
  category: 'Spontan',
  initiator: 'Jonas',
  votes: 4,
  needed: 4,
  cover: 'var(--cover-green)'
}, {
  id: 3,
  title: 'Hüttenwochenende im Allgäu',
  category: 'Wochenende',
  initiator: 'Mia',
  votes: 2,
  needed: 6,
  cover: 'var(--cover-gold)'
}, {
  id: 4,
  title: 'Flohmarkt & Frühstück',
  category: 'Spontan',
  initiator: 'Tim',
  votes: 1,
  needed: 3,
  cover: 'var(--cover-ink)'
}];
function ScreenHeader({
  title,
  subtitle
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '18px 20px 12px',
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-title)'
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-caption)',
      color: 'var(--text-faint)',
      marginTop: 2
    }
  }, subtitle)), /*#__PURE__*/React.createElement(Avatar, {
    name: "Lena Fischer",
    tone: "gold",
    size: 38
  }));
}
function UebersichtScreen() {
  const [filter, setFilter] = React.useState('alle');
  const list = ACTIVITIES.filter(a => filter === 'alle' || a.category === filter);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(ScreenHeader, {
    title: "WG-Crew",
    subtitle: "6 Mitglieder \xB7 4 offene Vorschl\xE4ge"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '0 20px 14px',
      borderRadius: 'var(--photo-radius)',
      overflow: 'hidden',
      position: 'relative',
      height: 150,
      background: 'var(--cover-green)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'var(--photo-protect)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 18,
      bottom: 14,
      color: '#fff'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-serif-display)',
      fontSize: 23,
      fontWeight: 500,
      letterSpacing: 'var(--tracking-tight)'
    }
  }, "Fast geschafft: Klettern!"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      fontWeight: 600,
      opacity: .85,
      marginTop: 3
    }
  }, "Die Upvote-Schwelle ist erreicht \u2014 ab in die Planung.")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 12,
      right: 12
    }
  }, /*#__PURE__*/React.createElement(DateRangePill, {
    range: "4/4 Stimmen",
    onDark: true
  }))), /*#__PURE__*/React.createElement("div", {
    className: "no-scrollbar",
    style: {
      display: 'flex',
      gap: 8,
      padding: '0 20px 14px',
      overflowX: 'auto'
    }
  }, ['alle', 'Spontan', 'Wochenende', 'Längerer Zeitraum'].map(f => /*#__PURE__*/React.createElement(Chip, {
    key: f,
    active: filter === f,
    onClick: () => setFilter(f)
  }, f === 'alle' ? 'Alle' : f))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      padding: '0 20px'
    }
  }, list.map(a => /*#__PURE__*/React.createElement(VoteCard, _extends({
    key: a.id
  }, a, {
    defaultVoted: a.id === 2
  })))));
}
const COLUMNS = [{
  status: 'zu_planen',
  label: 'Zu Planen',
  cards: [{
    title: 'Klettern im Kletterzentrum',
    initiator: 'Jonas Weber',
    initiatorTone: 'green',
    cover: 'var(--cover-green)'
  }]
}, {
  status: 'in_planung',
  label: 'In Planung',
  cards: [{
    title: 'Hüttenwochenende im Allgäu',
    initiator: 'Mia Krüger',
    initiatorTone: 'blush',
    range: '12.–14. Sep',
    progress: {
      done: 2,
      total: 6
    },
    cover: 'var(--cover-gold)'
  }, {
    title: 'Kanutour an der Isar',
    initiator: 'Tim Brandt',
    initiatorTone: 'ink',
    range: 'Aug',
    progress: {
      done: 1,
      total: 4
    },
    cover: 'var(--cover-ink)'
  }]
}, {
  status: 'planung_abgeschlossen',
  label: 'Planung abgeschlossen',
  cards: [{
    title: 'Konzert: Open Air',
    initiator: 'Lena Fischer',
    initiatorTone: 'gold',
    range: 'Sa, 26. Jul',
    cover: 'var(--cover-blush)'
  }]
}, {
  status: 'abgeschlossen',
  label: 'Abgeschlossen',
  cards: [{
    title: 'Picknick im Park',
    initiator: 'Lena Fischer',
    initiatorTone: 'gold',
    range: '21. Jun',
    cover: 'var(--cover-green)'
  }]
}];
function BoardScreen() {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(ScreenHeader, {
    title: "Planung",
    subtitle: "Von der Idee bis zur Erinnerung"
  }), /*#__PURE__*/React.createElement("div", {
    className: "no-scrollbar",
    style: {
      display: 'flex',
      gap: 14,
      overflowX: 'auto',
      padding: '2px 20px 20px'
    }
  }, COLUMNS.map(col => /*#__PURE__*/React.createElement("div", {
    key: col.status,
    style: {
      width: 240,
      flex: 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 7,
      padding: '4px 4px 10px',
      fontSize: 12.5,
      fontWeight: 700,
      color: 'var(--text-muted)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: 99,
      background: `var(--status-${col.status.replace(/_/g, '-').replace('planung-abgeschlossen', 'abgestimmt')})`
    }
  }), col.label, /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto',
      color: 'var(--text-faint)',
      fontWeight: 600
    }
  }, col.cards.length)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, col.cards.map((c, i) => /*#__PURE__*/React.createElement(KanbanCard, _extends({
    key: i
  }, c))))))));
}
Object.assign(window, {
  UebersichtScreen,
  BoardScreen,
  ScreenHeader,
  ACTIVITIES
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mellon-app/screens-main.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mellon-app/screens-more.jsx
try { (() => {
// Mellon App — Screens Teil 2: Termine, Profil, Vorschlag-Sheet
const DS2 = window.MellonDesignSystem_495048;
const {
  CalendarExportButton,
  Card,
  Switch,
  Input,
  SegmentedControl,
  Stepper,
  Button,
  AvatarStack,
  DateRangePill
} = DS2;
function TermineScreen() {
  const [calState, setCalState] = React.useState('add');
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(window.ScreenHeader, {
    title: "Termine",
    subtitle: "Was als N\xE4chstes ansteht"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      padding: '0 20px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      borderRadius: 'var(--photo-radius)',
      overflow: 'hidden',
      position: 'relative',
      height: 190,
      background: 'var(--cover-blush)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'var(--photo-protect)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 14,
      left: 14
    }
  }, /*#__PURE__*/React.createElement(DateRangePill, {
    range: "Sa, 26. Jul \xB7 18:00",
    onDark: true
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 18,
      bottom: 16,
      color: '#fff',
      right: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-serif-display)',
      fontSize: 26,
      fontWeight: 500,
      letterSpacing: 'var(--tracking-tight)'
    }
  }, "Konzert: Open Air"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement(AvatarStack, {
    people: [{
      name: 'Lena'
    }, {
      name: 'Jonas',
      tone: 'gold'
    }, {
      name: 'Mia',
      tone: 'blush'
    }, {
      name: 'Tim',
      tone: 'ink'
    }, {
      name: 'Ben'
    }],
    size: 26,
    ringColor: "rgba(255,255,255,.9)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      fontWeight: 600
    }
  }, "5 dabei")))), /*#__PURE__*/React.createElement(CalendarExportButton, {
    state: calState,
    onClick: () => setCalState(calState === 'add' ? 'added' : calState)
  }), /*#__PURE__*/React.createElement(Card, {
    padding: 16
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 52,
      height: 52,
      borderRadius: 'var(--radius-md)',
      background: 'var(--cover-gold)',
      flex: 'none'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-serif-display)',
      fontSize: 17.5,
      fontWeight: 500
    }
  }, "H\xFCttenwochenende im Allg\xE4u"), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-caption)',
      color: 'var(--text-faint)',
      marginTop: 2
    }
  }, "12.\u201314. Sep \xB7 Planung l\xE4uft")), /*#__PURE__*/React.createElement(DateRangePill, {
    status: "in_planung"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      font: 'var(--type-caption)',
      color: 'var(--text-faint)',
      padding: '6px 0 0'
    }
  }, "Verbinde deinen Kalender, damit Mellon freie Zeitr\xE4ume f\xFCr alle findet.")));
}
const MEMORIES = [{
  title: '„Der Sonnenaufgang nach der Hüttennacht."',
  meta: 'Allgäu · Juli 2025',
  cover: 'var(--cover-gold)'
}, {
  title: '„Alle im See, keiner wollte raus."',
  meta: 'Kanutour · Juni 2025',
  cover: 'var(--cover-green)'
}];
function ProfilScreen() {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '26px 20px 16px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(DS2.Avatar, {
    name: "Lena Fischer",
    tone: "gold",
    size: 76
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-title)'
    }
  }, "Lena Fischer"), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-caption)',
      color: 'var(--text-faint)',
      marginTop: 2
    }
  }, "3 Gruppen \xB7 12 Erinnerungen")), /*#__PURE__*/React.createElement(DS2.Badge, {
    role: "admin"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-overline)',
      letterSpacing: 'var(--tracking-overline)',
      color: 'var(--text-faint)',
      padding: '6px 4px 0'
    }
  }, "Dein Archiv"), MEMORIES.map((m, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      borderRadius: 'var(--photo-radius)',
      overflow: 'hidden',
      position: 'relative',
      height: 160,
      background: m.cover
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'var(--photo-protect)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 18,
      bottom: 14,
      right: 18,
      color: '#fff'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-serif-display)',
      fontSize: 21,
      fontWeight: 500,
      letterSpacing: 'var(--tracking-tight)'
    }
  }, m.title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      opacity: .85,
      marginTop: 3
    }
  }, m.meta)))), /*#__PURE__*/React.createElement(Card, {
    padding: 18
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, [['Push-Benachrichtigungen', true], ['Wöchentliche Zusammenfassung', false]].map(([label, on]) => /*#__PURE__*/React.createElement("div", {
    key: label,
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15
    }
  }, label), /*#__PURE__*/React.createElement(Switch, {
    defaultChecked: on
  })))))));
}
function ProposalSheet({
  onClose
}) {
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: 'absolute',
      inset: 0,
      background: 'rgba(23,32,27,.4)',
      display: 'flex',
      alignItems: 'flex-end',
      zIndex: 30,
      borderRadius: 'inherit'
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      width: '100%',
      background: 'var(--surface)',
      borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
      boxShadow: 'var(--shadow-lg)',
      padding: '10px 20px 24px',
      boxSizing: 'border-box',
      animation: 'mellon-sheet var(--dur-slow) var(--ease-spring)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 40,
      height: 4.5,
      borderRadius: 99,
      background: 'var(--line-strong)',
      margin: '4px auto 16px'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-title)',
      marginBottom: 16
    }
  }, "Neuer Vorschlag"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Name der Aktivit\xE4t",
    placeholder: "z. B. Klettern im Kletterzentrum"
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--text-muted)',
      marginBottom: 7
    }
  }, "Dauer-Kategorie"), /*#__PURE__*/React.createElement(SegmentedControl, {
    options: [{
      value: 's',
      label: 'Spontan'
    }, {
      value: 'w',
      label: 'Wochenende'
    }, {
      value: 'l',
      label: 'Länger'
    }],
    defaultValue: "w"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--text-muted)'
    }
  }, "Ben\xF6tigte Upvotes"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: 'var(--text-faint)',
      fontWeight: 500
    }
  }, "f\xFCr den Planungsstart")), /*#__PURE__*/React.createElement(Stepper, {
    defaultValue: 4,
    min: 1,
    max: 12
  })), /*#__PURE__*/React.createElement(Button, {
    fullWidth: true,
    onClick: onClose
  }, "Vorschlag erstellen"), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    fullWidth: true,
    size: "sm",
    onClick: onClose
  }, "Abbrechen"))));
}
Object.assign(window, {
  TermineScreen,
  ProfilScreen,
  ProposalSheet
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mellon-app/screens-more.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.AvatarStack = __ds_scope.AvatarStack;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.DateRangePill = __ds_scope.DateRangePill;

__ds_ns.KanbanCard = __ds_scope.KanbanCard;

__ds_ns.VoteCard = __ds_scope.VoteCard;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.CalendarExportButton = __ds_scope.CalendarExportButton;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Chip = __ds_scope.Chip;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.SegmentedControl = __ds_scope.SegmentedControl;

__ds_ns.Stepper = __ds_scope.Stepper;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.Sidebar = __ds_scope.Sidebar;

__ds_ns.TabBar = __ds_scope.TabBar;

})();
