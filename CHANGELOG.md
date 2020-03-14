# Changelog
All notable changes to TinyFSM will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
This project is currently in design phase, and as such does not follow Semantic Versioning. However, it will adopt Semantic Versioning beginning with version 1.0.0.
<!-- and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html). -->

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
