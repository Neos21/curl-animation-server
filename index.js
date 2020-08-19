const http   = require('http');
const stream = require('stream');

// CSI
const csi = {
  esc: '\x1b[',  // ESC (or '\e[' or '\033[')
  set: {
    bright    : '\x1b[1m',
    dim       : '\x1b[2m',
    italic    : '\x1b[3m',
    underline : '\x1b[4m',
    blink     : '\x1b[5m',
    rapidBlink: '\x1b[6m',  // Maybe Not Supported
    reverse   : '\x1b[7m',
    hidden    : '\x1b[8m',
    strike    : '\x1b[9m',  // Maybe Not Supported
    defaultFont     : '\x1b[10m',  // Maybe Not supported
    alternativeFont1: '\x1b[11m',  // Maybe Not Supported
    alternativeFont2: '\x1b[12m',  // Maybe Not Supported
    alternativeFont3: '\x1b[13m',  // Maybe Not Supported
    alternativeFont4: '\x1b[14m',  // Maybe Not Supported
    alternativeFont5: '\x1b[15m',  // Maybe Not Supported
    alternativeFont6: '\x1b[16m',  // Maybe Not Supported
    alternativeFont7: '\x1b[17m',  // Maybe Not Supported
    alternativeFont8: '\x1b[18m',  // Maybe Not Supported
    alternativeFont9: '\x1b[19m',  // Maybe Not Supported
    fraktur         : '\x1b[20m'   // Maybe Not Supported
  },
  reset: {
    all      : '\x1b[0m' ,
    bright   : '\x1b[21m',  // or Doubly Underline Maybe Not Supported
    dim      : '\x1b[22m',
    italic   : '\x1b[23m',  // and Fraktur
    underline: '\x1b[24m',
    blink    : '\x1b[25m',
    spacing  : '\x1b[26m',  // Proportional Spacing Maybe Not Supported
    reverse  : '\x1b[27m',
    hidden   : '\x1b[28m',
    strike   : '\x1b[29m',
  },
  fg: {
    black  : '\x1b[30m',
    red    : '\x1b[31m',
    green  : '\x1b[32m',
    yellow : '\x1b[33m',
    blue   : '\x1b[34m',
    magenta: '\x1b[35m',
    cyan   : '\x1b[36m',
    white  : '\x1b[37m',
    // 38m : Set 256 Colours
    default: '\x1b[39m',
    grey        : '\x1b[90m',
    lightRed    : '\x1b[91m',
    lightGreen  : '\x1b[92m',
    lightYellow : '\x1b[93m',
    lightBlue   : '\x1b[94m',
    lightMagenta: '\x1b[95m',
    lightCyan   : '\x1b[96m',
    lightWhite  : '\x1b[97m'
  },
  bg: {
    black  : '\x1b[40m',
    red    : '\x1b[41m',
    green  : '\x1b[42m',
    yellow : '\x1b[43m',
    blue   : '\x1b[44m',
    magenta: '\x1b[45m',
    cyan   : '\x1b[46m',
    white  : '\x1b[47m',
    // 48m : Set 256 Colours
    default: '\x1b[49m',
    grey        : '\x1b[100m',
    lightRed    : '\x1b[101m',
    lightGreen  : '\x1b[102m',
    lightYellow : '\x1b[103m',
    lightBlue   : '\x1b[104m',
    lightMagenta: '\x1b[105m',
    lightCyan   : '\x1b[106m',
    lightWhite  : '\x1b[107m'
  },
  cu: {  // Move Cursor
    cup: '\x1b[H'  // Move cursor to the indicated row, column (origin at 1,1)
  },
  ed: {  // Erase Display
    fromStartToCursor         : '\x1b[1J',
    wholeDisplay              : '\x1b[2J',
    wholeDisplayWithScrollBack: '\x1b[3J'
  }
};

// Make Your Original Stream
const streamer = (readableStream) => {
  const clear   = csi.ed.wholeDisplay + csi.ed.wholeDisplayWithScrollBack + csi.cu.cup;
  const colours = [csi.fg.red, csi.fg.yellow, csi.fg.green, csi.fg.cyan, csi.fg.blue, csi.fg.magenta, csi.fg.white];
  const text    = 'COLOURFUL TEXT';
  
  let index = 0;
  return setInterval(() => {
    const line = clear + colours[index] + text + csi.reset.all + '\n';
    readableStream.push(line);  // Show
    index = (index + 1) % colours.length;  // Loop The Array
  }, 100);
};

// Create Server
const server = http.createServer((req, res) => {
  if(!req.headers || !`${req.headers['user-agent']}`.includes('curl')) {
    console.log(new Date().toISOString(), 'Request From Browser');
    return res.end('Please Access From curl.');
  }
  
  console.log(new Date().toISOString(), 'Request From curl');
  const readableStream = new stream.Readable();
  readableStream._read = () => {};
  readableStream.pipe(res);
  const timer = streamer(readableStream);
  
  // When User Pressed Ctrl + C
  req.on('close', () => {
    console.log(new Date().toISOString(), 'Request From curl : Destroy');
    readableStream.destroy();
    clearInterval(timer);
  });
});

// Launch Server
server.listen(process.env.PORT || 8080, (error) => {
  if(error) {
    console.error(new Date().toISOString(), error);
    throw error;
  }
  
  console.log(new Date().toISOString(), 'Server Started');
});
