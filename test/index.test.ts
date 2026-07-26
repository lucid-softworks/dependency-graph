import { describe, expect, it } from "vitest";

import { DependencyCycleError, DependencyGraph } from "../src/index.js";

describe("DependencyGraph", () => {
  it("adds nodes and dependencies idempotently", () => {
    const graph = new DependencyGraph(["build"]);
    graph.addNode("build").addDependency("test", "build");
    expect(graph.size).toBe(2);
    expect(graph.has("test")).toBe(true);
    expect([...graph.dependenciesOf("test")]).toEqual(["build"]);
    expect([...graph.dependentsOf("build")]).toEqual(["test"]);
  });

  it("returns stable layers and topological order", () => {
    const graph = new DependencyGraph<string>();
    graph
      .addDependency("publish", "test")
      .addDependency("publish", "build")
      .addDependency("test", "build")
      .addNode("lint");
    expect(graph.layers()).toEqual([["build", "lint"], ["test"], ["publish"]]);
    expect(graph.topologicalSort()).toEqual([
      "build",
      "lint",
      "test",
      "publish",
    ]);
  });

  it("reports cycles with remaining nodes", () => {
    const graph = new DependencyGraph<string>();
    graph.addDependency("a", "b").addDependency("b", "a");
    expect(() => graph.layers()).toThrow(DependencyCycleError);
    expect(() => graph.layers()).toThrow(
      expect.objectContaining({ nodes: ["a", "b"] }),
    );
  });

  it("removes nodes and incoming edges", () => {
    const graph = new DependencyGraph<string>();
    graph.addDependency("a", "b");
    expect(graph.remove("missing")).toBe(false);
    expect(graph.remove("b")).toBe(true);
    expect([...graph.dependenciesOf("a")]).toEqual([]);
  });

  it("rejects queries for unknown nodes", () => {
    const graph = new DependencyGraph<string>();
    expect(() => graph.dependenciesOf("x")).toThrow("Unknown");
    expect(() => graph.dependentsOf("x")).toThrow("Unknown");
  });
});
