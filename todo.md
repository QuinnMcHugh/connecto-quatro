# Project Todo
-Use MobX
-Eject the app so it stands alone as a minimal, webpack-driven project
-Write some UI unit tests to get familiar
-Make the project available via a subdomain on my personal site
-Dynamically input board size and number in a row needed for a win
-Write an AI and implement it in a service worker to not block UI (try in main thread first to see how affects behavior)
-Draw a line over the winning four-in-a-row
-Light theme/dark theme (meme, but also intructive)
-Experiment with websockets over backend with polling
-Create a hover animation, a grayed out piece of the current color floats above the column
-(3) Set up web server enabling players across a network to play one another
-Make the game have two version: Blitz and Regular

-ability to play one another locally on a machine, across a network, and against the computer (different difficulties)
    -(1) game must support these different modes
    -(2) there should be a menu
    -for playing across a network, allow one player to create the game and share a room code inviting another
    -allow players to replay the same game type. In the case of remote game, replay the same remote player

-Research if a perfect Connect 4 AI is feasible
    -how much "research" has been done in terms of playing connect 4, ex. lay people's strategies, complexity
-write unit tests for the board/game model mechanics 
    -React Enzyme tests too
