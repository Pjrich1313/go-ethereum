# Contributing to Go Ethereum

Thank you for considering to help out with the source code! We welcome contributions from anyone on the internet, and are grateful for even the smallest of fixes!

This document provides guidelines for contributing to the go-ethereum project. Following these guidelines helps communicate that you respect the time of the developers managing and developing this open source project. In return, they should reciprocate that respect in addressing your issue, assessing changes, and helping you finalize your pull requests.

## Ways to Contribute

There are many ways to contribute to go-ethereum:

- **Bug Reports**: If you find a bug, please open an issue describing the problem, including steps to reproduce it
- **Feature Requests**: Suggest new features or enhancements via GitHub issues
- **Code Contributions**: Submit pull requests with bug fixes, new features, or improvements
- **Documentation**: Help improve or translate documentation
- **Community Support**: Help other users on [Discord](https://discord.gg/nthXNEv)
- **Security**: Report security vulnerabilities following our [Security Policy](SECURITY.md)

## Before You Start

### For Simple Changes

For simple bug fixes or small improvements:
1. Fork the repository
2. Create a branch for your changes
3. Make your changes
4. Submit a pull request

### For Complex Changes

If you wish to submit more complex changes, please check with the core developers first on [our Discord server](https://discord.gg/nthXNEv) to ensure those changes are in line with the general philosophy of the project and/or get some early feedback. This can make both your efforts much lighter as well as our review and merge procedures quick and simple.

### Feature Requests

Before you submit a feature request, please check and make sure that it isn't possible through some other means. The JavaScript-enabled console is a powerful feature in the right hands. Please check our [Geth documentation page](https://geth.ethereum.org/docs/) for more info and help.

## Getting Started

### Prerequisites

Building `geth` requires:
- Go (version 1.23 or later)
- A C compiler
- Git

For detailed build instructions, please read the [Installation Instructions](https://geth.ethereum.org/docs/getting-started/installing-geth).

### Building from Source

Clone the repository and build:

```shell
git clone https://github.com/ethereum/go-ethereum.git
cd go-ethereum
make geth
```

Or build the full suite of utilities:

```shell
make all
```

### Running Tests

Please see the [Developers' Guide](https://geth.ethereum.org/docs/developers/geth-developer/dev-guide) for detailed information on configuring your environment, managing project dependencies, and testing procedures.

## Making Your Contribution

### 1. Fork and Clone

Fork the go-ethereum repository and clone your fork locally:

```shell
git clone https://github.com/YOUR-USERNAME/go-ethereum.git
cd go-ethereum
git remote add upstream https://github.com/ethereum/go-ethereum.git
```

### 2. Create a Branch

Create a branch for your changes:

```shell
git checkout -b fix/my-bug-fix
```

Or for a feature:

```shell
git checkout -b feature/my-new-feature
```

### 3. Make Your Changes

Make your changes, following our coding guidelines (see below).

### 4. Test Your Changes

Ensure your changes don't break existing functionality. Run relevant tests before submitting your pull request.

### 5. Commit Your Changes

Commit your changes with a clear commit message:

```shell
git add .
git commit -m "package: description of changes"
```

See the commit message guidelines below for more details.

### 6. Push to Your Fork

```shell
git push origin fix/my-bug-fix
```

### 7. Open a Pull Request

Go to the [go-ethereum repository](https://github.com/ethereum/go-ethereum) and open a pull request from your branch. Please provide:

- A clear title and description
- Reference to any related issues
- Details about what you changed and why
- Any additional context that would help reviewers

## Coding Guidelines

Please make sure your contributions adhere to our coding guidelines:

### Code Formatting

- Code must adhere to the official Go [formatting guidelines](https://golang.org/doc/effective_go.html#formatting)
- Use [gofmt](https://golang.org/cmd/gofmt/) to format your code
- Run `gofmt -w .` before committing

### Code Documentation

- Code must be documented adhering to the official Go [commentary guidelines](https://golang.org/doc/effective_go.html#commentary)
- All exported functions, types, and variables should have comments
- Comments should be complete sentences starting with the name of the thing being described

### Code Quality

- Write clear, readable code
- Follow Go best practices and idioms
- Avoid unnecessary complexity
- Keep functions focused and concise
- Handle errors appropriately

## Pull Request Guidelines

- **Base Branch**: Pull requests need to be based on and opened against the `master` branch
- **One Feature Per PR**: Keep pull requests focused on a single feature or bug fix
- **Update Documentation**: Update relevant documentation if your changes require it
- **Maintain Backwards Compatibility**: Avoid breaking changes when possible
- **Be Responsive**: Respond to review comments in a timely manner

## Commit Message Guidelines

Commit messages should be clear and follow this format:

```
package(s): brief description of changes

More detailed explanation if necessary. Wrap at 72 characters.
Can include multiple paragraphs.

Fixes #123
```

### Examples

Good commit messages:
- `eth, rpc: make trace configs optional`
- `core: implement EIP-1559 base fee`
- `cmd/geth: add new flag for snapshot sync`

### Commit Message Rules

- Prefix with the package(s) being modified
- Use lowercase for the prefix
- Use imperative mood ("add feature" not "added feature")
- Keep the first line under 72 characters
- Reference issues and pull requests where appropriate

## Issue Templates

When creating issues, please use the appropriate issue template:

- **Bug Report**: For reporting bugs
- **Feature Request**: For suggesting new features
- **Question**: For asking questions about usage

This helps us understand and address your issue more quickly.

## Code of Conduct

### Our Standards

We are committed to providing a welcoming and inclusive environment. We expect all contributors to:

- Be respectful and considerate
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment, discrimination, or intimidation
- Trolling, insulting/derogatory comments
- Publishing others' private information
- Any conduct which could reasonably be considered inappropriate

## Communication Channels

- **Discord**: [Join our Discord](https://discord.gg/nthXNEv) for real-time discussions
- **GitHub Issues**: For bug reports and feature requests
- **GitHub Discussions**: For general questions and community discussions
- **Documentation**: [Geth Documentation](https://geth.ethereum.org/docs/)

## Security

If you discover a security vulnerability, please follow our [Security Policy](SECURITY.md). Do not open a public issue for security vulnerabilities.

## License

By contributing to go-ethereum, you agree that your contributions will be licensed under:

- The [GNU Lesser General Public License v3.0](COPYING.LESSER) for library code (all code outside of the `cmd` directory)
- The [GNU General Public License v3.0](COPYING) for binary code (all code inside of the `cmd` directory)

## Additional Resources

- **Developer's Guide**: [Geth Developer Guide](https://geth.ethereum.org/docs/developers/geth-developer/dev-guide)
- **API Documentation**: [GoDoc](https://pkg.go.dev/github.com/ethereum/go-ethereum)
- **Website Contributions**: For contributions to [geth.ethereum.org](https://geth.ethereum.org), checkout the `website` branch

## Questions?

If you have any questions about contributing, feel free to:

- Ask on [Discord](https://discord.gg/nthXNEv)
- Open a discussion on GitHub
- Check the [documentation](https://geth.ethereum.org/docs/)

## Recognition

Contributors are recognized in our [AUTHORS](AUTHORS) file. Significant contributions are acknowledged in release notes and project updates.

---

Thank you for contributing to go-ethereum! Your efforts help make Ethereum better for everyone.
