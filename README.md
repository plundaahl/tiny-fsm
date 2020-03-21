# TinyFSM

- [Overview](#Overview)
- [Installation](#Installation)
- [How Do I Use It?](#How-Do-I-Use-It?)
- [Examples](#Can-I-See-Live-Examples?)
- [Aspects](#What-Are-These-Aspects?-How-Do-I-Build-Them?)
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

1. Create a object of type `IBlueprint`, parameterized with the names of your states.
2. Describe your states by adding Aspects to each of your states.
3. Create a new `Machine` object.
4. Use your `Machine` to run your `IBlueprint`.

```javascript
const button: HTMLElement = document.getElementById('button');
const green: HTMLElement = document.getElementById('green');
const amber: HTMLElement = document.getElementById('amber');
const red: HTMLElement = document.getElementById('red');

// Define our blueprint
const trafficLightBlueprint: IBlueprint<'green' | 'amber' | 'red', {}> = {
    // Specify our starting state
    initState: 'green',

    // Include our list of states
    states: {
        green: [
            // Describe our states using Aspects
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

## What Are These Aspects? How Do I Build Them?
Aspects are small, reusable aspects of a state. They make it reasonably simple to take the imperative logic that needs to happen at the start and end of a state, and package it so that it can be used declaratively.

A Aspect is really just a function that implements the `StateSetupFn` interface. Here's an example of how we might build one:

```typescript
import { IMachine, Machine, StateSetupFn } from 'TinyFSM';

// Factory Function
function logsFoo(): StateSetupFn<T extends String, any> {

    // Setup Function (this is the actual Aspect)
    return (machine: IMachineSPI<T, any>) => {
        console.log('foo');

        // Cleanup Function
        return (machine: IMachineSPI<T, any>) => {
            console.log('bar');
        };
    }
}

// Using our aspect
const machine: IMachine<undefined> = new Machine();
machine.init<'stateA' | 'stateB'>({
    initState: 'stateA',
    states: {
        stateA: [
            logsFooAndBar(),
            transitionAfterTimeout(1000, 'StateB'),
        ],
        stateB: [
            logsFooAndBar(),
            transitionAfterTimeout(1000, 'StateA'),
        ],
    }
});
```

Thanks to the `transitionAfterTimeout` Aspect, this state machine will cycle between stateA and StateB every second. Each time it transitions, `bar` and `foo` will be printed to the console.

#### Factory Function
This is our constructor function. Its job is to return a Aspect. This isn't actually a necessary part of a Aspect, but it can be useful for providing configuration to the Aspect at the call site, so it's included here.

#### Setup Function
This is the actual Aspect. Its job is to do whatever the Aspect requires when the state is first entered. The TinyFSM `Machine` will take care of running this function every time the containing state is entered.

#### Cleanup Function
The cleanup function is optional. If your Aspect doesn't have any cleanup to do, feel free to omit it. If you do return a function from your setup function, TinyFSM's `Machine` will take care of invoking it when the associated state is transitioned out of.

## Why Should I Use This?
You probably shouldn't! At least, not for anything production-related. This is a personal project undertaken for a) my own curiosity, and b) to serve as a tool in my hobby game development projects. The API is still evolving, and there are probably a bunch of issues I haven't found with it.

However, if you're curious, enjoy programming for its own sake, or like the idea of building systems declaratively, please feel free to download it and give it a shot. I'd love to see what you build with it.
