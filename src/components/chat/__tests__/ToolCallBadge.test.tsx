import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallBadge, getLabel } from "../ToolCallBadge";

afterEach(() => {
  cleanup();
});

// --- getLabel unit tests ---

test("getLabel: str_replace_editor create", () => {
  expect(getLabel("str_replace_editor", { command: "create", path: "src/components/Button.tsx" })).toBe("Creating Button.tsx");
});

test("getLabel: str_replace_editor str_replace", () => {
  expect(getLabel("str_replace_editor", { command: "str_replace", path: "src/components/Card.tsx" })).toBe("Editing Card.tsx");
});

test("getLabel: str_replace_editor insert", () => {
  expect(getLabel("str_replace_editor", { command: "insert", path: "src/App.tsx" })).toBe("Editing App.tsx");
});

test("getLabel: str_replace_editor view", () => {
  expect(getLabel("str_replace_editor", { command: "view", path: "src/index.ts" })).toBe("Reading index.ts");
});

test("getLabel: str_replace_editor undo_edit", () => {
  expect(getLabel("str_replace_editor", { command: "undo_edit", path: "src/utils.ts" })).toBe("Undoing edit in utils.ts");
});

test("getLabel: file_manager delete", () => {
  expect(getLabel("file_manager", { command: "delete", path: "src/old/Legacy.tsx" })).toBe("Deleting Legacy.tsx");
});

test("getLabel: file_manager rename", () => {
  expect(getLabel("file_manager", { command: "rename", path: "src/Foo.tsx", new_path: "src/Bar.tsx" })).toBe("Renaming Foo.tsx to Bar.tsx");
});

test("getLabel: unknown tool falls back to tool name", () => {
  expect(getLabel("some_unknown_tool", {})).toBe("some_unknown_tool");
});

test("getLabel: uses filename only, not full path", () => {
  expect(getLabel("str_replace_editor", { command: "create", path: "a/b/c/deep/File.tsx" })).toBe("Creating File.tsx");
});

// --- ToolCallBadge render tests ---

test("ToolCallBadge shows human-friendly label for create", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "src/Button.tsx" }}
      state="result"
    />
  );
  expect(screen.getByText("Creating Button.tsx")).toBeDefined();
});

test("ToolCallBadge shows human-friendly label for str_replace", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "str_replace", path: "src/Card.tsx" }}
      state="result"
    />
  );
  expect(screen.getByText("Editing Card.tsx")).toBeDefined();
});

test("ToolCallBadge shows spinner when not done", () => {
  const { container } = render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "src/Button.tsx" }}
      state="call"
    />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("ToolCallBadge shows green dot when done", () => {
  const { container } = render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "src/Button.tsx" }}
      state="result"
    />
  );
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeNull();
});

test("ToolCallBadge shows file_manager delete label", () => {
  render(
    <ToolCallBadge
      toolName="file_manager"
      args={{ command: "delete", path: "src/OldComponent.tsx" }}
      state="result"
    />
  );
  expect(screen.getByText("Deleting OldComponent.tsx")).toBeDefined();
});
