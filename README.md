# Minecraft Music Generator
Generates mcfunctions that can be executed to play self-made music.

## Getting Started
These instructions will show you how to install and use the generator.

### Prerequisites
+ [Node.js](https://nodejs.org)

### Installing
+ Go to the [releases-page](https://github.com/TrojanerHD/Minecraft-Music-Generator/releases), download the newest release as a `.zip`-file and unpack it in an empty folder.
+ Then you will have to manually install the node_modules:
  ```BAT
  cd path/to/the/folder/where/you/unpacked/the/zip
  npm install
  ```
### Using
Create a new Minecraft world (or use an existing one) and create a datapack inside the world's datapack folder.

As the program currently is in alpha you have to run the program via the command prompt.
+ Windows:
  ```BAT
  cd path/to/the/folder/where/you/unpacked/the/zip
  node_modules/electron/dist/electron.exe index.js
  ```
+ Unix (only tested on Linux but on macOS it should work the same way):
  ```SH
  cd path/to/the/folder/where/you/unpacked/the/zip
  node_modules/.bin/electron index.js
  ```

Now you should see a window that looks similar to this photo:

![UI](https://raw.githubusercontent.com/TrojanerHD/Minecraft-Music-Generator/master/resources/README/UI.jpg)

(Note: The UI may change during development so there might be small differences)

Here is a quick overview for all the buttons:
+ Choose File: Here you are going to choose the `functions` folder of your datapack (`datapacks/<namespace>/data/<namespace>/functions`). This is necessary in order to save and compile the music you are creating.
+ Save directory: Currently it does nothing. Like I said: We are in alpha so do not expect everything to be working. Later this button saves the directory to quickly open it up on start of the application.
+ Speed (BPM): The speed of your whole music composition in beats per minute
+ Save manually - Save automatically: This switch toggles whether to save automatically or manually. If you experience lags every time you change something in the application then you should consider turning auto save off.
+ Time Signature: This option specifies the time signature in which your composition is composed. 
+ Pitch, Instrument, Octave, Current Track, Note, Submit: With this input fields and buttons you can add a new note. Pitch, instrument, octave and note (length) are self-explanatory. By "tracks" things like melody and bass are meant.
+ Copy as Pauses from track x to track y: Here you can copy a track. You need to do this when a song first starts with one track (e. g. melody) and later another tracks are added (e. g. bass). An example case is "MEGALOVANIA" by Toby Fox. In this case you can not simply always add the longest pauses because Minecraft is not 100% precisely and unfortunately there is a difference between two 1/4 pauses and one 1/2 pause. So, you need to copy the tracks. It is planned that this function will be automated, but since a rewriting of the UI is planned, it is not yet worth it.
And that is everything about the interface. The application compiles automatically on every save into the folder `functions/0` (if this folder already exists it will increase the number until there is no existing folder). Then, you can go into Minecraft, type `/reload` and execute the command `/function <namespace>:<compile folder>/1/music` to play the music.

## Built With
* [Minecraft](https://minecraft.net) - The game engine
* [Node.js](https://nodejs.org) - Server side JavaScript
* [Electron](https://electronjs.org/) - The front-end (UI)
* [WebStorm](https://www.jetbrains.com/webstorm/) - IDE

## Contributing
Please read [CONTRIBUTING.md](https://gist.github.com/PurpleBooth/b24679402957c63ec426) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning
We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/TrojanerHD/Minecraft-Music-Generator/tags). 

## Authors
* **Trojaner** - *Initial work* - [TrojanerHD](https://github.com/TrojanerHD)

See also the list of [contributors](https://github.com/your/project/contributors) who participated in this project.
