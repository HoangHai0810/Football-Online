export const DECISIONS = [
  // ===================== ATTACKING (18 Scenarios) =====================
  {
    type: 'attack',
    title: "LIGHTNING COUNTER-ATTACK!",
    desc: "Your striker is 1-on-1 with the keeper. What will you do?",
    options: [
      { text: "Chip it over the keeper (Hard)", reqStat: "finishing", bonus: -10, passMsg: "It dips perfectly! GOAL!", failMsg: "Sails over the crossbar...", winAddsUserGoal: true },
      { text: "Power shot near post", reqStat: "shotPower", bonus: 0, passMsg: "Clinical finish! GOAL!", failMsg: "The keeper makes a stunning save!", winAddsUserGoal: true },
      { text: "Use pace to round keeper", reqStat: "sprintSpeed", bonus: -5, passMsg: "Rounds the keeper and taps it in! GOAL!", failMsg: "The keeper dives at his feet.", winAddsUserGoal: true }
    ]
  },
  {
    type: 'attack',
    title: "DANGEROUS FREE KICK!",
    desc: "25 yards out, tight angle. A set-piece opportunity.",
    options: [
      { text: "Curl it over the wall", reqStat: "curve", bonus: 5, passMsg: "A beautiful curve! It's in! GOAL!", failMsg: "The wall blocked the shot.", winAddsUserGoal: true },
      { text: "Power strike down the middle", reqStat: "shotPower", bonus: -5, passMsg: "The keeper was rooted to the spot! GOAL!", failMsg: "It deflected off a defender.", winAddsUserGoal: true },
      { text: "Smart pass into the box", reqStat: "shortPassing", bonus: 10, passMsg: "Finds his teammate perfectly! GOAL!", failMsg: "The keeper reads the pass.", winAddsUserGoal: true }
    ]
  },
  {
    type: 'attack',
    title: "BOX SCRAMBLE!",
    desc: "The opposition keeper just fumbled the ball, leaving an open net.",
    options: [
      { text: "Acrobatic Volley", reqStat: "volleys", bonus: -15, passMsg: "WOW! An absolutely insane volley! GOAL!", failMsg: "Completely missed the ball... embarrassing.", winAddsUserGoal: true },
      { text: "Shield and tap in", reqStat: "strength", bonus: 15, passMsg: "Simple and effective! GOALLL!", failMsg: "Muscled off the ball by a trailing defender.", winAddsUserGoal: true }
    ]
  },
  {
    type: 'attack',
    title: "CROWDED PENALTY AREA!",
    desc: "You have the ball in the box but 3 defenders are closing in quickly.",
    options: [
      { text: "Quick fake shot and shoot", reqStat: "dribbling", bonus: 0, passMsg: "Sent the defender to the shops! And he scores!", failMsg: "The defender didn't buy the dummy.", winAddsUserGoal: true },
      { text: "Try to win a penalty", reqStat: "agility", bonus: -10, passMsg: "He goes down... PENALTY GIVEN! And he converts it!", failMsg: "YELLOW CARD for diving!", winAddsUserGoal: true }
    ]
  },
  {
    type: 'attack',
    title: "WIDE OPEN ON THE FLANK!",
    desc: "Your winger has space to run down the wing. A striker is waiting in the middle.",
    options: [
      { text: "Whip in an early cross", reqStat: "crossing", bonus: 5, passMsg: "Perfect delivery! The striker heads it in! GOAL!", failMsg: "The cross was overcooked and goes out.", winAddsUserGoal: true },
      { text: "Cut inside to shoot", reqStat: "longShots", bonus: -5, passMsg: "He curls it into the far corner! GOAL!", failMsg: "The shot is blocked by the fullback.", winAddsUserGoal: true },
      { text: "Sprint to the byline", reqStat: "acceleration", bonus: 0, passMsg: "He beats his man and cuts it back! Tap-in! GOAL!", failMsg: "He runs the ball out of play.", winAddsUserGoal: true }
    ]
  },
  {
    type: 'attack',
    title: "PENALTY KICK!",
    desc: "The referee points to the spot! The pressure is on.",
    options: [
      { text: "Panenka (Extremely Risky)", reqStat: "composure", bonus: -20, passMsg: "THE AUDACITY! He chips it down the middle! GOAL!", failMsg: "The keeper simply catches it. Humiliating.", winAddsUserGoal: true },
      { text: "Smash it into the top corner", reqStat: "penalties", bonus: 5, passMsg: "Unstoppable penalty! GOAL!", failMsg: "Hits the post!", winAddsUserGoal: true },
      { text: "Place it bottom corner", reqStat: "finishing", bonus: 10, passMsg: "Coolly slotted home. GOAL!", failMsg: "The keeper guesses the right way.", winAddsUserGoal: true }
    ]
  },
  {
    type: 'attack',
    title: "DEFENSIVE MISTAKE!",
    desc: "The opposition center-back plays a terrible backpass. You can intercept!",
    options: [
      { text: "Anticipate the pass", reqStat: "positioning", bonus: 10, passMsg: "Intercepts and slots it in easily! GOAL!", failMsg: "The keeper rushes out to clear it just in time.", winAddsUserGoal: true },
      { text: "Sprint for the loose ball", reqStat: "sprintSpeed", bonus: -5, passMsg: "Wins the footrace and scores! GOAL!", failMsg: "Fouls the GK in the sliding challenge.", winAddsUserGoal: true }
    ]
  },
  {
    type: 'attack',
    title: "THROUGH BALL CHANCE!",
    desc: "A beautiful through ball splits the defense. The ball is bouncing perfectly.",
    options: [
      { text: "Take it on the half-volley", reqStat: "volleys", bonus: -10, passMsg: "What a strike! It flies into the net! GOAL!", failMsg: "He skies the ball into Row Z.", winAddsUserGoal: true },
      { text: "Control it first", reqStat: "ballControl", bonus: 15, passMsg: "Great first touch, followed by a neat finish! GOAL!", failMsg: "Heavy touch... the keeper gathers it.", winAddsUserGoal: true }
    ]
  },
  {
    type: 'attack',
    title: "CORNER KICK OPPORTUNITY!",
    desc: "The ball is floated towards the penalty spot.",
    options: [
      { text: "Bullet header", reqStat: "headingAccuracy", bonus: 0, passMsg: "A towering header! GOAL!", failMsg: "He completely misses the header.", winAddsUserGoal: true },
      { text: "Try a bicycle kick", reqStat: "agility", bonus: -20, passMsg: "OH MY WORD! Goal of the season!", failMsg: "He kicks the defender in the face. Foul.", winAddsUserGoal: true }
    ]
  },
  {
    type: 'attack',
    title: "TIKI-TAKA MASTERCLASS",
    desc: "Your team strings together 15 passes outside the box. A gap opens.",
    options: [
      { text: "One-touch killer pass", reqStat: "shortPassing", bonus: 5, passMsg: "A threaded pass and an easy finish! GOAL!", failMsg: "The pass is intercepted.", winAddsUserGoal: true },
      { text: "Take on the last man", reqStat: "dribbling", bonus: -5, passMsg: "Dribbles past him and scores! GOAL!", failMsg: "Dispossessed easily.", winAddsUserGoal: true }
    ]
  },
  {
    type: 'attack',
    title: "LONG RANGE EFFORT!",
    desc: "The team is struggling to break them down. The ball falls to you 30 yards out.",
    options: [
      { text: "Unleash a rocket", reqStat: "longShots", bonus: -10, passMsg: "ABSOLUTE THUNDERBASTARD! GOAL!", failMsg: "It hits the corner flag.", winAddsUserGoal: true },
      { text: "Play a lofted through ball", reqStat: "longPassing", bonus: 10, passMsg: "Drops perfectly for the striker! GOAL!", failMsg: "Overhit. Out for a goal kick.", winAddsUserGoal: true }
    ]
  },
  {
    type: 'attack',
    title: "DEFENDER SLIPS!",
    desc: "The last defender slips on the wet grass, leaving a clear path to goal.",
    options: [
      { text: "Explode into the space", reqStat: "acceleration", bonus: 5, passMsg: "Takes full advantage and scores! GOAL!", failMsg: "Slows down and allows the defender to recover.", winAddsUserGoal: true },
      { text: "Shoot from distance immediately", reqStat: "shotPower", bonus: -5, passMsg: "Catches the keeper off guard! GOAL!", failMsg: "Dragged wide of the post.", winAddsUserGoal: true }
    ]
  },

  // ===================== MIDFIELD (12 Scenarios) =====================
  {
    type: 'midfield',
    title: "MIDFIELD SCRAP!",
    desc: "A loose ball bounces in the center circle. Winning this sparks a counter!",
    options: [
      { text: "Aggressive sliding challenge", reqStat: "aggression", bonus: -10, passMsg: "Wins the ball and unleashes a thunderbolt from 40 yards! GOAL!", failMsg: "Late tackle, foul given.", winAddsUserGoal: true, failAddsOpponentGoal: false },
      { text: "Jockey and wait for support", reqStat: "standingTackle", bonus: 15, passMsg: "Safely wins possession back. Good composed play.", failMsg: "He gets spun and the opponent breaks away.", winAddsUserGoal: false, failAddsOpponentGoal: false }
    ]
  },
  {
    type: 'midfield',
    title: "HEAVY PRESS!",
    desc: "The opponent's midfield is swarming you intensely. You have the ball.",
    options: [
      { text: "Spin out of trouble (Roulette)", reqStat: "skillMoves", bonus: -15, passMsg: "Marseille roulette! The crowd erupts! He shoots... GOAL!", failMsg: "Loses the ball in a dangerous area. They score!", winAddsUserGoal: true, failAddsOpponentGoal: true },
      { text: "Shield the ball and pass back", reqStat: "strength", bonus: 10, passMsg: "Keeps calm and retains possession.", failMsg: "Gets bullied off the ball easily.", winAddsUserGoal: false, failAddsOpponentGoal: false },
      { text: "Quick one-two pass", reqStat: "shortPassing", bonus: 5, passMsg: "Bypasses the press beautifully.", failMsg: "Misplaces the pass out of bounds.", winAddsUserGoal: false, failAddsOpponentGoal: false }
    ]
  },
  {
    type: 'midfield',
    title: "COUNTER-ATTACK INITIATION",
    desc: "You just won the ball on the edge of your own box. The opponent is exposed.",
    options: [
      { text: "Hollywood diagonal long ball", reqStat: "longPassing", bonus: -5, passMsg: "A 60-yard dime! Striker scores! GOAL!", failMsg: "Pass straight to their fullback.", winAddsUserGoal: true, failAddsOpponentGoal: false },
      { text: "Carry the ball up the pitch", reqStat: "dribbling", bonus: 5, passMsg: "Breaks the lines with a great run.", failMsg: "Gets tackled from behind. Free kick.", winAddsUserGoal: false, failAddsOpponentGoal: false }
    ]
  },
  {
    type: 'midfield',
    title: "LOOSE BALL IN THE AIR!",
    desc: "A long goal kick comes down in the center of the pitch.",
    options: [
      { text: "Contest the aerial duel", reqStat: "jumping", bonus: 5, passMsg: "Wins the header and starts an attack.", failMsg: "Loses the duel cleanly.", winAddsUserGoal: false, failAddsOpponentGoal: false },
      { text: "Wait for the ball to drop and volley", reqStat: "volleys", bonus: -15, passMsg: "Hits it on the sweet spot from 45 yards... UNBELIEVABLE GOAL!", failMsg: "Miskicks it completely.", winAddsUserGoal: true, failAddsOpponentGoal: false }
    ]
  },
  {
    type: 'midfield',
    title: "SWITCH OF PLAY!",
    desc: "You are pinned on the left side. The right winger is calling for it.",
    options: [
      { text: "Ping it across the field", reqStat: "longPassing", bonus: 5, passMsg: "Perfect switch! The winger cuts in and scores! GOAL!", failMsg: "It sails into the stands.", winAddsUserGoal: true, failAddsOpponentGoal: false },
      { text: "Play safe sideways", reqStat: "shortPassing", bonus: 15, passMsg: "Keeps possession ticking over.", failMsg: "A lazy pass is intercepted.", winAddsUserGoal: false, failAddsOpponentGoal: false }
    ]
  },

  // ===================== DEFENSE (14 Scenarios) =====================
  {
    type: 'defense',
    title: "DANGEROUS THROUGH BALL!",
    desc: "The opponent plays a slide-rule pass splitting your defense.",
    options: [
      { text: "Slide tackle from behind (Risky)", reqStat: "slidingTackle", bonus: -15, passMsg: "Perfectly timed! Clean tackle!", failMsg: "RED CARD and a Penalty! OPPONENT SCORES!", failAddsOpponentGoal: true, winAddsUserGoal: false },
      { text: "Use strength to shoulder him off", reqStat: "strength", bonus: 10, passMsg: "Muscled him right off the ball. Clean.", failMsg: "The striker was too quick and slips past. OPPONENT SCORES!", failAddsOpponentGoal: true, winAddsUserGoal: false },
      { text: "Intercept the pass route", reqStat: "interceptions", bonus: 0, passMsg: "Reads the play like a book. Intercepted!", failMsg: "Reacts too late. The striker is through... OPPONENT SCORES!", failAddsOpponentGoal: true, winAddsUserGoal: false }
    ]
  },
  {
    type: 'defense',
    title: "DEFENDING A CORNER!",
    desc: "A tall center-back from the opponent is lurking at the back post.",
    options: [
      { text: "Man-mark tightly", reqStat: "marking", bonus: 5, passMsg: "Stays glued to him. Goal kick.", failMsg: "Loses his man... OPPONENT SCORES!", failAddsOpponentGoal: true, winAddsUserGoal: false },
      { text: "Zone defense and attack the ball", reqStat: "jumping", bonus: -5, passMsg: "Leaps highest and clears it!", failMsg: "Gets beaten in the air. OPPONENT SCORES!", failAddsOpponentGoal: true, winAddsUserGoal: false }
    ]
  },
  {
    type: 'defense',
    title: "SKILLFUL WINGER!",
    desc: "The opposition's fastest winger is isolating your fullback.",
    options: [
      { text: "Dive in to win it early", reqStat: "standingTackle", bonus: -10, passMsg: "Crunching tackle! Wins it cleanly.", failMsg: "He gets megged! The winger crosses... OPPONENT SCORES!", failAddsOpponentGoal: true, winAddsUserGoal: false },
      { text: "Jockey and force him wide", reqStat: "agility", bonus: 10, passMsg: "Contains him well. The winger runs it out.", failMsg: "The winger cuts inside and curls it in! OPPONENT SCORES!", failAddsOpponentGoal: true, winAddsUserGoal: false }
    ]
  },
  {
    type: 'defense',
    title: "LAST MAN STANDING!",
    desc: "You are the last defender. The striker is sprinting past you.",
    options: [
      { text: "Professional foul (Pull shirt)", reqStat: "aggression", bonus: 15, passMsg: "Takes a Yellow card, but saves a certain goal.", failMsg: "Gets a RED CARD, and they score the Free Kick! OPPONENT SCORES!", failAddsOpponentGoal: true, winAddsUserGoal: false },
      { text: "Try to match his pace", reqStat: "sprintSpeed", bonus: -5, passMsg: "Catches up and makes a heroic block!", failMsg: "In the dust. The striker finishes it. OPPONENT SCORES!", failAddsOpponentGoal: true, winAddsUserGoal: false }
    ]
  },
  {
    type: 'defense',
    title: "GOAL MOUTH SCRAMBLE!",
    desc: "The ball is pinging around the 6-yard box. Pure chaos!",
    options: [
      { text: "Just hoof it clear", reqStat: "shotPower", bonus: 10, passMsg: "Clears it into Row Z! Safe.", failMsg: "Slices it into his own net! OWN GOAL!!", failAddsOpponentGoal: true, winAddsUserGoal: false },
      { text: "Calmly pass it out the back", reqStat: "composure", bonus: -15, passMsg: "Ice in his veins! What a calm exit from defense.", failMsg: "Dispossessed 2 yards from goal. OPPONENT SCORES!", failAddsOpponentGoal: true, winAddsUserGoal: false }
    ]
  },
  {
    type: 'defense',
    title: "TIRED LEGS!",
    desc: "It's late in the game. An attacker tries to sprint past you.",
    options: [
      { text: "Use remaining stamina to track back", reqStat: "stamina", bonus: 5, passMsg: "Keeps running and puts the attacker off.", failMsg: "Cramps up! The attacker is free. OPPONENT SCORES!", failAddsOpponentGoal: true, winAddsUserGoal: false },
      { text: "Try a desperate sliding tackle", reqStat: "slidingTackle", bonus: -5, passMsg: "Gets just enough of the ball!", failMsg: "Completely misses. OPPONENT SCORES!", failAddsOpponentGoal: true, winAddsUserGoal: false }
    ]
  },
  {
    type: 'defense',
    title: "DEFENDING A COUNTER!",
    desc: "You have a 2-on-1 disadvantage. They are breaking fast.",
    options: [
      { text: "Commit to the ball carrier", reqStat: "standingTackle", bonus: -10, passMsg: "Stops the attack at the source!", failMsg: "He passes it horizontally. Easy tap in. OPPONENT SCORES!", failAddsOpponentGoal: true, winAddsUserGoal: false },
      { text: "Block the passing lane", reqStat: "positioning", bonus: 10, passMsg: "Forces a bad pass. Threat neutralized.", failMsg: "The carrier just shoots and scores! OPPONENT SCORES!", failAddsOpponentGoal: true, winAddsUserGoal: false }
    ]
  },

  // ===================== GOALKEEPER (10 Scenarios) =====================
  {
    type: 'gk',
    title: "POINT BLANK HEADER!",
    desc: "A cross comes in and their striker heads it powerfully from 6 yards out!",
    options: [
      { text: "Reflex dive to the right", reqStat: "gkReflexes", bonus: -10, passMsg: "UNBELIEVABLE SAVE! He tips it onto the post!", failMsg: "It's too fast. The net bulges. OPPONENT SCORES!", failAddsOpponentGoal: true, winAddsUserGoal: false },
      { text: "Try to parry it away", reqStat: "gkHandling", bonus: 5, passMsg: "He palms it away to safety!", failMsg: "He fumbles it into his own net... OPPONENT SCORES!", failAddsOpponentGoal: true, winAddsUserGoal: false }
    ]
  },
  {
    type: 'gk',
    title: "1-ON-1 WITH THE KEEPER!",
    desc: "The striker breaks through the offside trap and is bearing down on you!",
    options: [
      { text: "Rush out and slide tackle", reqStat: "sprintSpeed", bonus: -15, passMsg: "Brilliant sweeping by the keeper! Danger cleared.", failMsg: "Missed the ball. PENALTY! (OPPONENT SCORES)", failAddsOpponentGoal: true, winAddsUserGoal: false },
      { text: "Hold the line and make yourself big", reqStat: "gkPositioning", bonus: 5, passMsg: "The striker panics and shoots wide!", failMsg: "The striker casually slots it past the keeper. OPPONENT SCORES!", failAddsOpponentGoal: true, winAddsUserGoal: false }
    ]
  },
  {
    type: 'gk',
    title: "LONG RANGE ROCKET!",
    desc: "An opposition midfielder hits a swerving drive from 35 yards.",
    options: [
      { text: "Fingertip save over the bar", reqStat: "gdiving", bonus: -5, passMsg: "What a spectacular flying save!", failMsg: "It swerves at the last second. OPPONENT SCORES!", failAddsOpponentGoal: true, winAddsUserGoal: false },
      { text: "Catch it securely", reqStat: "gkHandling", bonus: 5, passMsg: "Collects it cleanly into his chest.", failMsg: "Spills it straight to the striker. OPPONENT SCORES!", failAddsOpponentGoal: true, winAddsUserGoal: false }
    ]
  },
  {
    type: 'gk',
    title: "CHAOTIC CORNER KICK!",
    desc: "An in-swinging corner is whipped into the 6-yard box.",
    options: [
      { text: "Punch it clear through the crowd", reqStat: "gkHandling", bonus: 0, passMsg: "A commanding punch clears the danger!", failMsg: "Whiffs the punch. Free header. OPPONENT SCORES!", failAddsOpponentGoal: true, winAddsUserGoal: false },
      { text: "Stay on the line", reqStat: "gkPositioning", bonus: 10, passMsg: "Reacts perfectly to a downward header. Saved!", failMsg: "No one marks the striker. OPPONENT SCORES!", failAddsOpponentGoal: true, winAddsUserGoal: false }
    ]
  },
  {
    type: 'gk',
    title: "THE PENALTY!",
    desc: "You conceded a penalty. It's you vs the penalty taker.",
    options: [
      { text: "Guess Left", reqStat: "gkDiving", bonus: 0, passMsg: "HE GUESSES RIGHT! SAVED!", failMsg: "Wrong way. OPPONENT SCORES!", failAddsOpponentGoal: true, winAddsUserGoal: false },
      { text: "Guess Right", reqStat: "gkDiving", bonus: 0, passMsg: "A brilliant save to his right!", failMsg: "Sent the wrong way. OPPONENT SCORES!", failAddsOpponentGoal: true, winAddsUserGoal: false },
      { text: "Stand firmly in the middle", reqStat: "gkPositioning", bonus: -10, passMsg: "The panenka backfires! He catches it easily!", failMsg: "Smashed into the corner. OPPONENT SCORES!", failAddsOpponentGoal: true, winAddsUserGoal: false }
    ]
  },
  {
    type: 'gk',
    title: "DEFENDER PLAYS IT BACK",
    desc: "Your defender executes a terrible, bouncy backpass. The striker is closing in.",
    options: [
      { text: "Boot it out of the stadium", reqStat: "kicking", bonus: 5, passMsg: "No nonsense. Smashes it to safety.", failMsg: "Miskicks it. The striker taps it in! OPPONENT SCORES!", failAddsOpponentGoal: true, winAddsUserGoal: false },
      { text: "Try a Cruyff turn", reqStat: "skillMoves", bonus: -25, passMsg: "The keeper humbles the striker! What flair!", failMsg: "Tackled immediately. The most embarrassing OPPONENT GOAL!", failAddsOpponentGoal: true, winAddsUserGoal: false }
    ]
  }
];
