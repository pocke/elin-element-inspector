# Elin Element Inspector

A VS Code extension that displays Element information for decompiled [Elin](https://store.steampowered.com/app/2135150/Elin/) [source code](https://github.com/Elin-Modding-Resources/Elin-Decompiled).

In Elin's decompiled C# source code, Element IDs are represented as numeric literals. This extension helps you understand what each Element ID refers to by showing the Element's name and details.

## Features

### Inline Decoration

When a numeric literal appears as an argument to specific functions (like `Evalue`, `HasElement`, `ModExp`), the extension displays the Element name inline.

```csharp
// Before: You see just a number
var val = Evalue(60);

// After: Element name is shown inline
var val = Evalue(60 life);
```

### Hover Information

Hover over any numeric literal to see detailed Element information in a tooltip, including all available properties from the Element database.

## Extension Settings

This extension contributes the following settings:

| Setting | Default | Description |
|---------|---------|-------------|
| `elinElementInspector.format` | `$name_JP` | Display format for Element info. Use `$columnName` to reference CSV columns (e.g., `$alias/$name_JP`) |
| `elinElementInspector.additionalTargets` | `[]` | Additional functions to detect Element IDs |
| `elinElementInspector.enableInlineDecoration` | `true` | Enable inline decoration |
| `elinElementInspector.enableHover` | `true` | Enable hover information |

### Adding Custom Function Targets

You can add additional functions to detect Element IDs:

```json
{
  "elinElementInspector.additionalTargets": [
    { "function": "CustomFunction", "argIndex": 1 }
  ]
}
```

## Release Notes

### 0.0.1

Initial release.

## License

MIT except data/elements.csv. The CSV file is extracted from Elin game.
