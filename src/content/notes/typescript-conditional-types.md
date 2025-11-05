---
title: "TypeScript Conditional Types for API Responses"
pubDate: 2025-11-03
tags: ["typescript", "types"]
---

Quick pattern I keep using for API responses that can be either successful or error states:

```typescript
type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// Helper to narrow the type
function isSuccess<T>(response: ApiResponse<T>): response is { success: true; data: T } {
  return response.success === true;
}

// Usage
const result: ApiResponse<User> = await fetchUser();

if (isSuccess(result)) {
  // TypeScript knows result.data exists here
  console.log(result.data.name);
} else {
  // And knows result.error exists here
  console.error(result.error);
}
```

The type guard makes the discriminated union much nicer to work with. No need for optional chaining or non-null assertions.
