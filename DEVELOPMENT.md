# Development Guide

## Prerequisites

- Node.js (v18 or later)
- npm
- VS Code

## Setup

1. Clone the repository:

```bash
git clone https://github.com/pocke/elin-element-inspector.git
cd elin-element-inspector
```

2. Install dependencies:

```bash
npm install
```

3. Compile TypeScript:

```bash
npm run compile
```

## Development

### Running in Debug Mode

1. Open the project in VS Code
2. Press `F5` to launch the Extension Development Host
3. Open a C# file in the new VS Code window to test the extension

### Watch Mode

To automatically recompile on file changes:

```bash
npm run watch
```

### Linting

```bash
npm run lint
```

## Publishing

### Prerequisites for Publishing

1. Create an Azure DevOps account at https://dev.azure.com
2. Create a Personal Access Token (PAT):
   - Go to User Settings → Personal Access Tokens
   - Click "New Token"
   - Set Organization to "All accessible organizations"
   - Set Scopes: Marketplace → Manage (check both Acquire and Publish)
   - Copy the generated token
3. Create a publisher at https://marketplace.visualstudio.com/manage

### Login

```bash
npx vsce login <publisher-name>
```

Enter your PAT when prompted.

### Package (for testing)

```bash
npx vsce package
```

This creates a `.vsix` file that can be installed locally.

### Publish

```bash
npx vsce publish
```

To publish with a version bump:

```bash
npx vsce publish minor  # 0.0.1 -> 0.1.0
npx vsce publish patch  # 0.0.1 -> 0.0.2
```

## Project Structure

```
├── src/
│   ├── extension.ts        # Entry point
│   ├── types.ts            # Type definitions
│   ├── elementData.ts      # CSV data loading
│   ├── config.ts           # Configuration management
│   ├── formatter.ts        # Display formatting
│   ├── hoverProvider.ts    # Hover tooltip provider
│   └── decorationProvider.ts # Inline decoration provider
├── data/
│   └── elements.csv        # Element database
├── out/                    # Compiled JavaScript
└── package.json
```
