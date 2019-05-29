<div align="center">
<img src="img/main.png" width="200px" alt="Example from the game" style="padding-bottom: 10px;">
<h1>
Conway's Game of Life
<div>
<a href="https://travis-ci.org/adambertrandberger/gol"><img src="https://travis-ci.org/adambertrandberger/gol.svg?branch=master"></a>
</div>
</h1>
</div>

Yet another Game of Life remake. This one is in Javascript and has a few more features than most. Still not as featured as the standard program seen on http://www.conwaylife.com/, but has some uniqueness to it :)

It isn't very efficient right now, so I wouldn't suggest using large cell counts. This implementation is better at editing than it is running large games. Another thing about this is that 
it is a bounded implementation. Anything out of bounds of the grid counts as being an alive cell. This has some interesting consequences, but cuts your dreams of watching gliders go infinitely short :(

[Try it out online!](https://adambertrandberger.github.io/gol/play/index.html)

## Usage
To use this on your own HTML pages you can import the script (found in the `dist` folder) using a `script` tag. Then call:

```
gol(document.getElementById('game'));
```

You'll have to create some parent HTML element for the game to be put into. In this case I expected there to be some HTML element named "game". It could be as simple has having: `<div id="game"></div>` somewhere.

## Hot-keys
`p` or `d`: Enter drawing mode (for filling in cells)

`e`: Enter eraser mode (for unfilling cells)

`q`: Enter panning mode (for moving the camera around)

`s`: Save the current screen to the browser's localStorage

`l`: Load the last saved screen from the browser's localStorage

`f`: Load the currently selected prefab

`c`: Clear all cells on the screen

`n`: Run the next generation

`r`: Toggle the loop (loop's speed can be configured with the sliding bar input)

`g`: Toggle showing/hiding the grid


