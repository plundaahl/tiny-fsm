# Changelog
All notable changes to TinyFSM will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
This project is currently in design phase, and as such does not follow Semantic Versioning. However, it will adopt Semantic Versioning beginning with version 1.0.0.
<!-- and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html). -->

## 0.5.0 (2020-03-21)

### Added
- Can now trigger transitions from a StateComponent's setup function.

### Changed
- The `StateSetupFn` now returns a single optional cleanup function, rather than `{ onRun, onExit }`.
- Rename `IAuxDataContainer` to `IAuxDataHoldingMachine`.
- Split `IMachineSPI` into `ISetupMachine` and `ICleanupMachine`, and refactor to inject each into the appropriate StateComponent steps.
- Refactor `MachineCore` to pass separate, limited interfaces into onEnter and onExit functions.
- Rename `StateComponent` to `IAspect`
- Rename `MachineBlueprint` to `IBlueprint`
- Rename `IMachine #init` to `IMachine #runBlueprint`
- Rename `IMachine #isInitialized` to `IMachine #isRunning`

### Removed
- Type `StateRunFn`.
- The `onRun` StateComponent.

## 0.4.2

### Changed
- Updated minimist 1.2.0 > 1.2.5 to resolve vulnerability [GHSA-7fhm-mqm4-2wp7](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2020-7598)

## 0.4.1

### Added
- Method `IMachine.terminate()`.
- [Tests](./src/FsmManager/test/FsmManager.spec.ts) for FsmManager.
- Export the [onEnter](./src/stateComponents/onEnter.ts), [onRun](./src/stateComponents/onRun.ts), [onExit](./src/stateComponents/onExit.ts) state components.
- This changelog.

### Changed
- Updated acorn dependency to address vulnerability.
- Updated [readme](README.md) to explain what this project actually is.
- Brought examples into main project.
- Add changelog note that we are not yet using semantic versioning.
- Renamed `IMachineContext` to `IMachine`.

### Removed
- `FsmManager` (machines are now self-managed).
