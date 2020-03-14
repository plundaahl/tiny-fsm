# TinyFSM

- [Overview](#Overview)
- [Installation](#Installation)
- [How Do I Use It?](#How-Do-I-Use-It?)
- [Examples](#Can-I-See-Live-Examples?)
- [Why Should I Use This?](#Why-Should-I-Use-This?)

## Overview
TinyFSM is a small, experimental framework for creating finite state machines. It's written TypeScript, and is designed to facilitate declarative programming (where possible!), and to encourage code reuse through composition.

I wrote this mainly because I thought the idea was cool, and wanted to see what it would look like. It was inspired by a never-ending game development project I've been working on for the past year. While you probably won't see the game any time soon, you can at least see this weird little library.

Onward to the instructions!

## Installation
TinyFSM is not yet released on NPM, so for now, you'll need to clone it and build it yourself. You can use the `file:` syntax to link to it locally (here's a [StackOverflow](https://stackoverflow.com/questions/14381898/local-dependency-in-package-json) post explaining how).

```
# Clone the project
git clone https://github.com/plundaahl/tiny-fsm.git
cd tiny-fsm

# Install and Build
npm install
npm run-script build
```

## How Do I Use It?
The basic process of using TinyFSM is as follows:

1. Create a object of type `MachineBlueprint`, parameterized with the names of your states.
2. Describe your states by adding StateComponents to each of your states.
3. Create a new `Machine` object.
4. Use your `Machine` to run your `MachineBlueprint`.

```javascript
const button: HTMLElement = document.getElementById('button');
const green: HTMLElement = document.getElementById('green');
const amber: HTMLElement = document.getElementById('amber');
const red: HTMLElement = document.getElementById('red');

// Define our blueprint
const trafficLightBlueprint: MachineBlueprint<'green' | 'amber' | 'red', {}> = {
    // Specify our starting state
    initState: 'green',

    // Include our list of states
    states: {
        green: [
            // Describe our states using StateComponents
            transitionOnClick(button, 'amber'),
            powersLight(green),
        ],
        amber: [
            transitionOnClick(button, 'red'),
            powersLight(amber),
        ],
        red: [
            transitionOnClick(button, 'green'),
            powersLight(red),
        ],
    }
};

// Create our machine
const machine = new Machine();

// Initialize it
machine.init(myBluePrint);
```

## Can I See Live Examples?
Absolutely! To do so, download and build the project, then check out [examples/index.html](examples/index.html).

```
# Clone the project
git clone https://github.com/plundaahl/tiny-fsm.git
cd tiny-fsm

# Install and Build
npm install
npm run-script build-examples
```

## Why Should I Use This?
You probably shouldn't! At least, not for anything production-related. This is a personal project undertaken for a) my own curiosity, and b) to serve as a tool in my hobby game development projects. The API is still evolving, and there are probably a bunch of issues I haven't found with it.

However, if you're curious, enjoy programming for its own sake, or like the idea of building systems declaratively, please feel free to download it and give it a shot. I'd love to see what you build with it.
