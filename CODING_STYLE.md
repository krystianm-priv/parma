# Coding Style Guide

## Philosophy

**Minimalistyczny, praktyczny, dobrze rozdzielony**

This project follows a clean, pragmatic approach to code. Every line should serve a purpose.

## Principles

### 1. Minimalism
- No unnecessary decorations (e.g., excessive ASCII art, borders)
- Clean, simple interfaces
- Remove code that doesn't add value
- If it doesn't need to be there, it shouldn't be there

### 2. Practicality
- Code should work first, impress second
- Avoid over-engineering
- Simple solutions over complex ones
- Real-world usability over theoretical perfection

### 3. Separation of Concerns
- Clear boundaries between components
- Single responsibility principle
- Well-organized file structure
- Logical grouping of functionality

## Specific Guidelines

### UI/UX
- Keep terminal UIs clean and readable
- Avoid keyboard shortcut conflicts (e.g., don't use Ctrl+V for toggle - that's for paste)
- Single-screen flows preferred over multi-step wizards when possible
- Clear, obvious navigation

### Code Organization
- Use stores (Zustand) for shared state
- Components should be focused and reusable
- Avoid prop drilling - use context/stores
- Keep files under 300 lines when reasonable

### React/Ink Patterns
- Use hooks properly (useEffect, useState)
- Clean up effects in return functions
- Functional components only
- TypeScript for type safety

### TypeScript
- Avoid `any` - define proper types
- Use interfaces for data structures
- Type function parameters and returns

## Anti-Patterns to Avoid

❌ Excessive ASCII art and decorative elements
❌ Multi-step wizards that could be single forms
❌ Conflicting keyboard shortcuts
❌ Over-complicated state management
❌ Prop drilling through multiple levels
❌ Mixing concerns in single components

## Examples

### Good ✅
```typescript
// Clean, minimal header
<Box flexDirection="column" marginBottom={1}>
  <Box>
    <Text bold color="magenta">PARMA</Text>
  </Box>
  <Box>
    <Text dimColor>Secure secrets management with selective encryption</Text>
  </Box>
</Box>
```

### Bad ❌
```typescript
// Excessive decoration
<Box flexDirection="column" marginBottom={1}>
  <Box>
    <Text bold color="cyan">
      ═══════════════════════════════════════════════════
    </Text>
  </Box>
  <Box>
    <Text bold color="cyan">║</Text>
    <Text bold color="magenta">PARMA</Text>
    <Text bold color="cyan">║</Text>
  </Box>
  <Box>
    <Text bold color="cyan">
      ═══════════════════════════════════════════════════
    </Text>
  </Box>
</Box>
```

## Summary

Write code that is:
- **Clean** - easy to read and understand
- **Practical** - solves real problems
- **Maintainable** - organized and well-structured
- **Minimal** - no unnecessary complexity

*Dobry, czysty kod bez bzdetów* 👍