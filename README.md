# `@lucid-softworks/dependency-graph`

A typed directed dependency graph with stable topological sorting, parallelizable
layers, dependency/dependent queries, removal, and cycle reporting.

```ts
const graph = new DependencyGraph<string>();
graph.addDependency("test", "build");
graph.layers(); // [["build"], ["test"]]
```

Cycles throw `DependencyCycleError` containing the remaining cyclic nodes.
