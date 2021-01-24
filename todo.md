# Project Todo
-Use MobX
-Eject the app so it stands alone as a minimal, webpack-driven project
-Write some UI unit tests to get familiar
-Make the project available via a subdomain on my personal site
-Dynamically input board size and number in a row needed for a win
    -Potential future
-Write an AI and implement it in a service worker to not block UI (try in main thread first to see how affects behavior)
    -Later
-✓ Draw a line over the winning four-in-a-row
-Light theme/dark theme (meme, but also intructive)
-✓ Implement remote gameplay with websockets
-✓ Create a hover animation, a grayed out piece of the current color floats above the column
-Make the game have two version: Blitz and Regular
    -Future
-Separate the repo into TypeScript subprojects - one for the front-end and one for the server
-write a good README

-(2) style the game
    -arcade style font
    -make the turn info, color info displayed to side
        -show 'Your Color : {colored disc}'
        -InGameMenu may only apply in cases of non-Local 1v1 games

-ability to play one another locally on a machine, across a network, and against the computer (different difficulties)
    -for playing across a network, allow one player to create the game and share a room code inviting another
    -allow players to replay the same game type. In the case of remote game, replay the same remote player

-write unit tests for the board/game model mechanics 
    -React Enzyme tests too
